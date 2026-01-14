import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const AgentContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
`;

export const AgentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const AgentTitle = styled.div`
    color: ${darkTheme.accent};
    font-size: 1.1em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const StatusIndicator = styled.span<{ $connected: boolean }>`
    color: ${props => props.$connected ? '#2ecc71' : '#e74c3c'};
    font-size: 0.8em;
    margin-left: 4px;
`;

export const ModelSelector = styled.select`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    padding: 6px 10px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${darkTheme.accent};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const ChatArea = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
`;

export const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 16px 16px 140px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

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

    @media (max-width: 768px) {
        padding: 16px 12px 140px 12px;
    }
`;

export const MessageBubble = styled.div<{ $role: string }>`
    background: ${props => 
        props.$role === 'user' 
            ? darkTheme.accent + '20' 
            : darkTheme.backgroundDarkest};
    border: 1px solid ${props => 
        props.$role === 'user' 
            ? darkTheme.accent + '40' 
            : darkTheme.border};
    border-radius: 8px;
    padding: 12px 16px;
    color: ${darkTheme.text.color};
    align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
    max-width: 80%;
    word-wrap: break-word;
    font-size: 0.9em;

    p {
        margin: 0 0 8px 0;

        &:last-child {
            margin-bottom: 0;
        }
    }

    code {
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Fira Code', monospace;
        font-size: 0.9em;
    }

    pre {
        margin: 8px 0;
        border-radius: 4px;
        overflow-x: auto;

        &::-webkit-scrollbar {
            height: 6px;
        }

        &::-webkit-scrollbar-track {
            background: ${darkTheme.backgroundDarker};
        }

        &::-webkit-scrollbar-thumb {
            background: ${darkTheme.accent}40;
        }
    }
`;

export const InputArea = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    padding: 20px 16px;
    background: linear-gradient(to top, ${darkTheme.backgroundDarker} 50%, transparent);
    pointer-events: none;

    @media (max-width: 768px) {
        padding: 16px 12px;
    }
`;

export const InputWrapper = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-end;
    width: 100%;
    max-width: 800px;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 16px;
    padding: 8px 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: auto;

    &:focus-within {
        border-color: ${darkTheme.accent};
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    @media (max-width: 768px) {
        max-width: 100%;
        border-radius: 16px;
    }
`;

export const TextArea = styled.textarea`
    flex: 1;
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    padding: 6px 6px;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    min-height: 32px;
    max-height: 300px;
    line-height: 1.5;

    &:focus {
        outline: none;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
        border-radius: 3px;
    }
`;

export const SendButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 25%;
    width: 32px;
    height: 36px;
    /* min-width: 32px;
    min-height: 32px; */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        opacity: 0.9;
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const StopButton = styled.button`
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 25%;
    /* padding: 6px 12px; */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s;
    flex-shrink: 0;
    width: 32px;
    height: 36px;

    &:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;