import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const EditorOverlay = styled.div`
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

export const EditorModal = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    width: 90%;
    max-width: 700px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 95%;
        max-height: 90vh;
    }
`;

export const EditorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const EditorTitle = styled.h2`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
`;

export const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const EditorBody = styled.div`
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }
`;

export const EditorInput = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    padding: 8px 10px;
    outline: none;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
        font-weight: 400;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }
`;

export const EditorTextarea = styled.textarea`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    padding: 10px;
    outline: none;
    resize: vertical;
    min-height: 250px;
    line-height: 1.5;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }

    @media (max-width: 768px) {
        min-height: 200px;
    }
`;

export const CharacterCount = styled.div`
    color: ${darkTheme.text.color};
    opacity: 0.4;
    font-size: 11px;
    text-align: right;
`;

export const EditorFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

interface EditorButtonProps {
    variant?: 'primary' | 'secondary';
}

export const EditorButton = styled.button<EditorButtonProps>`
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    font-family: inherit;

    ${props => props.variant === 'primary' ? `
        background: ${darkTheme.accent};
        color: white;

        &:hover:not(:disabled) {
            opacity: 0.9;
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
        }
    `}

    .material-symbols-outlined {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;