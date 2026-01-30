import React, { useState } from 'react';
import { Note, NoteReminder } from '../../../services/notesApi';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReminderList from './ReminderList';

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
    background: color-mix(in srgb, ${darkTheme.accent} 15%, transparent);
    color: ${darkTheme.accent};
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
`;

const PinToggle = styled.span<{ $isPinned: boolean }>`
    color: ${props => props.$isPinned ? darkTheme.backgroundDarker : darkTheme.text.color} !important;
    background-color: ${props => props.$isPinned ? darkTheme.accent : 'transparent'};
    border-radius: 6px;
    opacity: 1 !important;
    cursor: pointer;
    
    &:hover {
        opacity: 1;
    }
`;

const ReminderSection = styled.div`
    margin: 24px 0px 0px 0px;
`;

interface NoteViewerProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (note: Note) => void;
    onDelete: (id: string) => void;
    onTogglePin?: (note: Note) => void;
    onUpdateReminders?: (noteId: string, reminders: NoteReminder[]) => void;
    note: Note | null;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ 
    isOpen, 
    onClose, 
    onEdit, 
    onDelete, 
    onTogglePin, 
    onUpdateReminders,
    note 
}) => {
    const [reminders, setReminders] = useState<NoteReminder[]>(note?.reminders || []);

    React.useEffect(() => {
        if (note) {
            setReminders(note.reminders || []);
        }
    }, [note]);

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

    const handleTogglePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onTogglePin) {
            onTogglePin(note);
        }
    };

    const handleRemindersChange = (updatedReminders: NoteReminder[]) => {
        setReminders(updatedReminders);
        if (onUpdateReminders && note._id) {
            onUpdateReminders(note._id, updatedReminders);
        }
    };

    return (
        <ViewerOverlay onClick={onClose}>
            <ViewerModal onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <ViewerHeader>
                    <ViewerTitle>{note.title || 'Untitled Note'}</ViewerTitle>
                    <ViewerActions>
                        {onTogglePin && (
                            <PinToggle 
                                $isPinned={note.isPinned}
                                className="material-symbols-outlined"
                                onClick={handleTogglePin}
                                title={note.isPinned ? 'Unpin note' : 'Pin note'}
                            >
                                push_pin
                            </PinToggle>
                        )}
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

                    <ViewerContent>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            style={vscDarkPlus as any}
                                            language={match[1]}
                                            PreTag="div"
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {note.content}
                        </ReactMarkdown>
                    </ViewerContent>
     
                    {onUpdateReminders && (
                        <ReminderSection>
                            <ReminderList 
                                reminders={reminders}
                                onChange={handleRemindersChange}
                            />
                        </ReminderSection>
                    )}

                </ViewerBody>
            </ViewerModal>
        </ViewerOverlay>
    );
};

export default NoteViewer;