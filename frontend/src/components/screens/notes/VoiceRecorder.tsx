import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const VoiceButton = styled.button<{ $isRecording?: boolean }>`
    background: ${props => props.$isRecording ? '#e74c3c' : darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    position: relative;
    transition: all 0.3s ease;

    ${props => props.$isRecording && `
        animation: pulse 1.5s ease-in-out infinite;
    `}

    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
        }
        50% {
            box-shadow: 0 0 0 8px rgba(231, 76, 60, 0);
        }
    }

    @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
    }
`;

const StatusText = styled.span`
    font-size: 11px;
    opacity: 0.9;
    
    @media (max-width: 768px) {
        display: none;
    }
`;

const ListeningIndicator = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 24px;
    z-index: 2000;
    min-width: 300px;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    text-align: center;
`;

const ListeningTitle = styled.h3`
    color: ${darkTheme.accent};
    margin: 0 0 12px 0;
    font-size: 16px;
`;

const TranscriptPreview = styled.div`
    color: ${darkTheme.text.color};
    font-size: 13px;
    opacity: 0.8;
    line-height: 1.4;
    min-height: 60px;
    max-height: 150px;
    overflow-y: auto;
    padding: 12px;
    background: ${darkTheme.backgroundDarker};
    border-radius: 4px;
    margin-top: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;

    &:empty::before {
        content: 'Listening...';
        opacity: 0.5;
        font-style: italic;
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarkest};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }
`;

const ErrorMessage = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    border-radius: 4px;
    padding: 16px;
    color: #e74c3c;
    font-size: 12px;
    line-height: 1.4;
    max-width: 400px;
    z-index: 2000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    strong {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    background: transparent;
    border: none;
    color: #e74c3c;
    cursor: pointer;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

const StopButton = styled.button`
    margin-top: 16px;
    padding: 8px 16px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
        background: #c0392b;
    }
`;

interface VoiceRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    disabled?: boolean;
}

// Declare the webkit-prefixed SpeechRecognition for TypeScript
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete, disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);
    
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        // Check browser support for Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setIsSupported(false);
            console.warn('Web Speech API is not supported in this browser');
            return;
        }

        // Initialize speech recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = finalTranscriptRef.current;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPiece + ' ';
                    finalTranscriptRef.current = finalTranscript;
                } else {
                    interimTranscript += transcriptPiece;
                }
            }

            // Update the transcript display
            const displayText = (finalTranscript + interimTranscript).trim();
            setTranscript(displayText);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            
            let errorMessage = 'Speech recognition error. ';
            
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again and speak clearly.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please connect a microphone and try again.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Speech recognition requires an internet connection.';
                    break;
                case 'aborted':
                    // Don't show error for user-initiated stops
                    return;
                default:
                    errorMessage += event.error;
            }
            
            setError(errorMessage);
            setIsRecording(false);
        };

        recognition.onend = () => {
            // Don't auto-restart or do anything - just let it end
            console.log('Speech recognition ended');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors on cleanup
                }
            }
        };
    }, []);

    const startRecording = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not available. This feature requires Chrome, Edge, or Safari.');
            return;
        }

        try {
            setError(null);
            setTranscript('');
            finalTranscriptRef.current = '';
            recognitionRef.current.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            if (err.message.includes('already started')) {
                // Recognition is already running, just mark as recording
                setIsRecording(true);
            } else {
                setError('Failed to start speech recognition. Please try again.');
            }
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                console.error('Error stopping recognition:', err);
            }
            
            // Process the final transcript
            const finalText = finalTranscriptRef.current.trim();
            if (finalText.length > 0) {
                onTranscriptionComplete(finalText);
                setTranscript('');
                finalTranscriptRef.current = '';
            } else {
                setError('No speech detected. Please try again.');
            }
            
            setIsRecording(false);
        }
    };

    const handleClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    if (!isSupported) {
        return null;
    }

    const getButtonText = () => {
        if (isRecording) return 'Stop Recording';
        return 'Voice Note';
    };

    const getButtonIcon = () => {
        if (isRecording) return 'stop_circle';
        return 'mic';
    };

    return (
        <>
            <VoiceButton
                onClick={handleClick}
                disabled={disabled}
                $isRecording={isRecording}
                title={isRecording ? 'Click to stop recording' : 'Click to start voice note'}
            >
                <span className="material-symbols-outlined">{getButtonIcon()}</span>
                <StatusText>{getButtonText()}</StatusText>
            </VoiceButton>

            {isRecording && (
                <ListeningIndicator>
                    <ListeningTitle>🎤 Listening...</ListeningTitle>
                    <TranscriptPreview>
                        {transcript || ''}
                    </TranscriptPreview>
                    <StopButton onClick={stopRecording}>
                        Stop & Save
                    </StopButton>
                </ListeningIndicator>
            )}

            {error && (
                <ErrorMessage>
                    <CloseButton onClick={() => setError(null)}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                    <strong>Voice Note Error</strong>
                    {error}
                </ErrorMessage>
            )}
        </>
    );
};

export default VoiceRecorder;