import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const EditorOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

export const EditorModal = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.accent}40;
    border-radius: 12px;
    width: 90%;
    max-width: 700px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        width: 95%;
        max-height: 90vh;
    }
`;

export const EditorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid ${darkTheme.border};
    background: linear-gradient(135deg, ${darkTheme.backgroundDarkest} 0%, #252830 100%);
    border-radius: 12px 12px 0 0;
`;

export const EditorTitle = styled.h2`
    color: ${darkTheme.accent};
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
        content: '';
        width: 4px;
        height: 24px;
        background: ${darkTheme.accent};
        border-radius: 2px;
    }
`;

export const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${darkTheme.accent}20;
        color: ${darkTheme.accent};
    }

    .material-symbols-outlined {
        font-size: 24px;
    }
`;

export const EditorBody = styled.div`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
        border-radius: 4px;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }
`;

export const EditorInput = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 2px solid ${darkTheme.border};
    border-radius: 8px;
    color: ${darkTheme.accent};
    font-size: 18px;
    font-weight: 600;
    padding: 14px 16px;
    outline: none;
    transition: all 0.2s ease;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color}60;
        font-weight: 400;
    }

    &:focus {
        border-color: ${darkTheme.accent};
        box-shadow: 0 0 0 3px ${darkTheme.accent}20;
    }
`;

export const EditorTextarea = styled.textarea`
    background: ${darkTheme.backgroundDarker};
    border: 2px solid ${darkTheme.border};
    border-radius: 8px;
    color: ${darkTheme.text.color};
    font-size: 14px;
    padding: 14px 16px;
    outline: none;
    resize: vertical;
    min-height: 250px;
    line-height: 1.6;
    transition: all 0.2s ease;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color}60;
    }

    &:focus {
        border-color: ${darkTheme.accent};
        box-shadow: 0 0 0 3px ${darkTheme.accent}20;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
        border-radius: 4px;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }

    @media (max-width: 768px) {
        min-height: 200px;
    }
`;

export const CharacterCount = styled.div`
    color: ${darkTheme.text.color}60;
    font-size: 12px;
    text-align: right;
`;

export const EditorFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    border-radius: 0 0 12px 12px;

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

interface EditorButtonProps {
    variant?: 'primary' | 'secondary';
}

export const EditorButton = styled.button<EditorButtonProps>`
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    font-family: inherit;

    ${props => props.variant === 'primary' ? `
        background: ${darkTheme.accent};
        color: white;

        &:hover:not(:disabled) {
            background: ${darkTheme.accent}dd;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px ${darkTheme.accent}40;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    ` : `
        background: transparent;
        color: ${darkTheme.text.color};
        border: 1px solid ${darkTheme.border};

        &:hover {
            background: ${darkTheme.backgroundDarker};
            border-color: ${darkTheme.accent};
        }
    `}

    .material-symbols-outlined {
        font-size: 18px;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;