import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const AdminContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

export const AdminHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const AdminTitle = styled.div`
    color: ${darkTheme.accent};
    font-size: 1.1em;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const AdminBody = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;

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

export const AdminSection = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 16px;
`;

export const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

export const SectionTitle = styled.h3`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
`;

export const FeatureToggle = styled.label<{ $denied?: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: ${props => props.$denied ? darkTheme.accentOrange + '15' : darkTheme.accentGreen + '15'};
    border: 1px solid ${props => props.$denied ? darkTheme.accentOrange + '40' : darkTheme.accentGreen + '40'};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${props => props.$denied ? darkTheme.accentOrange + '25' : darkTheme.accentGreen + '25'};
    }

    input {
        accent-color: ${darkTheme.accentGreen};
    }

    span {
        color: ${darkTheme.text.color};
        font-size: 13px;
        text-transform: capitalize;
    }
`;

export const SearchBar = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    input {
        flex: 1;
        background: ${darkTheme.backgroundDarker};
        border: 1px solid ${darkTheme.border};
        border-radius: 4px;
        padding: 8px 12px;
        color: ${darkTheme.text.color};
        font-size: 13px;
        font-family: inherit;

        &:focus {
            outline: none;
            border-color: ${darkTheme.accent};
        }

        &::placeholder {
            color: ${darkTheme.text.color}80;
        }
    }
`;

export const UserList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* max-height: 400px; */
    overflow-y: auto;

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

export const UserCard = styled.div<{ $expanded?: boolean }>`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    /* overflow: hidden; */

    ${props => props.$expanded && `
        border-color: ${darkTheme.accent};
    `}
`;

export const UserCardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: ${darkTheme.backgroundDarkest};
    }
`;

export const UserAvatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${darkTheme.accent}30;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${darkTheme.accent};
    font-weight: 600;
    font-size: 14px;
`;

export const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

export const UserName = styled.div`
    color: ${darkTheme.text.color};
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const UserEmail = styled.div`
    color: ${darkTheme.text.color};
    opacity: 0.6;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const UserBadges = styled.div`
    display: flex;
    gap: 6px;
`;

export const Badge = styled.span<{ $variant?: 'admin' | 'custom' | 'default' | 'denied' }>`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;

    ${props => {
        switch (props.$variant) {
            case 'admin':
                return `
                    background: ${darkTheme.accentOrange}20;
                    color: ${darkTheme.accentOrange};
                `;
            case 'custom':
                return `
                    background: ${darkTheme.accent}20;
                    color: ${darkTheme.accent};
                `;
            case 'denied':
                return `
                    background: #e74c3c20;
                    color: #e74c3c;
                `;
            default:
                return `
                    background: ${darkTheme.text.color}20;
                    color: ${darkTheme.text.color};
                `;
        }
    }}
`;

export const UserCardBody = styled.div`
    padding: 16px;
    border-top: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
`;

export const PermissionRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid ${darkTheme.border};

    &:last-child {
        border-bottom: none;
    }
`;

export const PermissionLabel = styled.span`
    color: ${darkTheme.text.color};
    font-size: 13px;
`;

export const Toggle = styled.label`
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;

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
        transition: 0.3s;
        border-radius: 22px;

        &:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
        }
    }

    input:checked + span {
        background-color: ${darkTheme.accentGreen};
    }

    input:checked + span:before {
        transform: translateX(18px);
    }
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
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

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    ${props => {
        switch (props.$variant) {
            case 'danger':
                return `
                    background: #e74c3c;
                    color: white;
                `;
            case 'secondary':
                return `
                    background: ${darkTheme.border};
                    color: ${darkTheme.text.color};
                `;
            default:
                return `
                    background: ${darkTheme.accent};
                    color: white;
                `;
        }
    }}
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 12px;
`;

export const InfoText = styled.p`
    color: ${darkTheme.text.color};
    opacity: 0.6;
    font-size: 12px;
    margin: 8px 0 0 0;
`;

export const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: ${darkTheme.text.color};
    opacity: 0.6;

    .material-symbols-outlined {
        font-size: 48px;
        margin-bottom: 12px;
        display: block;
    }
`;

export const Pagination = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    color: ${darkTheme.text.color};
    font-size: 13px;

    button {
        background: ${darkTheme.backgroundDarkest};
        border: 1px solid ${darkTheme.border};
        color: ${darkTheme.text.color};
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;

        &:hover:not(:disabled) {
            background: ${darkTheme.accent};
            border-color: ${darkTheme.accent};
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
`;

export const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    color: ${darkTheme.accent};

    .material-symbols-outlined {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

export const ErrorMessage = styled.div`
    background: #e74c3c20;
    border: 1px solid #e74c3c40;
    color: #e74c3c;
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;

    .material-symbols-outlined {
        font-size: 18px;
    }
`;

export const SuccessMessage = styled.div`
    background: ${darkTheme.accentGreen}20;
    border: 1px solid ${darkTheme.accentGreen}40;
    color: ${darkTheme.accentGreen};
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;

    .material-symbols-outlined {
        font-size: 18px;
    }
`;