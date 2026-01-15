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
    color: ${darkTheme.text.color};
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
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