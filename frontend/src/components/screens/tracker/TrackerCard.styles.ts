import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const TrackerCardStyled = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const TrackerCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

export const TrackerTitleSection = styled.div`
    flex: 1;
`;

export const TrackerTitle = styled.div`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
`;

export const TrackerType = styled.div`
    color: ${darkTheme.text.color};
    font-size: 11px;
    opacity: 0.6;
    display: flex;
    align-items: center;
    gap: 4px;

    .material-symbols-outlined {
        font-size: 12px;
    }
`;

export const TrackerActions = styled.div`
    display: flex;
    gap: 4px;
`;

export const IconButton = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    opacity: 0.5;
    cursor: pointer;
    padding: 2px;
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

export const TrackerStats = styled.div`
    display: flex;
    gap: 12px;
    padding: 8px 0;
    border-top: 1px solid ${darkTheme.border};
    border-bottom: 1px solid ${darkTheme.border};
    color: ${darkTheme.text.color};
`;

export const Stat = styled.div`
    flex: 1;
    text-align: center;
`;

export const StatValue = styled.div`
    font-size: 16px;
    font-weight: 700;
    color: ${darkTheme.accent};
`;

export const StatLabel = styled.div`
    font-size: 10px;
    opacity: 0.6;
    margin-top: 2px;
`;

export const ProgressSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const ProgressLabel = styled.div`
    font-size: 11px;
    opacity: 0.7;
`;

export const ProgressBarContainer = styled.div`
    background: ${darkTheme.backgroundDarker};
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
`;

export const ProgressBar = styled.div<{ $width: number }>`
    height: 100%;
    background: ${darkTheme.accentGreen};
    border-radius: 4px;
    transition: width 0.3s ease;
    width: ${props => props.$width}%;
`;

export const Heatmap = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
`;

export const HeatmapDay = styled.div<{ $status?: 'completed' | 'partial' | 'missed' | 'none' }>`
    aspect-ratio: 1;
    background: ${props => {
        switch (props.$status) {
            case 'completed': return darkTheme.accentGreen + '30';
            case 'partial': return '#F59E0B30';
            case 'missed': return '#EF444430';
            default: return darkTheme.backgroundDarker;
        }
    }};
    border: 1px solid ${props => {
        switch (props.$status) {
            case 'completed': return darkTheme.accentGreen;
            case 'partial': return '#F59E0B';
            case 'missed': return '#EF4444';
            default: return darkTheme.border;
        }
    }};
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: scale(1.1);
        border-color: ${darkTheme.accent};
    }
`;

export const ActionSection = styled.div`
    display: flex;
    gap: 8px;
`;

export const CompleteButton = styled.button<{ $completed?: boolean }>`
    flex: 1;
    background: ${props => props.$completed ? darkTheme.backgroundDarker : darkTheme.accentGreen};
    color: ${props => props.$completed ? darkTheme.accentGreen : 'white'};
    border: ${props => props.$completed ? `1px solid ${darkTheme.accentGreen}` : 'none'};
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: inherit;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const SecondaryButton = styled.button`
    background: transparent;
    border: 1px solid ${darkTheme.border};
    color: ${darkTheme.text.color};
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;

    &:hover {
        background: ${darkTheme.backgroundDarker};
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const TrackerTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
`;

export const Tag = styled.span`
    background: ${darkTheme.accent}20;
    color: ${darkTheme.accent};
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
`;

export const StreakBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: ${darkTheme.accentGreen}20;
    color: ${darkTheme.accentGreen};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;

    .material-symbols-outlined {
        font-size: 14px;
    }
`;

export const NumericControls = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

export const NumericValue = styled.div`
    flex: 1;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: ${darkTheme.accent};
`;

export const NumericButton = styled.button`
    background: ${darkTheme.accent};
    color: white;
    border: none;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: inherit;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }
`;