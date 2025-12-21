import React from 'react';
import { Note } from '../../../services/notesApi';
import {
    ViewerOverlay,
    ViewerModal,
    ViewerHeader,
    ViewerTitle,
    ViewerActions,
    CloseButton,
    ViewerBody,
    ViewerContent
} from './NoteViewer.styles';

interface NoteViewerProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
    note: Note | null;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ isOpen, onClose, onEdit, onDelete, note }) => {
    if (!isOpen || !note) return null;

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleEdit = () => {
        onClose();
        onEdit(note);
    };

    const handleDelete = () => {
        onClose();
        onDelete(note._id!);
    };

    return (
        <ViewerOverlay onClick={onClose}>
            <ViewerModal onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <ViewerHeader>
                    <ViewerTitle>{note.title || 'Untitled Note'}</ViewerTitle>
                    <ViewerActions>
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
                        <CloseButton onClick={onClose}>
                            <span className="material-symbols-outlined">close</span>
                        </CloseButton>
                    </ViewerActions>
                </ViewerHeader>

                <ViewerBody>
                    <div style={{ 
                        fontSize: '11px', 
                        opacity: 0.5, 
                        marginBottom: '16px',
                        color: 'inherit'
                    }}>
                        Last updated: {formatDate(note.updatedAt)}
                    </div>
                    <ViewerContent>{note.content}</ViewerContent>
                </ViewerBody>
            </ViewerModal>
        </ViewerOverlay>
    );
};

export default NoteViewer;