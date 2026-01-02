import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const VoiceButton = styled.button<{ $isRecording?: boolean; $isProcessing?: boolean }>`
    background: ${props => 
        props.$isRecording ? '#e74c3c' : 
        props.$isProcessing ? darkTheme.accent : 
        darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: ${props => props.$isProcessing ? 'not-allowed' : 'pointer'};
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

const DownloadProgress = styled.div`
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
`;

const DownloadTitle = styled.h3`
    color: ${darkTheme.accent};
    margin: 0 0 12px 0;
    font-size: 16px;
`;

const DownloadText = styled.p`
    color: ${darkTheme.text.color};
    margin: 0 0 16px 0;
    font-size: 13px;
    opacity: 0.8;
    line-height: 1.4;
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: ${darkTheme.backgroundDarker};
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
    width: ${props => props.$progress}%;
    height: 100%;
    background: ${darkTheme.accent};
    transition: width 0.3s ease;
`;

const ProgressPercent = styled.div`
    color: ${darkTheme.text.color};
    font-size: 12px;
    text-align: center;
    opacity: 0.6;
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

const RetryButton = styled.button`
    margin-top: 12px;
    padding: 6px 12px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
        background: #c0392b;
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

interface VoiceRecorderProps {
    onTranscriptionComplete: (text: string) => void;
    disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete, disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriberRef = useRef<any>(null);

    useEffect(() => {
        // Check browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsSupported(false);
            return;
        }
    }, []);

    const initializeTranscriber = async () => {
        if (transcriberRef.current) return;

        setIsModelLoading(true);
        setDownloadProgress(0);
        setLoadingStatus('Loading speech recognition...');
        setError(null);

        try {
            // Dynamic import with better error handling
            const { pipeline, env } = await import('@xenova/transformers');
            
            // CRITICAL: Configure environment for Vercel deployment
            // This fixes the "<!doctype" JSON parsing error
            env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
            env.allowRemoteModels = true;
            env.allowLocalModels = false;
            env.useBrowserCache = true;
            
            // Use HuggingFace CDN directly
            env.remoteHost = 'https://huggingface.co';
            env.remotePathTemplate = '{model}/resolve/{revision}/';

            setLoadingStatus('Connecting to model server...');

            // Create transcriber with better configuration
            transcriberRef.current = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny.en',
                {
                    quantized: true,
                    revision: 'main',
                    progress_callback: (progress: any) => {
                        console.log('Progress:', progress);
                        
                        if (progress.status === 'progress' && progress.total) {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            setDownloadProgress(percent);
                            
                            if (progress.file) {
                                const fileName = progress.file.split('/').pop();
                                setLoadingStatus(`Downloading ${fileName}...`);
                            }
                        } else if (progress.status === 'done') {
                            setLoadingStatus('Model loaded!');
                        } else if (progress.status === 'ready') {
                            setLoadingStatus('Initializing model...');
                        } else if (progress.status === 'initiate') {
                            setLoadingStatus('Starting download...');
                        }
                    }
                }
            );
            
            setIsModelLoading(false);
            console.log('Whisper model loaded successfully');
        } catch (err: any) {
            console.error('Failed to load Whisper model:', err);
            console.error('Full error:', err.stack);
            
            let errorMessage = 'Failed to load speech recognition model. ';
            
            // Check for specific errors
            if (err.message?.includes('JSON') || err.message?.includes('<!doctype')) {
                errorMessage = 'CDN configuration issue detected. The model files could not be loaded from the CDN. This is a deployment configuration problem. Possible solutions: (1) Clear browser cache and try again, (2) Try a different network, or (3) The app may need to be redeployed with updated CDN settings.';
            } else if (err.message?.includes('registerBackend')) {
                errorMessage = 'Browser compatibility issue detected. This might be due to: (1) Your browser blocking required features, (2) Running in HTTP instead of HTTPS, or (3) Browser extensions interfering. Try: Refresh the page, use HTTPS, or disable extensions temporarily.';
            } else if (err.message?.includes('404')) {
                errorMessage = 'Model files not found on CDN. Your network may be blocking access to model servers. Options: (1) Check firewall/VPN settings, (2) Try a different network, or (3) Contact your network admin to whitelist cdn.jsdelivr.net and huggingface.co.';
            } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
                errorMessage = 'Network error while downloading models. Please check your internet connection and try again.';
            } else if (err.message?.includes('CORS')) {
                errorMessage = 'Browser security blocked the download. Make sure you\'re accessing the app via HTTPS (not HTTP).';
            } else {
                errorMessage += `Error: ${err.message}. Try refreshing the page or using a different browser (Chrome/Edge recommended).`;
            }
            
            setError(errorMessage);
            setIsModelLoading(false);
            throw err;
        }
    };

    const startRecording = async () => {
        try {
            setError(null);
            
            // Initialize transcriber if not already done - do this FIRST before requesting mic
            if (!transcriberRef.current) {
                try {
                    await initializeTranscriber();
                } catch (modelErr) {
                    // Error already set in initializeTranscriber, just return
                    console.error('Model initialization failed:', modelErr);
                    return; // Don't continue to recording
                }
            }
            
            // Request microphone permission and get stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            // Create MediaRecorder
            audioChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                
                // Process the recording
                await processRecording();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access denied. Please allow microphone access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone and try again.');
            } else {
                setError('Failed to start recording. Please check your microphone and try again.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processRecording = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Create audio blob
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Check if we got any audio
            if (audioBlob.size < 1000) {
                setError('Recording too short. Please try again and speak for at least 2-3 seconds.');
                setIsProcessing(false);
                return;
            }
            
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Transcribe using Whisper
            const result = await transcriberRef.current(arrayBuffer);
            
            if (result && result.text) {
                const transcription = result.text.trim();
                if (transcription.length > 0) {
                    onTranscriptionComplete(transcription);
                } else {
                    setError('No speech detected. Please try again and speak more clearly.');
                }
            } else {
                setError('No speech detected. Please try again.');
            }
        } catch (err: any) {
            console.error('Transcription failed:', err);
            setError('Failed to process recording. Please try again.');
        } finally {
            setIsProcessing(false);
            audioChunksRef.current = [];
        }
    };

    const handleClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleRetry = () => {
        setError(null);
        setIsModelLoading(false);
        transcriberRef.current = null;
        setDownloadProgress(0);
    };

    if (!isSupported) {
        return null;
    }

    const getButtonText = () => {
        if (isProcessing) return 'Processing...';
        if (isRecording) return 'Stop Recording';
        return 'Voice Note';
    };

    const getButtonIcon = () => {
        if (isProcessing) return 'pending';
        if (isRecording) return 'stop_circle';
        return 'mic';
    };

    return (
        <>
            <VoiceButton
                onClick={handleClick}
                disabled={disabled || isProcessing || isModelLoading}
                $isRecording={isRecording}
                $isProcessing={isProcessing}
                title={isRecording ? 'Click to stop recording' : 'Click to start voice note'}
            >
                <span className="material-symbols-outlined">{getButtonIcon()}</span>
                <StatusText>{getButtonText()}</StatusText>
            </VoiceButton>

            {isModelLoading && (
                <DownloadProgress>
                    <DownloadTitle>First Time Setup</DownloadTitle>
                    <DownloadText>
                        {loadingStatus}
                    </DownloadText>
                    {downloadProgress > 0 && (
                        <>
                            <ProgressBar>
                                <ProgressFill $progress={downloadProgress} />
                            </ProgressBar>
                            <ProgressPercent>{downloadProgress}%</ProgressPercent>
                        </>
                    )}
                    <DownloadText style={{ fontSize: '11px', marginTop: '12px', marginBottom: 0 }}>
                        This only happens once. The model will be cached for future use.
                    </DownloadText>
                </DownloadProgress>
            )}

            {error && (
                <ErrorMessage>
                    <CloseButton onClick={() => setError(null)}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                    <strong>Voice Note Error</strong>
                    {error}
                    {error.includes('model') || error.includes('download') || error.includes('network') || error.includes('CDN') ? (
                        <RetryButton onClick={handleRetry}>
                            Retry Model Load
                        </RetryButton>
                    ) : null}
                </ErrorMessage>
            )}
        </>
    );
};

export default VoiceRecorder;