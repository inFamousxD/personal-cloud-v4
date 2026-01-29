import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const AgentContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    background-color: ${darkTheme.backgroundDarker};
`;

// Sidebar
export const AgentSidebar = styled.div<{ $collapsed: boolean }>`
    width: ${props => props.$collapsed ? '0' : '320px'};
    min-width: ${props => props.$collapsed ? '0' : '320px'};
    background: ${darkTheme.backgroundDarkest};
    border-right: 0.5px solid ${darkTheme.border};
    border-left: 0.5px solid ${darkTheme.border};
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease, min-width 0.3s ease;
    overflow: hidden;

    @media (max-width: 768px) {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 3rem;
        width: ${props => props.$collapsed ? '0' : '320px'};
        z-index: 100;
        box-shadow: ${props => props.$collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.3)'};
    }
`;

export const SidebarOverlay = styled.div`
    display: none;

    @media (max-width: 768px) {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
    }
`;

export const SidebarHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
    min-height: 32px;
`;

export const SidebarTitle = styled.div`
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

export const SidebarActions = styled.div`
    display: flex;
    gap: 4px;
`;

export const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const SidebarBody = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

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

export const ChatListItem = styled.div<{ $selected: boolean }>`
    padding: 6px 12px;
    display: flex;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    color: ${darkTheme.text.color};
    font-size: 12px;
    background: ${props => props.$selected ? darkTheme.accent + '30' : 'transparent'};
    transition: background 0.2s;
    position: relative;

    .chat-actions {
        opacity: 1;
    }

    &:hover {
        background: ${darkTheme.accent}20;
    }

    .material-symbols-outlined {
        font-size: 14px;
        opacity: 0.6;
        flex-shrink: 0;
    }
`;

export const ChatInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export const ChatTitle = styled.div`
    color: ${darkTheme.text.color};
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const ChatDate = styled.div`
    color: ${darkTheme.text.color};
    opacity: 0.6;
    font-size: 11px;
`;

export const ChatActions = styled.div`
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;

    button {
        background: transparent;
        border: none;
        color: ${darkTheme.text.color};
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            color: #e74c3c;
        }

        .material-symbols-outlined {
            font-size: 14px;
        }
    }
`;

export const EmptyChats = styled.div`
    text-align: center;
    padding: 32px 16px;
    color: ${darkTheme.text.color};
    opacity: 0.5;

    .material-symbols-outlined {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.3;
    }

    p {
        font-size: 0.9em;
    }
`;

// Main Chat Area
export const ChatContent = styled.div<{ $sidebarCollapsed: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    position: relative;
    overflow: hidden;
    margin-left: ${props => props.$sidebarCollapsed ? '0' : '0'};
    width: ${props => props.$sidebarCollapsed ? '100%' : 'calc(100% - 320px)'};

    @media (max-width: 768px) {
        width: 100%;
        margin-left: 0;
    }
`;

export const ChatHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    gap: 12px;
    flex-shrink: 0;
    min-height: 32px;
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const ToggleSidebarButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const ChatTitleDisplay = styled.div`
    color: ${darkTheme.text.color};
    font-size: 0.95em;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;

    @media (max-width: 768px) {
        max-width: 150px;
    }
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const StatusIndicator = styled.span<{ $connected: boolean }>`
    color: ${props => props.$connected ? '#2ecc71' : '#e74c3c'};
    font-size: 0.8em;
    display: flex;
    align-items: center;
    gap: 4px;
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
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: ${darkTheme.accent};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background: ${darkTheme.accent}20;
        border-color: ${darkTheme.accent};
    }
`;

export const SettingsButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

// Messages Area
export const MessagesArea = styled.div`
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
`;

export const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: overlay;
    padding: 24px 300px 140px 300px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    /* max-width: 900px; */
    /* margin: 0 auto; */
    /* width: 100%; */

    &::-webkit-scrollbar {
        width: 0px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
        border-radius: 0px;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }

    @media (max-width: 1600px) {
        padding: 16px 160px 140px 160px;
        gap: 12px;
    }

    @media (max-width: 1280px) {
        padding: 16px 80px 140px 80px;
        gap: 12px;
    }

    @media (max-width: 1024px) {
        padding: 16px 40px 140px 40px;
        gap: 12px;
    }
    
    @media (max-width: 768px) {
        padding: 16px 0px 140px 0px;
        gap: 12px;
    }
`;

export const ThinkingBlock = styled.div<{ $expanded: boolean }>`
    margin-bottom: 12px;
    border: 1px solid ${darkTheme.border};
    border-radius: 6px;
    background: ${darkTheme.backgroundDarkest};
    overflow: hidden;
    max-width: 750px;
    align-self: flex-start;

    @media (max-width: 768px) {
        max-width: calc(100vw - 54px);
        margin: 0px 12px 12px 12px;
    }
`;

export const ThinkingHeader = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
        background: ${darkTheme.accent}10;
    }

    .material-symbols-outlined {
        font-size: 16px;
        transition: transform 0.2s;
    }
`;

export const MessageWrapper = styled.div<{ $role: string }>`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
    width: 100%;
`;

export const ThinkingContent = styled.div<{ $expanded: boolean }>`
    max-height: ${props => props.$expanded ? '400px' : '0'};
    overflow-y: auto;
    transition: max-height 0.3s ease;
    padding: ${props => props.$expanded ? '0 12px 12px 12px' : '0 12px'};
    font-size: 13px;
    line-height: 1.6;
    color: ${darkTheme.text.color};
    opacity: 0.8;
    white-space: pre-wrap;
    word-wrap: break-word;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
        border-radius: 3px;
    }
`;

export const ThinkingDots = styled.span`
    display: inline-flex;
    gap: 3px;
    margin-left: 4px;

    .dot {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${darkTheme.accent};
        animation: thinkingPulse 1.4s ease-in-out infinite;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes thinkingPulse {
        0%, 100% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
    }
`;

export const MessageBubble = styled.div<{ $role: string }>`
    background: ${props => 
        props.$role === 'user' 
            ? `color-mix(in srgb, ${darkTheme.accent} 10%, transparent)`
            : darkTheme.backgroundDarkest};
    border-radius: 6px;
    padding: 12px 16px;
    color: ${darkTheme.text.color};
    align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
    max-width: 750px;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.6;

    @media (max-width: 768px) {
        max-width: calc(100vw - 54px); /* Account for container padding/margins */
        padding: 12px 14px;
        margin: 0px 12px;
    }

    /* Typography */
    p {
        margin: 0 0 8px 0;

        &:last-child {
            margin-bottom: 0;
        }
    }

    h1, h2, h3, h4, h5, h6 {
        color: ${darkTheme.accent};
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.3;

        &:first-child {
            margin-top: 0;
        }
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; }

    /* Lists */
    ul, ol {
        margin: 8px 0;
        padding-left: 24px;
    }

    li {
        margin: 4px 0;
    }

    /* Code */
    code {
        background: ${darkTheme.accentDark};
        padding: 0px 6px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
    }

    pre {
        margin: 0px;
        border-radius: 8px;
        overflow-x: auto;
        background: #1e1e1e;
        padding: 0px 8px;
        max-width: 100%; /* Constrain to bubble width */
        
        code {
            background: transparent;
            padding: 0;
            font-family: 'JetBrains Mono' !important;
        }

        ::-webkit-scrollbar {
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: ${darkTheme.backgroundDarker};
        }

        ::-webkit-scrollbar-thumb {
            background: ${darkTheme.accent}40;
            border-radius: 4px;
        }
    }

    /* Blockquotes */
    blockquote {
        border-left: 3px solid ${darkTheme.accent};
        margin: 12px 0;
        padding-left: 16px;
        opacity: 0.8;
    }

    /* Links */
    a {
        color: ${darkTheme.accent};
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    /* KaTeX Math Styling */
    .katex {
        font-size: 1.1em;
    }

    .katex-display {
        margin: 1em 0;
        overflow-x: auto;
        overflow-y: hidden;

        &::-webkit-scrollbar {
            height: 6px;
        }

        &::-webkit-scrollbar-track {
            background: ${darkTheme.backgroundDarker};
        }

        &::-webkit-scrollbar-thumb {
            background: ${darkTheme.accent}40;
            border-radius: 3px;
        }
    }

    /* Tables */
    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
    }

    th, td {
        border: 1px solid ${darkTheme.border};
        padding: 8px 12px;
        text-align: left;
    }

    th {
        background: ${darkTheme.backgroundDarker};
        font-weight: 600;
    }
`;

export const EmptyState = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${darkTheme.text.color};
    opacity: 0.6;
    gap: 16px;
    padding: 40px;
    text-align: center;

    .material-symbols-outlined {
        font-size: 64px;
        color: ${darkTheme.accent}40;
    }

    h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }

    p {
        margin: 0;
        font-size: 14px;
        max-width: 400px;
    }
`;

// Input Area
export const InputArea = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    padding: 24px 16px;
    background: linear-gradient(to top, ${darkTheme.backgroundDarker} 60%, transparent);
    pointer-events: none;

    @media (max-width: 768px) {
        padding: 12px;
    }
`;

export const InputWrapper = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-end;
    width: 100%;
    max-width: 900px;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 6px;
    padding: 8px 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    transition: all 0.2s;

    &:focus-within {
        border-color: ${darkTheme.accent};
    }

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

export const TextArea = styled.textarea`
    flex: 1;
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    padding: 6px 8px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    min-height: 24px;
    max-height: 600px;
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
    border: 1px solid ${darkTheme.accent};
    border-radius: 6px;
    padding: 5.5px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: inherit;
    transition: all 0.2s;
    flex-shrink: 0;

    width: 32px;
    height: 32px;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const StopButton = styled.button`
    background: #e74c3c;
    color: white;
    border: 1px solid #e74c3c;
    border-radius: 6px;
    padding: 5.5px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: inherit;
    transition: all 0.2s;
    flex-shrink: 0;

    width: 32px;
    height: 32px;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

// Settings Modal
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
`;

export const ModalContent = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;

    h3 {
        margin: 0;
        color: ${darkTheme.accent};
        font-size: 18px;
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
        border-radius: 4px;
    }
`;

export const SettingGroup = styled.div`
    margin-bottom: 20px;
    color: ${darkTheme.text.color};

    label {
        display: block;
        color: ${darkTheme.text.color};
        font-size: 0.9em;
        margin-bottom: 8px;
        font-weight: 500;
    }

    input[type="range"] {
        width: 100%;
        margin-top: 4px;
    }

    input[type="number"] {
        background: ${darkTheme.backgroundDarker};
        border: 1px solid ${darkTheme.border};
        border-radius: 6px;
        color: ${darkTheme.text.color};
        padding: 8px 12px;
        font-size: 14px;
        font-family: inherit;
        width: 100px;

        &:focus {
            outline: none;
            border-color: ${darkTheme.accent};
        }
    }
`;

export const SettingValue = styled.span`
    color: ${darkTheme.accent};
    font-weight: 600;
    margin-left: 8px;
`;

export const ModalActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    @media (max-width: 480px) {
        flex-direction: column-reverse;

        button {
            width: 100%;
        }
    }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
    background: ${props => 
        props.$variant === 'primary' ? darkTheme.accent :
        props.$variant === 'danger' ? '#e74c3c' :
        'transparent'};
    color: ${props => 
        props.$variant ? 'white' : darkTheme.text.color};
    border: ${props => 
        props.$variant ? 'none' : `1px solid ${darkTheme.border}`};
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9em;
    font-weight: 500;
    transition: all 0.2s;

    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
`;

export const LoadingState = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${darkTheme.accent};

    .lds-ring {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
    }
    
    .lds-ring div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 64px;
        height: 64px;
        margin: 8px;
        border: 8px solid ${darkTheme.accent};
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

// Delete Confirmation Modal
export const DeleteConfirmModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
`;

export const DeleteConfirmContent = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h3 {
        margin: 0;
        color: ${darkTheme.accent};
        font-size: 18px;
        font-weight: 600;
    }

    p {
        margin: 0;
        color: ${darkTheme.text.color};
        font-size: 14px;
        line-height: 1.5;
        opacity: 0.9;
    }
`;

export const DeleteConfirmActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;

    button {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;

        &:first-child {
            background: transparent;
            color: ${darkTheme.text.color};
            border: 1px solid ${darkTheme.border};

            &:hover {
                background: ${darkTheme.accent}10;
                border-color: ${darkTheme.accent};
            }
        }

        &:last-child {
            background: #e74c3c;
            color: white;
            border: none;

            &:hover {
                opacity: 0.9;
            }
        }
    }

    @media (max-width: 480px) {
        flex-direction: column-reverse;

        button {
            width: 100%;
        }
    }
`;

// Rename Chat Styles (for header title)
export const RenameChatWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;

    .rename-button {
        opacity: 0.2;
        padding: 4px;
        transition: opacity 0.2s;

        .material-symbols-outlined {
            font-size: 16px;
        }
    }

    &:hover .rename-button {
        opacity: 0.6;

        &:hover {
            opacity: 1;
        }
    }
`;

export const RenameChatInput = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.accent};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    padding: 4px 8px;
    font-size: 0.95em;
    font-weight: 500;
    font-family: inherit;
    max-width: 500px;
    outline: none;
    width: 70vw;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    @media (max-width: 768px) {
        max-width: 150px;
        font-size: 0.9em;
    }
`;

export const WaitingIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 6px;
    margin: 0 16px 12px 16px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    opacity: 0.8;

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${darkTheme.accent};
        animation: pulse 1.5s ease-in-out infinite;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }

    @media (max-width: 768px) {
        padding: 10px 14px;
        font-size: 12px;
        margin: 0 12px 12px 12px;
    }
`;