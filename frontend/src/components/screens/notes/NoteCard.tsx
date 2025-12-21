import React, { useMemo } from 'react';
import { Note } from '../../../services/notesApi';
import { NoteCardStyled, NoteCardTitle, NoteCardContent, NoteCardFooter, NoteCardActions } from './NoteCard.styles';

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

    // Calculate row span based on content length
    const rowSpan = useMemo(() => {
        const contentLength = note.content.length;
        const titleLength = (note.title || 'Untitled Note').length;
        const totalLength = contentLength + titleLength;

        // Base size: 1 row (up to 100 chars)
        // Medium: 2 rows (100-250 chars)
        // Large: 3 rows (250-500 chars)
        // XLarge: 4 rows (500+ chars)
        if (totalLength <= 100) return 1;
        if (totalLength <= 250) return 2;
        if (totalLength <= 500) return 3;
        return 4;
    }, [note.content, note.title]);

    // Calculate line clamp based on row span
    const lineClamp = useMemo(() => {
        // Approximate lines that fit in each row span
        // 1 row: ~3 lines, 2 rows: ~8 lines, 3 rows: ~13 lines, 4 rows: ~18 lines
        const linesPerRowSpan = {
            1: 3,
            2: 8,
            3: 13,
            4: 18
        };
        return linesPerRowSpan[rowSpan as keyof typeof linesPerRowSpan] || 3;
    }, [rowSpan]);

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't open viewer if clicking on action buttons
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