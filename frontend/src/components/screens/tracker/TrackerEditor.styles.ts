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
    padding: 20px;
`;

export const EditorModal = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: 768px) {
        width: 95%;
        max-height: 95vh;
    }
`;

export const EditorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
`;

export const EditorTitle = styled.h2`
    color: ${darkTheme.accent};
    font-size: 16px;
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
    padding: 16px;
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
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const Label = styled.label`
    color: ${darkTheme.text.color};
    font-size: 13px;
    font-weight: 600;
`;

export const Input = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 14px;
    padding: 8px 10px;
    outline: none;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }
`;

export const TextArea = styled.textarea`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    padding: 8px 10px;
    outline: none;
    resize: vertical;
    min-height: 60px;
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
`;

export const Select = styled.select`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 14px;
    padding: 8px 10px;
    outline: none;
    font-family: inherit;
    cursor: pointer;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    option {
        background: ${darkTheme.backgroundDarkest};
    }
`;

export const TypeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

export const TypeCard = styled.div<{ $selected: boolean }>`
    background: ${props => props.$selected ? darkTheme.accent + '20' : darkTheme.backgroundDarker};
    border: 1px solid ${props => props.$selected ? darkTheme.accent : darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;

    &:hover {
        border-color: ${darkTheme.accent};
        background: ${darkTheme.accent}10;
    }

    .material-symbols-outlined {
        font-size: 24px;
        color: ${props => props.$selected ? darkTheme.accent : darkTheme.text.color};
    }

    span {
        font-size: 11px;
        font-weight: 600;
        color: ${props => props.$selected ? darkTheme.accent : darkTheme.text.color};
        text-align: center;
    }
`;

export const ConfigSection = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

export const ConfigTitle = styled.div`
    color: ${darkTheme.accent};
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const ConfigRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const CheckboxGroup = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: ${darkTheme.text.color};
    font-size: 13px;

    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: ${darkTheme.accent};
    }
`;

export const EditorFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
`;

export const ArchiveButton = styled.button`
    background: transparent;
    border: 1px solid ${darkTheme.border};
    color: ${darkTheme.text.color};
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;

    &:hover {
        background: ${darkTheme.backgroundDarker};
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const FooterActions = styled.div`
    display: flex;
    gap: 8px;

    @media (max-width: 768px) {
        flex: 1;
    }
`;

export const EditorButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 8px 16px;
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
        flex: 1;
        justify-content: center;
    }
`;

export const HelpText = styled.div`
    font-size: 11px;
    opacity: 0.6;
    color: ${darkTheme.text.color};
    margin-top: 4px;
`;