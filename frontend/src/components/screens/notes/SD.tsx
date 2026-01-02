import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const DiagnosticContainer = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 20px;
    margin: 20px;
    max-width: 600px;
`;

const DiagnosticTitle = styled.h3`
    color: ${darkTheme.accent};
    margin: 0 0 16px 0;
`;

const DiagnosticItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid ${darkTheme.border};

    &:last-child {
        border-bottom: none;
    }
`;

const Status = styled.span<{ $status: 'pass' | 'fail' | 'warning' }>`
    font-size: 20px;
    
    ${props => props.$status === 'pass' && 'color: #27ae60;'}
    ${props => props.$status === 'fail' && 'color: #e74c3c;'}
    ${props => props.$status === 'warning' && 'color: #f39c12;'}
`;

const Label = styled.div`
    flex: 1;
    color: ${darkTheme.text.color};
    font-size: 13px;
`;

const TestButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 16px;

    &:hover {
        opacity: 0.9;
    }
`;

const ResultBox = styled.pre`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    margin-top: 16px;
    font-size: 11px;
    color: ${darkTheme.text.color};
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
`;

const SpeechDiagnostic: React.FC = () => {
    const [diagnostics, setDiagnostics] = useState({
        speechRecognitionAvailable: false,
        isSecureContext: false,
        protocol: '',
        hostname: '',
        micPermission: 'unknown',
        browser: '',
        userAgent: ''
    });
    const [testResult, setTestResult] = useState<string>('');
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        // Check if SpeechRecognition is available
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        // Detect browser
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';

        // Check microphone permission
        let micPermission = 'unknown';
        try {
            const result = await navigator.permissions.query({ name: 'microphone' as any });
            micPermission = result.state;
        } catch (e) {
            micPermission = 'cannot check (permissions API unavailable)';
        }

        setDiagnostics({
            speechRecognitionAvailable: !!SpeechRecognition,
            isSecureContext: window.isSecureContext,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            micPermission,
            browser,
            userAgent: ua
        });
    };

    const testSpeechRecognition = () => {
        setIsTesting(true);
        setTestResult('Starting test...\n');

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setTestResult('❌ FAIL: SpeechRecognition not available in this browser');
            setIsTesting(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let log = 'Creating SpeechRecognition instance... ✓\n';
        setTestResult(log);

        recognition.onstart = () => {
            log += 'Recognition started! ✓\n';
            log += 'Listening for 3 seconds...\n';
            setTestResult(log);

            // Auto-stop after 3 seconds
            setTimeout(() => {
                try {
                    recognition.stop();
                    log += 'Stopped recognition\n';
                } catch (e) {
                    log += 'Error stopping: ' + e + '\n';
                }
                setTestResult(log);
            }, 3000);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            log += `✓ SUCCESS! Heard: "${transcript}"\n`;
            setTestResult(log);
            setIsTesting(false);
        };

        recognition.onerror = (event: any) => {
            log += `❌ ERROR: ${event.error}\n`;
            log += `Error message: ${event.message || 'none'}\n`;
            
            // Detailed error explanation
            switch (event.error) {
                case 'network':
                    log += '\nNETWORK ERROR EXPLANATION:\n';
                    log += '- This usually means the browser cannot reach Google\'s speech service\n';
                    log += '- Common causes:\n';
                    log += '  1. Not using HTTPS (except localhost)\n';
                    log += '  2. Firewall blocking speech.googleapis.com\n';
                    log += '  3. Corporate/school network blocking Google services\n';
                    log += '  4. VPN interfering with connection\n';
                    log += '  5. Browser policy blocking feature\n';
                    break;
                case 'not-allowed':
                    log += '\nPERMISSION DENIED:\n';
                    log += '- Microphone permission was denied\n';
                    log += '- Click the lock icon in address bar to change permissions\n';
                    break;
                case 'no-speech':
                    log += '\nNO SPEECH DETECTED:\n';
                    log += '- Microphone is working but no speech was detected\n';
                    break;
                case 'audio-capture':
                    log += '\nAUDIO CAPTURE ERROR:\n';
                    log += '- No microphone found or microphone is being used by another app\n';
                    break;
                case 'service-not-allowed':
                    log += '\nSERVICE NOT ALLOWED:\n';
                    log += '- Speech recognition service is not allowed in this context\n';
                    log += '- Must use HTTPS (localhost is exception)\n';
                    break;
            }
            
            setTestResult(log);
            setIsTesting(false);
        };

        recognition.onend = () => {
            log += 'Recognition ended\n';
            setTestResult(log);
            setIsTesting(false);
        };

        try {
            log += 'Calling recognition.start()...\n';
            setTestResult(log);
            recognition.start();
        } catch (error: any) {
            log += `❌ Exception when starting: ${error.message}\n`;
            setTestResult(log);
            setIsTesting(false);
        }
    };

    const getStatus = (value: boolean | string): 'pass' | 'fail' | 'warning' => {
        if (typeof value === 'boolean') return value ? 'pass' : 'fail';
        if (value === 'granted') return 'pass';
        if (value === 'denied') return 'fail';
        return 'warning';
    };

    return (
        <DiagnosticContainer>
            <DiagnosticTitle>🔍 Speech Recognition Diagnostic</DiagnosticTitle>
            
            <DiagnosticItem>
                <Status $status={getStatus(diagnostics.speechRecognitionAvailable)}>
                    {diagnostics.speechRecognitionAvailable ? '✓' : '✗'}
                </Status>
                <Label>
                    <strong>SpeechRecognition API:</strong> {diagnostics.speechRecognitionAvailable ? 'Available' : 'Not Available'}
                </Label>
            </DiagnosticItem>

            <DiagnosticItem>
                <Status $status={getStatus(diagnostics.isSecureContext)}>
                    {diagnostics.isSecureContext ? '✓' : '✗'}
                </Status>
                <Label>
                    <strong>Secure Context:</strong> {diagnostics.isSecureContext ? 'Yes (HTTPS or localhost)' : 'No (requires HTTPS)'}
                </Label>
            </DiagnosticItem>

            <DiagnosticItem>
                <Status $status={diagnostics.protocol === 'https:' || diagnostics.hostname === 'localhost' || diagnostics.hostname === '127.0.0.1' ? 'pass' : 'fail'}>
                    {diagnostics.protocol === 'https:' || diagnostics.hostname === 'localhost' ? '✓' : '✗'}
                </Status>
                <Label>
                    <strong>Protocol:</strong> {diagnostics.protocol} on {diagnostics.hostname}
                </Label>
            </DiagnosticItem>

            <DiagnosticItem>
                <Status $status={getStatus(diagnostics.micPermission)}>
                    {diagnostics.micPermission === 'granted' ? '✓' : diagnostics.micPermission === 'denied' ? '✗' : '?'}
                </Status>
                <Label>
                    <strong>Microphone Permission:</strong> {diagnostics.micPermission}
                </Label>
            </DiagnosticItem>

            <DiagnosticItem>
                <Status $status={diagnostics.browser === 'Firefox' ? 'fail' : 'pass'}>
                    {diagnostics.browser === 'Firefox' ? '✗' : '✓'}
                </Status>
                <Label>
                    <strong>Browser:</strong> {diagnostics.browser}
                    {diagnostics.browser === 'Firefox' && ' (not supported)'}
                </Label>
            </DiagnosticItem>

            <TestButton onClick={testSpeechRecognition} disabled={isTesting}>
                {isTesting ? 'Testing... Speak Now!' : 'Test Speech Recognition'}
            </TestButton>

            {testResult && (
                <ResultBox>{testResult}</ResultBox>
            )}

            <ResultBox>
                <strong>User Agent:</strong>
                {'\n' + diagnostics.userAgent}
            </ResultBox>
        </DiagnosticContainer>
    );
};

export default SpeechDiagnostic;