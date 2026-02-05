import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const DrawingsContainer = styled.div`
    display: flex;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const DrawingsSidebar = styled.div<{ $collapsed: boolean }>`
    width: ${props => props.$collapsed ? '0' : '320px'};
    min-width: ${props => props.$collapsed ? '0' : '320px'};
    background: ${darkTheme.backgroundDarkest};
    border-right: 0.5px solid ${darkTheme.border};
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

export const SidebarHeader = styled.div`
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
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

export const FolderItem = styled.div<{ $expanded?: boolean }>`
    user-select: none;
`;

export const FolderHeader = styled.div<{ $selected?: boolean }>`
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: ${darkTheme.text.color};
    font-size: 13px;
    font-weight: 600;
    background: ${props => props.$selected ? darkTheme.accent + '20' : 'transparent'};

    &:hover {
        background: ${darkTheme.accent}20;
    }

    .material-symbols-outlined {
        font-size: 16px;
        transition: transform 0.2s;
        
        &.chevron {
            font-size: 18px;
        }
    }
`;

export const FolderName = styled.div`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const FolderActions = styled.div`
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.2s;

    ${FolderHeader}:hover & {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 14px;
        padding: 2px;
        
        &:hover {
            color: ${darkTheme.accent};
        }

        &:last-child:hover {
            color: #e74c3c;
        }
    }
`;

export const DrawingsList = styled.div<{ $nested?: boolean }>``;

export const DrawingItem = styled.div<{ $selected?: boolean, $nested?: boolean }>`
    padding: 8px 12px;
    padding-left: ${props => props.$nested ? '37px' : '14.5px'};
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    user-select: none;
    color: ${darkTheme.text.color};
    font-size: 12px;
    background: ${props => props.$selected ? darkTheme.accent + '30' : 'transparent'};

    &:hover {
        background: ${darkTheme.accent}20;
    }

    .material-symbols-outlined {
        font-size: 14px;
        opacity: 0.6;
    }
`;

export const DrawingThumbnail = styled.div`
    width: 100%;
    max-height: 120px;
    border-radius: 4px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .material-symbols-outlined {
        font-size: 32px;
        opacity: 0.3;
    }
`;

export const DrawingInfo = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const DrawingTitle = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
`;

export const DrawingSubtitle = styled.div`
    font-size: 11px;
    opacity: 0.6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const DrawingContent = styled.div<{ $sidebarCollapsed: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-left: ${props => props.$sidebarCollapsed ? '0' : '0'};
    width: ${props => props.$sidebarCollapsed ? '100%' : 'calc(100% - 320px)'};

    @media (max-width: 768px) {
        width: 100%;
        margin-left: 0;
    }
`;

export const ContentHeader = styled.div`
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    max-height: 32px;
`;

export const DrawingTitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
`;

export const DrawingTitleInput = styled.input`
    background: transparent;
    border: none;
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    /* padding: 4px 8px; */
    outline: none;
    font-family: inherit;
    border-radius: 4px;
    height: 24px;

    &:hover {
        background: ${darkTheme.backgroundDarker};
    }

    &:focus {
        background: ${darkTheme.backgroundDarker};
        border: 1px solid ${darkTheme.accent};
        padding: 3px 7px;
    }

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }
`;

export const DrawingTitleDisplay = styled.div`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
        background: ${darkTheme.backgroundDarker};
    }
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

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const ContentActions = styled.div`
    flex: 1;
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    @media (max-width: 768px) {
        flex-wrap: wrap;
    }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    border: none;
    font-family: inherit;
    transition: opacity 0.2s;

    ${props => props.$variant === 'primary' ? `
        background: ${darkTheme.accent};
        color: ${darkTheme.text.accentAlt};

        &:hover:not(:disabled) {
            opacity: 0.9;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    ` : props.$variant === 'danger' ? `
        background: #5e2019ff;
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

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const AutoSaveToggle = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid ${darkTheme.border};
    font-size: 13px;
    color: ${darkTheme.text.color};

    .material-symbols-outlined {
        font-size: 16px;
        opacity: 0.6;
    }
`;

export const ToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    cursor: pointer;

    input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    span {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${darkTheme.border};
        transition: 0.4s;
        border-radius: 20px;

        &:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
    }

    input:checked + span {
        background-color: ${darkTheme.accent};
    }

    input:checked + span:before {
        transform: translateX(16px);
    }
`;

export const ExcalidrawContainer = styled.div`
    flex: 1;
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
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

export const LoadingState = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
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

export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    h3 {
        color: ${darkTheme.accent};
        margin: 0;
        font-size: 18px;
    }

    p {
        color: ${darkTheme.text.color};
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
    }
`;

export const ModalInput = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 14px;
    padding: 8px 12px;
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