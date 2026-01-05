import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const ListsContainer = styled.div`
    display: flex;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const ListsSidebar = styled.div<{ $collapsed: boolean }>`
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

export const ListsGroup = styled.div<{ $nested?: boolean }>`
`;

export const ListItemSidebar = styled.div<{ $selected?: boolean, $nested?: boolean }>`
    padding: 6px 12px;
    padding-left: ${props => props.$nested ? '37px' : '14.5px'};
    display: flex;
    flex-direction: column;
    gap: 2px;
    cursor: pointer;
    color: ${darkTheme.text.color};
    font-size: 12px;
    background: ${props => props.$selected ? darkTheme.accent + '30' : 'transparent'};

    &:hover {
        background: ${darkTheme.accent}20;
    }
`;

export const ListItemHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    .material-symbols-outlined {
        font-size: 14px;
        opacity: 0.6;
    }
`;

export const ListTitle = styled.div`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
`;

export const ListMeta = styled.div`
    font-size: 11px;
    opacity: 0.6;
    padding-left: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ListTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding-left: 22px;
    margin-top: 4px;
`;

export const ListTagPill = styled.span`
    background: ${darkTheme.accent}20;
    color: ${darkTheme.accent};
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: 600;
    white-space: nowrap;
`;

export const ListContent = styled.div<{ $sidebarCollapsed: boolean }>`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-left: ${props => props.$sidebarCollapsed ? '0' : '0'};
    width: ${props => props.$sidebarCollapsed ? '100%' : 'calc(100% - 280px)'};

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
    min-height: 32px;
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

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'share' }>`
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
        color: white;

        &:hover:not(:disabled) {
            opacity: 0.9;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    ` : props.$variant === 'danger' ? `
        background: #e74c3c;
        color: white;

        &:hover {
            opacity: 0.9;
        }
    ` : props.$variant === 'share' ? `
        background: ${darkTheme.accentGreen};
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

export const EditorContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 16px;
    gap: 16px;

    justify-content: flex-start;
    width: 70%;
    margin: auto;

    box-sizing: border-box;

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

    @media (max-width: 1280px) {
        padding: 12px;
        width: 80%;
    }

    @media (max-width: 1024px) {
        padding: 12px;
        width: 90%;
    }

    @media (max-width: 768px) {
        padding: 12px;
        width: 100%;
    }
`;

export const TitleInput = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: none;
    border-radius: 4px;
    color: ${darkTheme.accent};
    font-size: 18px;
    font-weight: 600;
    padding: 12px 0px;
    outline: none;
    font-family: inherit;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
        font-weight: 400;
    }

    &:focus {
        /* background: ${darkTheme.backgroundDarkest}; */
    }
`;

export const SidebarSearchWrapper = styled.div<{ $expanded: boolean }>`
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    transition: all 0.2s ease;
`;

export const SidebarSearchIcon = styled.button`
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
        font-size: 18px;
    }
`;

export const SidebarSearchInput = styled.input<{ $visible: boolean }>`
    flex: 1;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 12px;
    padding: 6px 10px;
    outline: none;
    font-family: inherit;
    width: ${props => props.$visible ? '100%' : '0'};
    opacity: ${props => props.$visible ? '1' : '0'};
    transition: all 0.2s ease;
    overflow: hidden;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }
`;

export const ItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const ListItemRow = styled.div<{ $checked?: boolean }>`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: ${props => props.$checked ? 0.6 : 1};
    transition: opacity 0.2s;
`;

export const ItemMainRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 10px;
`;

export const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    cursor: pointer;
    margin-top: 2px;
    flex-shrink: 0;
`;

export const ItemText = styled.input<{ $checked?: boolean }>`
    flex: 1;
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    font-size: 14px;
    outline: none;
    font-family: inherit;
    text-decoration: ${props => props.$checked ? 'line-through' : 'none'};

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:disabled {
        cursor: default;
    }
`;

export const ItemActions = styled.div`
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;

    ${ListItemRow}:hover & {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 18px;
        color: ${darkTheme.text.color};
        opacity: 0.5;
        cursor: pointer;
        padding: 2px;

        &:hover {
            opacity: 1;
        }

        &:last-child:hover {
            color: #e74c3c;
        }
    }
`;

export const ItemDetails = styled.textarea<{ $expanded?: boolean }>`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    padding: 8px;
    outline: none;
    resize: vertical;
    min-height: ${props => props.$expanded ? '80px' : '0'};
    max-height: ${props => props.$expanded ? '200px' : '0'};
    opacity: ${props => props.$expanded ? 1 : 0};
    margin-left: 28px;
    font-family: inherit;
    line-height: 1.4;
    transition: all 0.2s;
    overflow: ${props => props.$expanded ? 'auto' : 'hidden'};

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }

    &:disabled {
        cursor: default;
    }
`;

export const AddItemButton = styled.button`
    background: transparent;
    border: 1px dashed ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    padding: 12px;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
    opacity: 0.6;
    transition: all 0.2s;

    &:hover {
        opacity: 1;
        border-color: ${darkTheme.accent};
        color: ${darkTheme.accent};
    }

    .material-symbols-outlined {
        font-size: 18px;
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
    max-width: 500px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-height: 80vh;
    overflow-y: auto;

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

export const ShareLink = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: ${darkTheme.text.color};
    word-break: break-all;
    display: flex;
    align-items: center;
    gap: 8px;

    input {
        flex: 1;
        background: transparent;
        border: none;
        color: ${darkTheme.accent};
        outline: none;
        font-family: inherit;
        font-size: inherit;
    }

    button {
        background: ${darkTheme.accent};
        color: white;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        white-space: nowrap;

        &:hover {
            opacity: 0.9;
        }
    }
`;

export const ShareModeSelector = styled.div`
    display: flex;
    gap: 8px;

    button {
        flex: 1;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid ${darkTheme.border};
        background: transparent;
        color: ${darkTheme.text.color};
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        transition: all 0.2s;

        &.active {
            background: ${darkTheme.accent};
            color: white;
            border-color: ${darkTheme.accent};
        }

        &:hover:not(.active) {
            border-color: ${darkTheme.accent};
            color: ${darkTheme.accent};
        }
    }
`;

export const ShareBanner = styled.div<{ $mode?: 'read-only' | 'read-write' }>`
    background: ${props => props.$mode === 'read-only' ? darkTheme.accentOrange + '20' : darkTheme.accentGreen + '20'};
    border: 1px solid ${props => props.$mode === 'read-only' ? darkTheme.accentOrange : darkTheme.accentGreen};
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: ${darkTheme.text.color};

    .material-symbols-outlined {
        font-size: 20px;
        color: ${props => props.$mode === 'read-only' ? darkTheme.accentOrange : darkTheme.accentGreen};
    }

    strong {
        color: ${props => props.$mode === 'read-only' ? darkTheme.accentOrange : darkTheme.accentGreen};
    }
`;