import React from 'react';
import { Note } from '../../../services/notesApi';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
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

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
`;

const TagPill = styled.span`
    background: ${darkTheme.accent}30;
    color: ${darkTheme.accent};
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
`;

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

    const visibleTags = (note.tags || []).filter(tag => tag !== 'default');

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
                        marginBottom: '8px',
                        color: 'inherit'
                    }}>
                        Last updated: {formatDate(note.updatedAt)}
                    </div>
                    {visibleTags.length > 0 && (
                        <TagsContainer>
                            {visibleTags.map(tag => (
                                <TagPill key={tag}>{tag}</TagPill>
                            ))}
                        </TagsContainer>
                    )}
                    <ViewerContent>{note.content}</ViewerContent>
                </ViewerBody>
            </ViewerModal>
        </ViewerOverlay>
    );
};

export default NoteViewer;