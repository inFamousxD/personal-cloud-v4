import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

// Re-export existing styles
export * from './Settings.styles';

// Theme-specific styles
export const ThemeSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const ThemeSelector = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }

    @media (max-width: 480px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
`;

export const ThemeCard = styled.button<{ $selected: boolean; $previewBg: string; $previewAccent: string }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 8px;
    border: 2px solid ${props => props.$selected ? props.$previewAccent : darkTheme.border};
    background: ${darkTheme.backgroundDarker};
    cursor: pointer;
    transition: all 0.2s;
    min-width: 0; /* Allow shrinking in grid */

    &:hover {
        border-color: ${props => props.$previewAccent};
    }

    @media (max-width: 480px) {
        padding: 10px 8px;
        gap: 6px;
    }
`;

export const ThemePreview = styled.div<{ $bg: string; $accent: string; $text: string }>`
    width: 60px;
    height: 40px;
    border-radius: 4px;
    background: ${props => props.$bg};
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${props => props.$accent}40;

    &::before {
        content: 'Aa';
        color: ${props => props.$text};
        font-size: 14px;
        font-weight: 600;
    }

    &::after {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => props.$accent};
        margin-left: 6px;
    }

    @media (max-width: 480px) {
        width: 50px;
        height: 34px;

        &::before {
            font-size: 12px;
        }

        &::after {
            width: 6px;
            height: 6px;
            margin-left: 4px;
        }
    }
`;

export const ThemeName = styled.span`
    color: ${darkTheme.text.color};
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    word-break: break-word;

    @media (max-width: 480px) {
        font-size: 11px;
    }
`;

export const CustomThemeSection = styled.div`
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${darkTheme.border};
`;

export const CustomThemeHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

export const CustomThemeTitle = styled.h4`
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

export const CustomThemeActions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: stretch;
    }

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

export const ThemeFieldsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

export const ThemeFieldRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
`;

export const ThemeFieldLabel = styled.label`
    flex: 1;
    color: ${darkTheme.text.color};
    font-size: 12px;
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 480px) {
        white-space: normal;
    }
`;

export const ThemeFieldInput = styled.input`
    width: 100px;
    padding: 6px 8px;
    border-radius: 4px;
    border: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    color: ${darkTheme.text.color};
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    outline: none;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    &[type="color"] {
        width: 40px;
        height: 32px;
        padding: 2px;
        cursor: pointer;
    }

    @media (max-width: 480px) {
        width: 100%;
        box-sizing: border-box;

        &[type="color"] {
            width: 40px;
        }
    }
`;

export const ColorInputWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 480px) {
        width: 100%;

        ${ThemeFieldInput}:not([type="color"]) {
            flex: 1;
        }
    }
`;

export const ColorPreview = styled.div<{ $color: string }>`
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: ${props => props.$color};
    border: 1px solid ${darkTheme.border};
`;

export const SaveButton = styled.button`
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background: ${darkTheme.accent};
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
    transition: opacity 0.2s;
    white-space: nowrap;

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

    @media (max-width: 768px) {
        flex: 1;
        min-width: 0;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const ResetButton = styled.button`
    padding: 8px 16px;
    border-radius: 4px;
    border: 1px solid ${darkTheme.border};
    background: transparent;
    color: ${darkTheme.text.color};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-family: inherit;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
        background: ${darkTheme.backgroundDarker};
    }

    .material-symbols-outlined {
        font-size: 16px;
    }

    @media (max-width: 768px) {
        flex: 1;
        min-width: 0;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const CopyFromSelect = styled.select`
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    color: ${darkTheme.text.color};
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    outline: none;

    &:focus {
        border-color: ${darkTheme.accent};
    }

    option {
        background: ${darkTheme.backgroundDarkest};
        color: ${darkTheme.text.color};
    }

    @media (max-width: 768px) {
        flex: 1;
        min-width: 0;
    }

    @media (max-width: 480px) {
        width: 100%;
    }
`;

export const ExpandToggle = styled.button<{ $expanded: boolean }>`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 18px;
        transition: transform 0.2s;
        transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});
    }
`;