import styled, { keyframes } from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const TerminalContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const TerminalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;

    @media (max-width: 768px) {
        padding: 6px 10px;
    }
`;

export const TerminalHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

export const TerminalTitle = styled.div`
    color: ${darkTheme.accent};
    font-size: 1.1em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;

    .material-symbols-outlined {
        font-size: 20px;
    }

    @media (max-width: 768px) {
        font-size: 1em;
    }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

export const ConnectionStatus = styled.div<{ $status: 'connected' | 'connecting' | 'disconnected' }>`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    background: ${props => {
        switch (props.$status) {
            case 'connected': return 'rgba(46, 204, 113, 0.2)';
            case 'connecting': return 'rgba(241, 196, 15, 0.2)';
            case 'disconnected': return 'rgba(231, 76, 60, 0.2)';
        }
    }};
    color: ${props => {
        switch (props.$status) {
            case 'connected': return '#2ecc71';
            case 'connecting': return '#f1c40f';
            case 'disconnected': return '#e74c3c';
        }
    }};

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        animation: ${props => props.$status === 'connecting' ? pulse : 'none'} 1.5s ease-in-out infinite;
    }

    @media (max-width: 768px) {
        span:not(.status-dot) {
            display: none;
        }
    }
`;

export const TerminalActions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
    background: ${props => {
        switch (props.$variant) {
            case 'primary': return darkTheme.accent;
            case 'danger': return '#e74c3c';
            default: return 'transparent';
        }
    }};
    color: ${props => props.$variant ? 'white' : darkTheme.text.color};
    border: ${props => props.$variant ? 'none' : `1px solid ${darkTheme.border}`};
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
        opacity: 0.9;
        background: ${props => !props.$variant && darkTheme.accent + '20'};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        padding: 6px 8px;
        
        span:not(.material-symbols-outlined) {
            display: none;
        }
    }
`;

export const TerminalBody = styled.div`
    flex: 1;
    overflow: hidden;
    background: #0d0d0d;
    position: relative;

    /* xterm.js container */
    .xterm {
        height: 100%;
        padding: 8px;
    }

    .xterm-viewport {
        background: transparent !important;
        
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
    }

    @media (max-width: 768px) {
        .xterm {
            padding: 4px;
        }
    }
`;

export const TerminalOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.8);
    color: ${darkTheme.text.color};
    gap: 16px;
    z-index: 10;

    .material-symbols-outlined {
        font-size: 48px;
        color: ${darkTheme.accent};
    }

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }

    p {
        margin: 0;
        font-size: 13px;
        opacity: 0.7;
        text-align: center;
        max-width: 300px;
    }
`;

export const ReconnectButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: inherit;
    margin-top: 8px;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const LoadingSpinner = styled.div`
    .lds-ring {
        display: inline-block;
        position: relative;
        width: 40px;
        height: 40px;
    }

    .lds-ring div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 32px;
        height: 32px;
        margin: 4px;
        border: 4px solid ${darkTheme.accent};
        border-radius: 50%;
        animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: ${darkTheme.accent} transparent transparent transparent;
    }

    .lds-ring div:nth-child(1) {
        animation-delay: -0.45s;
    }

    .lds-ring div:nth-child(2) {
        animation-delay: -0.3s;
    }

    .lds-ring div:nth-child(3) {
        animation-delay: -0.15s;
    }

    @keyframes lds-ring {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

export const SessionInfo = styled.div`
    font-size: 11px;
    color: ${darkTheme.text.color};
    opacity: 0.5;
    font-family: 'JetBrains Mono', monospace;

    @media (max-width: 768px) {
        display: none;
    }
`;