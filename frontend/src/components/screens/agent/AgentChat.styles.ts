import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const AgentContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
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
`;

export const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 16px;
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
        /* background: ${darkTheme.backgroundDarker}; */
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'JetBrains Mono', monospace;
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
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const TextArea = styled.textarea`
    flex: 1;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    padding: 10px;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    min-height: 60px;
    max-height: 120px;

    &:focus {
        outline: none;
        border-color: ${darkTheme.accent};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }
`;

export const SendButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    transition: opacity 0.2s;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const StopButton = styled(SendButton)`
    background: #e74c3c;
`;