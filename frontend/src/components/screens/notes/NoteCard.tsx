import React, { useMemo } from 'react';
import { Note } from '../../../services/notesApi';
import { NoteCardStyled, NoteCardTitle, NoteCardContent, NoteCardFooter, NoteCardActions } from './NoteCard.styles';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
    flex-shrink: 0;
`;

const TagPill = styled.span`
    background: ${darkTheme.accent}20;
    color: ${darkTheme.accent};
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
`;

interface NoteCardProps {
    note: Note;
    onView: (note: Note) => void;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onView, onEdit, onDelete }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const visibleTags = useMemo(() => {
        return (note.tags || []).filter(tag => tag !== 'default');
    }, [note.tags]);

    // Calculate row span based on content length
    const rowSpan = useMemo(() => {
        const contentLength = note.content.length;
        const titleLength = (note.title || 'Untitled Note').length;
        const totalLength = contentLength + titleLength;

        if (totalLength <= 100) return 1;
        if (totalLength <= 250) return 2;
        if (totalLength <= 500) return 3;
        return 4;
    }, [note.content, note.title]);

    // Calculate line clamp based on row span
    const lineClamp = useMemo(() => {
        const linesPerRowSpan = {
            1: visibleTags.length > 0 ? 2 : 3,
            2: visibleTags.length > 0 ? 6 : 8,
            3: visibleTags.length > 0 ? 11 : 13,
            4: visibleTags.length > 0 ? 16 : 18
        };
        return linesPerRowSpan[rowSpan as keyof typeof linesPerRowSpan] || 3;
    }, [rowSpan, visibleTags.length]);

    const handleCardClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.material-symbols-outlined')) {
            return;
        }
        onView(note);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(note);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(note._id!);
    };

    return (
        <NoteCardStyled $rowSpan={rowSpan} onClick={handleCardClick}>
            <NoteCardTitle>{note.title || 'Untitled Note'}</NoteCardTitle>
            {visibleTags.length > 0 && (
                <TagsContainer>
                    {visibleTags.slice(0, 3).map(tag => (
                        <TagPill key={tag}>{tag}</TagPill>
                    ))}
                    {visibleTags.length > 3 && (
                        <TagPill>+{visibleTags.length - 3}</TagPill>
                    )}
                </TagsContainer>
            )}
            <NoteCardContent style={{ WebkitLineClamp: lineClamp }}>
                {note.content}
            </NoteCardContent>
            <NoteCardFooter>
                <span>{formatDate(note.updatedAt)}</span>
                <NoteCardActions>
                    <span 
                        className="material-symbols-outlined"
                        onClick={handleEdit}
                        title="Edit note"
                    >
                        edit
                    </span>
                    <span 
                        className="material-symbols-outlined"
                        onClick={handleDelete}
                        title="Delete note"
                    >
                        delete
                    </span>
                </NoteCardActions>
            </NoteCardFooter>
        </NoteCardStyled>
    );
};

export default NoteCard;