import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const NotesContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const NotesHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const NotesHeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
    }
`;

export const NotesHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

export const NotesTitle = styled.div`
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

export const NotesCount = styled.span`
    color: ${darkTheme.text.color};
    opacity: 0.6;
    font-size: 0.8em;
    font-weight: 400;
`;

export const CreateButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
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

export const FilterBar = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
`;

export const SearchInput = styled.input`
    flex: 1;
    min-width: 200px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 12px;
    padding: 6px 10px 6px 12px;
    outline: none;
    font-family: inherit;
    position: relative;

    &::placeholder {
        color: ${darkTheme.text.color};
        opacity: 0.4;
    }

    &:focus {
        border-color: ${darkTheme.accent};
    }

    @media (max-width: 768px) {
        min-width: 100%;
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
    }

    @media (max-width: 768px) {
        min-width: 100%;
    }
`;

export const FilterControls = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
`;

export const SortButton = styled.button<{ $active?: boolean }>`
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
    }

    .material-symbols-outlined {
        font-size: 14px;
    }
`;

export const FavoriteTags = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
`;

export const FavoriteTagPill = styled.button<{ $active?: boolean }>`
    background: ${props => props.$active ? darkTheme.accent : darkTheme.accent + '30'};
    color: ${props => props.$active ? 'white' : darkTheme.accent};
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;

    &:hover {
        background: ${darkTheme.accent};
        color: white;
    }

    .material-symbols-outlined {
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    &:hover .material-symbols-outlined {
        opacity: 1;
    }
`;

export const TagFilterButton = styled.button`
    background: transparent;
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
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

export const NotesBody = styled.div`
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
        border-radius: 4px;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }

    @media (max-width: 768px) {
        padding: 10px;
    }
`;

export const NotesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-rows: 180px;
    grid-auto-flow: dense;
    gap: 12px;
    width: 100%;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        grid-auto-rows: 180px;
        gap: 10px;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        grid-auto-rows: auto;
    }
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
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

export const Seperator = styled.div`
    border-bottom: 1px solid ${darkTheme.border};
    padding: 5px;
`;

export const TagFilterDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    margin-top: 4px;
    min-width: 200px;
    max-height: 300px;
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
        border-radius: 3px;

        &:hover {
            background: ${darkTheme.accent}60;
        }
    }
`;

export const TagFilterItem = styled.div<{ $selected?: boolean }>`
    padding: 8px 12px;
    font-size: 12px;
    color: ${darkTheme.text.color};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${props => props.$selected ? darkTheme.accent + '20' : 'transparent'};

    &:hover {
        background: ${darkTheme.accent}30;
    }

    .material-symbols-outlined {
        font-size: 14px;
        color: ${darkTheme.accent};
    }
`;

export const TagFilterWrapper = styled.div`
    position: relative;
`;