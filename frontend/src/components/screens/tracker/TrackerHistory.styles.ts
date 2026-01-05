import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const HistoryOverlay = styled.div`
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
    padding: 20px;
`;

export const HistoryModal = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (max-width: 768px) {
        width: 95%;
        max-height: 95vh;
    }
`;

export const HistoryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
`;

export const HistoryTitle = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: ${darkTheme.text.color};

    h2 {
        color: ${darkTheme.accent};
        font-size: 16px;
        font-weight: 600;
        margin: 0;
    }

    span {
        font-size: 11px;
        opacity: 0.6;
    }
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

export const HistoryBody = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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

export const CalendarSection = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 16px;
`;

export const MonthHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

export const MonthTitle = styled.h3`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
`;

export const MonthNav = styled.div`
    display: flex;
    gap: 4px;
`;

export const NavButton = styled.button`
    background: transparent;
    border: 1px solid ${darkTheme.border};
    color: ${darkTheme.text.color};
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${darkTheme.accent}20;
        border-color: ${darkTheme.accent};
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
`;

export const DayHeader = styled.div`
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: ${darkTheme.text.color};
    opacity: 0.6;
    padding: 8px 4px;
`;

export const CalendarDay = styled.div<{ 
    $status?: 'completed' | 'partial' | 'missed' | 'skipped' | 'future' | 'empty';
    $isToday?: boolean;
}>`
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: ${props => props.$status === 'future' || props.$status === 'empty' ? 'default' : 'pointer'};
    position: relative;
    transition: all 0.2s;
    background: ${props => {
        switch (props.$status) {
            case 'completed': return darkTheme.accentGreen;
            case 'partial': return darkTheme.accentOrange;
            case 'missed': return '#e74c3c40';
            case 'skipped': return darkTheme.backgroundDarkest;
            case 'future': return darkTheme.backgroundDarkest;
            case 'empty': return 'transparent';
            default: return darkTheme.backgroundDarkest;
        }
    }};
    border: ${props => {
        if (props.$isToday) return `2px solid ${darkTheme.accent}`;
        if (props.$status === 'skipped') return `1px dashed ${darkTheme.border}`;
        return `1px solid ${darkTheme.border}`;
    }};
    opacity: ${props => props.$status === 'future' || props.$status === 'empty' ? 0.3 : 1};

    &:hover {
        ${props => props.$status !== 'future' && props.$status !== 'empty' && `
            transform: scale(1.05);
            border-color: ${darkTheme.accent};
            z-index: 1;
        `}
    }

    span {
        font-size: 11px;
        font-weight: 600;
        color: ${props => {
            if (props.$status === 'completed') return 'white';
            if (props.$status === 'partial') return 'white';
            return darkTheme.text.color;
        }};
    }
`;

export const EntryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const EntryCard = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
`;

export const EntryInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const EntryDate = styled.div`
    color: ${darkTheme.accent};
    font-size: 13px;
    font-weight: 600;
`;

export const EntryValue = styled.div`
    color: ${darkTheme.text.color};
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;

    .material-symbols-outlined {
        font-size: 16px;
        color: ${darkTheme.accentGreen};
    }
`;

export const EntryNote = styled.div`
    color: ${darkTheme.text.color};
    font-size: 12px;
    opacity: 0.7;
    font-style: italic;
`;

export const EntryActions = styled.div`
    display: flex;
    gap: 4px;
`;

export const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    opacity: 0.5;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;

    &:hover {
        opacity: 1;
    }

    &.delete:hover {
        color: #e74c3c;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: ${darkTheme.text.color};
    opacity: 0.6;
    gap: 12px;
    text-align: center;

    .material-symbols-outlined {
        font-size: 48px;
        color: ${darkTheme.accent}40;
    }

    p {
        margin: 0;
        font-size: 14px;
    }
`;

export const QuickAddSection = styled.div`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    gap: 8px;
    align-items: flex-start;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const QuickAddInputs = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const QuickAddRow = styled.div`
    display: flex;
    gap: 8px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const QuickInput = styled.input`
    flex: 1;
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    padding: 8px 10px;
    outline: none;
    font-family: inherit;

    &:focus {
        border-color: ${darkTheme.accent};
    }
`;

export const QuickTextArea = styled.textarea`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    font-size: 12px;
    padding: 8px 10px;
    outline: none;
    resize: vertical;
    min-height: 60px;
    font-family: inherit;

    &:focus {
        border-color: ${darkTheme.accent};
    }
`;

export const QuickAddButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
    white-space: nowrap;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;