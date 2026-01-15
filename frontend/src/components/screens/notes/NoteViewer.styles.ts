import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

export const ViewerOverlay = styled.div`
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

export const ViewerModal = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    width: 90%;
    max-width: 800px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 95%;
        max-height: 90vh;
    }
`;

export const ViewerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${darkTheme.border};
    background: ${darkTheme.backgroundDarkest};
    flex-shrink: 0;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
`;

export const ViewerTitle = styled.h2`
    color: ${darkTheme.accent};
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    padding-right: 12px;
`;

export const ViewerActions = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;

    .material-symbols-outlined {
        font-size: 16px;
        color: ${darkTheme.text.color};
        opacity: 0.5;
        cursor: pointer;
        padding: 4px;

        &:hover {
            opacity: 1;
        }

        &:nth-child(2):hover {
            color: #e74c3c;
        }
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
    margin-left: 4px;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

export const ViewerBody = styled.div`
    padding: 12px;
    flex: 1;
    overflow-y: auto;
    color: ${darkTheme.text.color};

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

export const ViewerContent = styled.div`
    font-size: 13px;
    line-height: 1.6;
    word-wrap: break-word;

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