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
        max-height: 95vh;
    }
`;

export const EditorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
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

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const Label = styled.label`
    color: ${darkTheme.text.color};
    font-size: 12px;
    font-weight: 600;
    opacity: 0.8;
`;

export const Input = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 13px;
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
    padding: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;

    &:hover {
        border-color: ${darkTheme.accent};
        background: ${darkTheme.accent}15;
    }

    .material-symbols-outlined {
        font-size: 24px;
        color: ${props => props.$selected ? darkTheme.accent : darkTheme.text.color};
        opacity: ${props => props.$selected ? 1 : 0.6};
    }

    span {
        font-size: 11px;
        font-weight: 600;
        color: ${props => props.$selected ? darkTheme.accent : darkTheme.text.color};
        text-align: center;
    }

    small {
        font-size: 10px;
        color: ${darkTheme.text.color};
        opacity: 0.5;
        text-align: center;
    }
`;

export const ConfigSection = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const ConfigRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

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
    font-size: 12px;
    padding: 8px 10px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        border-color: ${darkTheme.accent}60;
    }

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
    padding: 8px 12px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;

    @media (max-width: 768px) {
        flex-direction: column-reverse;
    }
`;

export const ArchiveButton = styled.button`
    background: transparent;
    border: 1px solid ${darkTheme.border};
    color: ${darkTheme.text.color};
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
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
    gap: 8px;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const EditorButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
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

export const HelpText = styled.div`
    font-size: 11px;
    opacity: 0.5;
    color: ${darkTheme.text.color};
    margin-top: -4px;
`;

export const SectionDivider = styled.div`
    height: 1px;
    background: ${darkTheme.border};
    margin: 2px 0;
    opacity: 0.5;
`;

// Custom Folder Selector
export const FolderSelectorWrapper = styled.div`
    position: relative;
`;

export const FolderSelectorButton = styled.button<{ $hasValue?: boolean }>`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${props => props.$hasValue ? darkTheme.text.color : darkTheme.text.color};
    opacity: ${props => props.$hasValue ? 1 : 0.4};
    font-size: 13px;
    padding: 8px 10px;
    width: 100%;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: inherit;
    transition: all 0.2s;

    &:hover {
        border-color: ${darkTheme.accent};
    }

    &:focus {
        border-color: ${darkTheme.accent};
        outline: none;
    }

    .material-symbols-outlined {
        font-size: 16px;
        opacity: 0.5;
    }
`;

export const FolderDropdown = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

    &::-webkit-scrollbar {
        width: 6px;
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

export const FolderDropdownItem = styled.div<{ $selected?: boolean; $isAdd?: boolean }>`
    padding: 8px 12px;
    font-size: 12px;
    color: ${props => props.$isAdd ? darkTheme.accent : darkTheme.text.color};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    background: ${props => props.$selected ? darkTheme.accent + '20' : 'transparent'};
    font-weight: ${props => props.$isAdd ? 600 : 400};

    &:hover {
        background: ${darkTheme.accent}30;
    }

    .material-symbols-outlined {
        font-size: 14px;
        ${props => props.$isAdd && `color: ${darkTheme.accent};`}
    }
`;

export const AddFolderInput = styled.div`
    padding: 8px;
    display: flex;
    gap: 4px;
    border-bottom: 1px solid ${darkTheme.border};
`;

export const FolderInput = styled.input`
    flex: 1;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 12px;
    padding: 6px 8px;
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

export const FolderActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    background: ${props => props.$variant === 'primary' ? darkTheme.accent : 'transparent'};
    color: ${props => props.$variant === 'primary' ? 'white' : darkTheme.text.color};
    border: 1px solid ${props => props.$variant === 'primary' ? darkTheme.accent : darkTheme.border};
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        opacity: 0.9;
        background: ${props => props.$variant === 'primary' ? darkTheme.accent : darkTheme.backgroundDarker};
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;