import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const SettingsContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const SettingsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const SettingsTitle = styled.div`
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

export const SettingsBody = styled.div`
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

export const SettingsSection = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 12px;
`;

export const SectionTitle = styled.h3`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const UserInfoCard = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

export const UserAvatar = styled.img`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid ${darkTheme.accent};
`;

export const UserDetails = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

export const UserName = styled.div`
    color: ${darkTheme.accent};
    font-size: 16px;
    font-weight: 600;
`;

export const UserEmail = styled.div`
    color: ${darkTheme.text.color};
    font-size: 13px;
    opacity: 0.7;
    font-family: 'JetBrains Mono', monospace;
`;

export const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid ${darkTheme.border};
    font-size: 13px;

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
`;

export const InfoLabel = styled.span`
    color: ${darkTheme.text.color};
    opacity: 0.7;
`;

export const InfoValue = styled.span`
    color: ${darkTheme.text.color};
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
`;

export const LogoutButton = styled.button`
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 18px;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

export const DangerZone = styled.div`
    border: 1px solid #e74c3c40;
    border-radius: 4px;
    padding: 16px;
    background: #e74c3c10;
`;

export const DangerZoneTitle = styled.h4`
    color: #e74c3c;
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 6px;

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

export const DangerZoneDescription = styled.p`
    color: ${darkTheme.text.color};
    font-size: 12px;
    margin: 0 0 12px 0;
    opacity: 0.7;
`;

export const VersionInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    font-size: 12px;
`;

export const VersionRow = styled.div`
    display: flex;
    justify-content: space-between;
    color: ${darkTheme.text.color};

    span:first-child {
        opacity: 0.7;
    }

    span:last-child {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
    }
`;

export const Badge = styled.span<{ $variant?: 'success' | 'info' }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: ${props => props.$variant === 'success' ? darkTheme.accentGreen + '20' : darkTheme.accent + '20'};
    color: ${props => props.$variant === 'success' ? darkTheme.accentGreen : darkTheme.accent};
`;