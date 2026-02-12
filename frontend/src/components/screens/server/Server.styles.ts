import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const ServerContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const ServerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
        
        > div {
            width: 100%;
        }
    }
`;

export const ServerTitle = styled.div`
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

export const RefreshButton = styled.button`
    background: ${darkTheme.accent};
    color: ${darkTheme.text.accentAlt};
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
    transition: opacity 0.2s;
    flex: 1;
    justify-content: center;

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
`;

export const ClearCacheButton = styled.button`
    background: ${darkTheme.accentOrange};
    color: ${darkTheme.text.accentAlt};
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
    transition: opacity 0.2s;
    flex: 1;
    justify-content: center;

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
`;

export const ServerBody = styled.div`
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
        padding: 10px;
    }
`;

export const AffineSection = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.accent};
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 16px;
`;

export const AffineControls = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const ActionButton = styled.button<{ $variant?: 'success' | 'error' | 'warning' }>`
    background: ${props => {
        if (props.$variant === 'success') return darkTheme.accentGreen;
        if (props.$variant === 'error') return '#e74c3c';
        if (props.$variant === 'warning') return darkTheme.accentOrange;
        return darkTheme.accent;
    }};
    color: ${darkTheme.text.accentAlt};
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    transition: opacity 0.2s;
    flex: 1;
    justify-content: center;

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

    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const SectionDivider = styled.div`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 20px 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid ${darkTheme.border};
`;

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
    margin-bottom: 12px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const StatCard = styled.div<{ $status?: 'success' | 'warning' | 'error' }>`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${props => {
        if (props.$status === 'success') return darkTheme.accentGreen;
        if (props.$status === 'warning') return darkTheme.accentOrange;
        if (props.$status === 'error') return '#e74c3c';
        return darkTheme.border;
    }};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const StatCardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${darkTheme.accent};
    font-weight: 600;
    font-size: 13px;

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const StatCardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

export const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: ${darkTheme.text.color};

    span:first-child {
        opacity: 0.7;
    }

    span:last-child {
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
    }
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: ${darkTheme.backgroundDarker};
    border-radius: 3px;
    overflow: hidden;
    margin-top: 4px;
`;

export const ProgressFill = styled.div<{ $percent: number; $color?: string }>`
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${props => props.$color || darkTheme.accent};
    transition: width 0.3s ease;
`;

export const StatusBadge = styled.div<{ $status: 'healthy' | 'unhealthy' | 'connected' | 'disconnected' }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: ${props => {
        if (props.$status === 'healthy' || props.$status === 'connected') 
            return darkTheme.accentGreen + '20';
        return '#e74c3c20';
    }};
    color: ${props => {
        if (props.$status === 'healthy' || props.$status === 'connected') 
            return darkTheme.accentGreen;
        return '#e74c3c';
    }};

    .material-symbols-outlined {
        font-size: 12px;
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

export const ErrorState = styled.div`
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
        color: #e74c3c;
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

export const PingIndicator = styled.div<{ $latency: number }>`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: ${props => {
        if (props.$latency < 100) return darkTheme.accentGreen;
        if (props.$latency < 300) return darkTheme.accentOrange;
        return '#e74c3c';
    }};

    .material-symbols-outlined {
        font-size: 14px;
    }
`;
