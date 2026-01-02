import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
import { pipeline } from '@xenova/transformers';

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
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    border-radius: 4px;
    padding: 12px;
    margin-top: 12px;
    color: #e74c3c;
    font-size: 12px;
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

        // Check if model is already cached
        const checkModelCache = async () => {
            try {
                const cache = await caches.open('transformers-cache');
                const keys = await cache.keys();
                const hasModel = keys.some(key => key.url.includes('whisper-tiny.en'));
                
                if (!hasModel) {
                    console.log('Whisper model not cached yet - will download on first use');
                }
            } catch (err) {
                console.log('Cache check failed:', err);
            }
        };

        checkModelCache();
    }, []);

    const initializeTranscriber = async () => {
        if (transcriberRef.current) return;

        setIsModelLoading(true);
        setDownloadProgress(0);
        setError(null);

        try {
            // Create transcriber with progress callback
            transcriberRef.current = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny.en',
                {
                    progress_callback: (progress: any) => {
                        if (progress.status === 'progress') {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            setDownloadProgress(percent);
                        }
                    }
                }
            );
            
            setIsModelLoading(false);
            console.log('Whisper model loaded successfully');
        } catch (err) {
            console.error('Failed to load Whisper model:', err);
            setError('Failed to load speech recognition model. Please refresh and try again.');
            setIsModelLoading(false);
            throw err;
        }
    };

    const startRecording = async () => {
        try {
            setError(null);
            
            // Request microphone permission and get stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Initialize transcriber if not already done
            if (!transcriberRef.current) {
                await initializeTranscriber();
            }

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
                setError('Microphone access denied. Please allow microphone access to use voice notes.');
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
            
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Transcribe using Whisper
            const result = await transcriberRef.current(arrayBuffer);
            
            if (result && result.text) {
                onTranscriptionComplete(result.text.trim());
            } else {
                setError('No speech detected. Please try again.');
            }
        } catch (err) {
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

    if (!isSupported) {
        return null; // Don't show button if not supported
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
                        Downloading speech recognition model (~40MB). This only happens once.
                    </DownloadText>
                    <ProgressBar>
                        <ProgressFill $progress={downloadProgress} />
                    </ProgressBar>
                    <ProgressPercent>{downloadProgress}%</ProgressPercent>
                </DownloadProgress>
            )}

            {error && (
                <ErrorMessage>
                    <strong>Error:</strong> {error}
                </ErrorMessage>
            )}
        </>
    );
};

export default VoiceRecorder;