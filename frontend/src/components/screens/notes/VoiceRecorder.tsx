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
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    border-radius: 4px;
    padding: 12px;
    margin-top: 12px;
    color: #e74c3c;
    font-size: 12px;
    line-height: 1.4;
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
    const pipelineRef = useRef<any>(null);
    const envRef = useRef<any>(null);

    useEffect(() => {
        // Check browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsSupported(false);
            return;
        }

        // Preload the pipeline function
        const preloadPipeline = async () => {
            try {
                const transformers = await import('@xenova/transformers');
                pipelineRef.current = transformers.pipeline;
                envRef.current = transformers.env;
                
                // Configure environment for better CDN access
                if (envRef.current) {
                    // Use jsdelivr CDN as fallback
                    envRef.current.useBrowserCache = true;
                    envRef.current.allowLocalModels = false;
                    envRef.current.allowRemoteModels = true;
                }
                
                console.log('Pipeline function loaded');
            } catch (err) {
                console.error('Failed to load transformers library:', err);
                setError('Failed to load speech recognition library. Please refresh the page.');
            }
        };

        preloadPipeline();
    }, []);

    const initializeTranscriber = async () => {
        if (transcriberRef.current) return;

        setIsModelLoading(true);
        setDownloadProgress(0);
        setLoadingStatus('Preparing to download model...');
        setError(null);

        try {
            // Load pipeline if not already loaded
            if (!pipelineRef.current) {
                setLoadingStatus('Loading transformers library...');
                const transformers = await import('@xenova/transformers');
                pipelineRef.current = transformers.pipeline;
                envRef.current = transformers.env;
                
                if (envRef.current) {
                    envRef.current.useBrowserCache = true;
                    envRef.current.allowLocalModels = false;
                    envRef.current.allowRemoteModels = true;
                }
            }

            setLoadingStatus('Downloading speech model (40MB)...');

            // Create transcriber with progress callback and better error handling
            transcriberRef.current = await pipelineRef.current(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny.en',
                {
                    quantized: true, // Use quantized version for smaller size
                    progress_callback: (progress: any) => {
                        if (progress.status === 'progress' && progress.total) {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            setDownloadProgress(percent);
                            
                            // Update status based on file being downloaded
                            if (progress.file) {
                                const fileName = progress.file.split('/').pop();
                                setLoadingStatus(`Downloading ${fileName}... (${percent}%)`);
                            }
                        } else if (progress.status === 'done') {
                            setLoadingStatus('Model loaded successfully!');
                        } else if (progress.status === 'initiate') {
                            setLoadingStatus('Starting download...');
                        }
                    },
                    // Additional options for better error handling
                    device: 'auto',
                    dtype: 'fp32'
                }
            );
            
            setIsModelLoading(false);
            console.log('Whisper model loaded successfully');
        } catch (err: any) {
            console.error('Failed to load Whisper model:', err);
            
            // Provide specific error messages based on error type
            let errorMessage = 'Failed to load speech recognition model. ';
            
            if (err.message?.includes('JSON')) {
                errorMessage += 'Network error - model files could not be downloaded. Please check your internet connection and try again.';
            } else if (err.message?.includes('fetch')) {
                errorMessage += 'Could not connect to model server. Please check your internet connection.';
            } else if (err.message?.includes('CORS')) {
                errorMessage += 'Browser security blocked the download. Please try refreshing the page.';
            } else {
                errorMessage += 'Please refresh the page and try again. If the problem persists, try using a different browser.';
            }
            
            setError(errorMessage);
            setIsModelLoading(false);
            throw err;
        }
    };

    const startRecording = async () => {
        try {
            setError(null);
            
            // Request microphone permission and get stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            
            // Initialize transcriber if not already done
            if (!transcriberRef.current) {
                await initializeTranscriber();
            }

            // Create MediaRecorder
            audioChunksRef.current = [];
            
            // Try to use the best available codec
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm';
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = ''; // Use default
            }
            
            const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            
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
                setError('Microphone access denied. Please allow microphone access in your browser settings to use voice notes.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone and try again.');
            } else if (err.message?.includes('JSON') || err.message?.includes('fetch')) {
                // Model loading failed, show appropriate error
                return;
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
            if (audioBlob.size < 1000) { // Less than 1KB is likely too short
                setError('Recording too short. Please try again and speak for at least 2-3 seconds.');
                setIsProcessing(false);
                return;
            }
            
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            // Transcribe using Whisper
            const result = await transcriberRef.current(arrayBuffer, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe'
            });
            
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
            
            let errorMessage = 'Failed to process recording. ';
            if (err.message?.includes('audio')) {
                errorMessage += 'Audio format not supported. Please try using a different browser.';
            } else {
                errorMessage += 'Please try again.';
            }
            
            setError(errorMessage);
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