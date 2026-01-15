import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

interface NoteCardStyledProps {
    $rowSpan: number;
}

export const NoteCardStyled = styled.div<NoteCardStyledProps>`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    grid-row: span ${props => props.$rowSpan};
    overflow: hidden;
    
    @media (max-width: 480px) {
        grid-row: auto;
        height: auto;
    }
`;

export const NoteCardTitle = styled.h3`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
    `;

export const NoteCardContent = styled.p`
    font-size: 13px;
    line-height: 1.6;
    word-wrap: break-word;
    color: ${darkTheme.text.color};
    overflow: hidden;
    margin: 0;
    flex: 1;

    /* 
    display: -webkit-box;
    font-size: 13px;
    line-height: 1.5;
    */

    /* Typography */
    p {
        margin: 0 0 8px 0;

        &:last-child {
            margin-bottom: 0;
        }
    }

    h1, h2, h3, h4, h5, h6 {
        color: ${darkTheme.accent};
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.3;

        &:first-child {
            margin-top: 0;
        }
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; }

    /* Lists */
    ul, ol {
        margin: 8px 0;
        padding-left: 24px;
    }

    li {
        margin: 4px 0;
    }

    /* Code */
    code {
        background: ${darkTheme.accentDark};
        padding: 0px 6px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
    }

    pre {
        margin: 0px;
        border-radius: 8px;
        overflow-x: auto;
        background: #1e1e1e;
        padding: 0px 8px;
        max-width: 100%; /* Constrain to bubble width */
        
        code {
            background: transparent;
            padding: 0;
            font-family: 'JetBrains Mono' !important;
        }

        &::-webkit-scrollbar {
            height: 8px;
        }

        &::-webkit-scrollbar-track {
            background: ${darkTheme.backgroundDarker};
        }

        &::-webkit-scrollbar-thumb {
            background: ${darkTheme.accent}40;
            border-radius: 4px;
        }
    }

    /* Blockquotes */
    blockquote {
        border-left: 3px solid ${darkTheme.accent};
        margin: 12px 0;
        padding-left: 16px;
        opacity: 0.8;
    }

    /* Links */
    a {
        color: ${darkTheme.accent};
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    /* KaTeX Math Styling */
    .katex {
        font-size: 1.1em;
    }

    .katex-display {
        margin: 1em 0;
        overflow-x: auto;
        overflow-y: hidden;

        &::-webkit-scrollbar {
            height: 6px;
        }

        &::-webkit-scrollbar-track {
            background: ${darkTheme.backgroundDarker};
        }

        &::-webkit-scrollbar-thumb {
            background: ${darkTheme.accent}40;
            border-radius: 3px;
        }
    }

    /* Tables */
    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
    }

    th, td {
        border: 1px solid ${darkTheme.border};
        padding: 8px 12px;
        text-align: left;
    }

    th {
        background: ${darkTheme.backgroundDarker};
        font-weight: 600;
    }
`;

export const NoteCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid ${darkTheme.border};
    flex-shrink: 0;

    span {
        color: ${darkTheme.text.color};
        opacity: 0.5;
        font-size: 11px;
    }
`;

export const NoteCardActions = styled.div`
    display: flex;
    gap: 4px;

    .material-symbols-outlined {
        font-size: 16px;
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