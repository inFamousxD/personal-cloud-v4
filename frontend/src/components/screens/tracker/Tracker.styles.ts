import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const TrackerContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const TrackerHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const TrackerHeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
    }
`;

export const TrackerHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

export const TrackerTitle = styled.div`
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

export const TrackerCount = styled.span`
    color: ${darkTheme.text.color};
    opacity: 0.6;
    font-size: 0.8em;
    font-weight: 400;
`;

export const CreateButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: 1px solid ${darkTheme.accent};
    border-radius: 4px;
    padding: 5.5px 12px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

export const RefreshButton = styled.div`
    user-select: none;
    cursor: pointer;
    background: transparent;
    color: ${darkTheme.text.color};
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        /* display: none; */
    }
`;

export const FilterBar = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

export const SearchWrapper = styled.div`
    position: relative;
    flex: 1;
    min-width: 200px;

    .material-symbols-outlined {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        color: ${darkTheme.text.color};
        opacity: 0.4;
        pointer-events: none;
        z-index: 1;
    }

    @media (max-width: 768px) {
        min-width: 0;
        width: 100%;
    }
`;

export const SearchInput = styled.input`
    flex: 1;
    min-width: 200px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 12px;
    padding: 6px 10px 6px 32px;
    outline: none;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }

    @media (max-width: 768px) {
        min-width: 0;
        box-sizing: border-box;
    }
`;

export const FilterControls = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
        overflow-x: auto;
    }
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
    background: ${props => props.$active ? darkTheme.accent + '20' : 'transparent'};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${props => props.$active ? darkTheme.accent : darkTheme.text.color};
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    white-space: nowrap;

    &:hover {
        background: ${darkTheme.accent}20;
        border-color: ${darkTheme.accent};
        color: ${darkTheme.accent};
    }

    .material-symbols-outlined {
        font-size: 14px;
    }
`;

export const TrackerBody = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px;

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
        padding: 10px 10px 20px 10px;
    }
`;

export const FolderSection = styled.div`
    margin-bottom: 24px;
`;

export const FolderHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${darkTheme.border};

    .material-symbols-outlined {
        color: ${darkTheme.accent};
        font-size: 18px;
    }
`;

export const FolderName = styled.span`
    color: ${darkTheme.accent};
    font-weight: 600;
    font-size: 14px;
`;

export const TrackerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: ${darkTheme.text.color};
    opacity: 0.6;
    gap: 16px;
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

export const DeleteConfirmModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const DeleteConfirmContent = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.accent}40;
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

export const DeleteConfirmActions = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    button {
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        font-family: inherit;

        &:first-child {
            background: transparent;
            color: ${darkTheme.text.color};
            border: 1px solid ${darkTheme.border};

            &:hover {
                background: ${darkTheme.backgroundDarker};
            }
        }

        &:last-child {
            background: #e74c3c;
            color: white;

            &:hover {
                background: #c0392b;
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