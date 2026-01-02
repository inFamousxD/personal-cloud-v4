import React, { useState } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const QuickNoteButton = styled.button`
    background: ${darkTheme.accent};
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
    transition: all 0.3s ease;

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

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ModalTitle = styled.h3`
    color: ${darkTheme.accent};
    margin: 0;
    font-size: 16px;
`;

const TextArea = styled.textarea`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    padding: 12px;
    outline: none;
    resize: vertical;
    min-height: 150px;
    line-height: 1.5;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;

    ${props => props.$variant === 'primary' ? `
        background: ${darkTheme.accent};
        color: white;

        &:hover {
            opacity: 0.9;
        }
    ` : `
        background: transparent;
        color: ${darkTheme.text.color};
        border: 1px solid ${darkTheme.border};

        &:hover {
            background: ${darkTheme.backgroundDarker};
        }
    `}
`;

interface SimpleVoiceNoteProps {
    onTranscriptionComplete: (text: string) => void;
    disabled?: boolean;
}

const SimpleVoiceNote: React.FC<SimpleVoiceNoteProps> = ({ onTranscriptionComplete, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');

    const handleOpen = () => {
        setIsOpen(true);
        setText('');
    };

    const handleClose = () => {
        setIsOpen(false);
        setText('');
    };

    const handleSave = () => {
        const trimmedText = text.trim();
        if (trimmedText.length > 0) {
            onTranscriptionComplete(trimmedText);
            handleClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <>
            <QuickNoteButton
                onClick={handleOpen}
                disabled={disabled}
                title="Quick text note"
            >
                <span className="material-symbols-outlined">edit_note</span>
                <StatusText>Quick Note</StatusText>
            </QuickNoteButton>

            {isOpen && (
                <Modal onClick={handleClose}>
                    <ModalContent onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
                        <ModalTitle>📝 Quick Note</ModalTitle>
                        <TextArea
                            placeholder="Type your note here... (Ctrl+Enter to save)"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            autoFocus
                        />
                        <ButtonGroup>
                            <Button $variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button 
                                $variant="primary" 
                                onClick={handleSave}
                                disabled={text.trim().length === 0}
                            >
                                Save Note
                            </Button>
                        </ButtonGroup>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
};

export default SimpleVoiceNote;