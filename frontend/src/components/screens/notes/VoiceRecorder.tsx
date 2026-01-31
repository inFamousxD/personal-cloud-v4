import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
import axios from 'axios';
import { agentApi } from '../../../services/agentApi';

const API_URL = import.meta.env.VITE_API_URL;

const VoiceButtonWrapper = styled.div`
    position: relative;
    display: flex;
    
    @media (max-width: 768px) {
        /* flex: 1; */
    }
`;

const VoiceButton = styled.button<{ $isRecording?: boolean; $isProcessing?: boolean }>`
    background: ${props => 
        props.$isRecording ? '#e74c3c' : 
        props.$isProcessing ? darkTheme.accentOrange : 
        darkTheme.accent};
    color: ${darkTheme.text.accentAlt};
    border-radius: ${props => props.$isRecording ? '4px 0 0 4px' : '4px'};
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: ${props => props.$isProcessing ? 'wait' : 'pointer'};
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    transition: all 0.3s ease;
    flex: 1;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

const CancelButton = styled.button`
    background: #c0392b;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
        background: #a93226;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

const StatusText = styled.span`
    font-size: 11px;
    opacity: 0.9;
    
    @media (max-width: 768px) {
        /* display: none; */
    }
`;

const ErrorMessage = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    border-radius: 4px;
    padding: 16px 40px 16px 16px;
    color: #e74c3c;
    font-size: 12px;
    line-height: 1.5;
    max-width: 400px;
    z-index: 2000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
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
    useAI?: boolean;
}

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionComplete, disabled, useAI = true }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [serviceAvailable, setServiceAvailable] = useState(false);
    const [aiAvailable, setAiAvailable] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        checkSupport();
    }, []);

    const checkSupport = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setIsSupported(false);
            return;
        }

        try {
            // Check Whisper service
            await axios.get(`${API_URL}/api/whisper/health`, {
                headers: getAuthHeader(),
                timeout: 3000
            });
            setServiceAvailable(true);
            setIsSupported(true);

            // Check AI service
            if (useAI) {
                try {
                    await agentApi.checkHealth();
                    setAiAvailable(true);
                } catch {
                    setAiAvailable(false);
                }
            }
        } catch (err) {
            console.error('Whisper service unavailable:', err);
            setServiceAvailable(false);
            setIsSupported(false);
        }
    };

    const generateTitleFromText = (text: string): string => {
        const cleaned = text.trim();
        const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length === 0) return 'Voice Note';
        
        let title = sentences[0].trim();
        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }
        
        return title;
    };

    const startRecording = async () => {
        try {
            setError(null);
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            audioChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                await processRecording();
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access denied.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found.');
            } else {
                setError(`Recording failed: ${err.message}`);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            audioChunksRef.current = [];
            
            if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    const processRecording = async () => {
        setIsProcessing(true);

        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            if (audioBlob.size < 1000) {
                setError('Recording too short.');
                setIsProcessing(false);
                return;
            }
            
            // Step 1: Transcribe audio
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const transcriptionResponse = await axios.post(
                `${API_URL}/api/whisper/transcribe`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 30000
                }
            );

            const transcription = transcriptionResponse.data.text?.trim();
            
            if (!transcription || transcription.length === 0) {
                setError('No speech detected.');
                setIsProcessing(false);
                return;
            }

            // Step 2: Generate note using AI if available
            if (useAI && aiAvailable) {
                try {
                    const noteData = await agentApi.generateNote({ transcription });
                    
                    // Return structured note data
                    onTranscriptionComplete(JSON.stringify({
                        title: noteData.title,
                        content: noteData.content,
                        tags: ['ai', 'voice'],
                        useAI: true
                    }));
                } catch (aiError) {
                    console.error('AI generation failed, falling back to basic transcription:', aiError);
                    
                    // Fallback to basic transcription
                    const title = generateTitleFromText(transcription);
                    onTranscriptionComplete(JSON.stringify({
                        title,
                        content: transcription,
                        tags: ['voice'],
                        useAI: false
                    }));
                }
            } else {
                // No AI available, use basic transcription
                const title = generateTitleFromText(transcription);
                onTranscriptionComplete(JSON.stringify({
                    title,
                    content: transcription,
                    tags: ['voice'],
                    useAI: false
                }));
            }
        } catch (err: any) {
            console.error('Transcription failed:', err);
            
            if (err.code === 'ECONNABORTED') {
                setError('Transcription timeout. Try shorter recording.');
            } else if (err.response?.status === 503) {
                setError('Transcription service unavailable.');
            } else {
                setError('Transcription failed.');
            }
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
        if (isProcessing) {
            if (aiAvailable && useAI) {
                return 'Generating...';
            }
            return 'Processing...';
        }
        if (isRecording) return 'Stop';
        const isMobile = window.innerWidth <= 768;
        return useAI ? isMobile ? 'VN (AI)' : 'Voice Note (AI)' : isMobile ? 'Voice' : 'Voice Note';
    };

    const getButtonIcon = () => {
        if (isProcessing) return 'pending';
        if (isRecording) return 'stop_circle';
        return 'mic';
    };

    const getButtonTitle = () => {
        if (!serviceAvailable) return 'Voice service unavailable';
        if (aiAvailable && useAI) return 'Record AI-enhanced voice note';
        return 'Record voice note';
    };

    return (
        <>
            <VoiceButtonWrapper>
                <VoiceButton
                    onClick={handleClick}
                    disabled={disabled || isProcessing || !serviceAvailable}
                    $isRecording={isRecording}
                    $isProcessing={isProcessing}
                    title={getButtonTitle()}
                >
                    <span className="material-symbols-outlined">{getButtonIcon()}</span>
                    <StatusText>{getButtonText()}</StatusText>
                </VoiceButton>
                {isRecording && (
                    <CancelButton onClick={cancelRecording} title="Cancel recording">
                        <span className="material-symbols-outlined">close</span>
                    </CancelButton>
                )}
            </VoiceButtonWrapper>

            {error && (
                <ErrorMessage>
                    <CloseButton onClick={() => setError(null)}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                    <strong>Voice Note Error</strong>
                    <br />
                    {error}
                </ErrorMessage>
            )}
        </>
    );
};

export default VoiceRecorder;