import React, { useMemo } from 'react';
import { Note } from '../../../services/notesApi';
import { 
    NoteCardStyled, 
    NoteCardHeader,
    PinIcon,
    NoteCardTitle, 
    NoteCardContent, 
    NoteCardFooter, 
    NoteCardActions 
} from './NoteCard.styles';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const ReminderBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
    background: ${darkTheme.accentOrange}30;
    color: ${darkTheme.accentOrange};
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    margin-left: auto;
    flex-shrink: 0;

    .material-symbols-outlined {
        font-size: 12px;
    }
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

    const activeRemindersCount = useMemo(() => {
        return (note.reminders || []).filter(r => r.enabled).length;
    }, [note.reminders]);

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
        <NoteCardStyled $rowSpan={rowSpan} $isPinned={note.isPinned} onClick={handleCardClick}>
            <NoteCardHeader>
                {note.isPinned && (
                    <PinIcon className="material-symbols-outlined">push_pin</PinIcon>
                )}
                <NoteCardTitle>{note.title || 'Untitled Note'}</NoteCardTitle>
                {activeRemindersCount > 0 && (
                    <ReminderBadge title={`${activeRemindersCount} active reminder${activeRemindersCount !== 1 ? 's' : ''}`}>
                        <span className="material-symbols-outlined">notifications</span>
                        {activeRemindersCount}
                    </ReminderBadge>
                )}
            </NoteCardHeader>
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
            {note.content && note.content !== '' && (
                <NoteCardContent>
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
                </NoteCardContent>
            )}
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