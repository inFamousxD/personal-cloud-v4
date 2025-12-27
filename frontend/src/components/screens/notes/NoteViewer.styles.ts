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
    white-space: pre-wrap;
    word-wrap: break-word;
`;