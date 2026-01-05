import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const EditorOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
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
    max-width: 650px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

    @media (max-width: 768px) {
        width: 95%;
        max-height: 95vh;
    }
`;

export const EditorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
`;

export const EditorTitle = styled.h2`
    color: ${darkTheme.accent};
    font-size: 18px;
    font-weight: 600;
    margin: 0;
`;

export const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        opacity: 1;
        background: ${darkTheme.backgroundDarker};
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const EditorBody = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
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
        border-radius: 4px;

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
    opacity: 0.9;
`;

export const Input = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 14px;
    padding: 10px 12px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.35;
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
    padding: 10px 12px;
    outline: none;
    resize: vertical;
    min-height: 60px;
    font-family: inherit;
    transition: border-color 0.2s;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.35;
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
        border-radius: 4px;

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
    padding: 10px 12px;
    outline: none;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.2s;
    flex: 1;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    option {
        background: ${darkTheme.backgroundDarkest};
    }
`;

export const TypeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const TypeCard = styled.div<{ $selected: boolean }>`
    background: ${props => props.$selected ? darkTheme.accent + '15' : darkTheme.backgroundDarker};
    border: 1px solid ${props => props.$selected ? darkTheme.accent : darkTheme.border};
    border-radius: 4px;
    padding: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;

    &:hover {
        border-color: ${darkTheme.accent};
        background: ${darkTheme.accent}10;
    }

    .material-symbols-outlined {
        font-size: 28px;
        color: ${props => props.$selected ? darkTheme.accent : darkTheme.text.color};
        opacity: ${props => props.$selected ? 1 : 0.6};
        flex-shrink: 0;
    }

    > div {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    span {
        font-size: 13px;
        font-weight: 600;
        color: ${props => props.$selected ? darkTheme.accent : darkTheme.text.color};
    }

    small {
        font-size: 11px;
        color: ${darkTheme.text.color};
        opacity: 0.5;
    }
`;

export const ConfigSection = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    gap: 10px;
    cursor: pointer;
    color: ${darkTheme.text.color};
    font-size: 13px;
    padding: 10px 12px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        border-color: ${darkTheme.accent}60;
    }

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: ${darkTheme.accent};
    }
`;

export const EditorFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
`;

export const ArchiveButton = styled.button`
    background: transparent;
    border: 1px solid ${darkTheme.border};
    color: ${darkTheme.text.color};
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    transition: all 0.2s;

    &:hover {
        background: ${darkTheme.backgroundDarker};
        border-color: ${darkTheme.accent};
        color: ${darkTheme.accent};
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const FooterActions = styled.div`
    display: flex;
    gap: 10px;

    @media (max-width: 768px) {
        flex: 1;
    }
`;

export const EditorButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    font-family: inherit;
    transition: all 0.2s;

    ${props => props.variant === 'primary' ? `
        background: ${darkTheme.accent};
        color: white;

        &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
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
        font-size: 16px;
    }

    @media (max-width: 768px) {
        flex: 1;
        justify-content: center;
    }
`;

export const HelpText = styled.div`
    font-size: 12px;
    opacity: 0.5;
    color: ${darkTheme.text.color};
    margin-top: -4px;
`;

export const SectionDivider = styled.div`
    height: 1px;
    background: ${darkTheme.border};
    margin: 4px 0;
    opacity: 0.5;
`;

export const FolderRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

export const InlineAddButton = styled.button`
    background: ${darkTheme.accent}20;
    border: 1px solid ${darkTheme.accent}40;
    color: ${darkTheme.accent};
    border-radius: 4px;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        background: ${darkTheme.accent}30;
        border-color: ${darkTheme.accent};
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;