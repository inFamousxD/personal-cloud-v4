import React, { useState, useEffect } from 'react';
import { Note, CreateNoteInput, NoteReminder } from '../../../services/notesApi';
import TagInput from './TagInput';
import ReminderList from './ReminderList';
import {
    EditorOverlay,
    EditorModal,
    EditorHeader,
    EditorTitle,
    CloseButton,
    EditorBody,
    EditorInput,
    EditorTextarea,
    EditorFooter,
    EditorButton,
    CharacterCount
} from './NoteEditor.styles';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const PinToggle = styled.button<{ $isPinned: boolean }>`
    background: transparent;
    border: none;
    color: ${props => props.$isPinned ? darkTheme.accent : darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => props.$isPinned ? 1 : 0.5};
    transition: all 0.2s;

    &:hover {
        opacity: 1;
        transform: scale(1.1);
    }

    .material-symbols-outlined {
        font-size: 20px;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: CreateNoteInput, reminders?: NoteReminder[]) => Promise<void> | void;
    editingNote: Note | null;
    availableTags: string[];
    initialHiddenTag?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    editingNote, 
    availableTags,
    initialHiddenTag = false
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>(['default']);
    const [isPinned, setIsPinned] = useState(false);
    const [reminders, setReminders] = useState<NoteReminder[]>([]);

    useEffect(() => {
        if (editingNote) {
            setTitle(editingNote.title);
            setContent(editingNote.content);
            setTags(editingNote.tags || ['default']);
            setIsPinned(editingNote.isPinned || false);
            setReminders(editingNote.reminders || []);
        } else if (initialHiddenTag) {
            setTitle('');
            setContent('');
            setTags(['hidden']);
            setIsPinned(false);
            setReminders([]);
        } else {
            setTitle('');
            setContent('');
            setTags(['default']);
            setIsPinned(false);
            setReminders([]);
        }
    }, [editingNote, isOpen, initialHiddenTag]);

    const handleSave = () => {
        if (!title.trim() && !content.trim()) {
            return;
        }

        const noteData: CreateNoteInput = {
            title: title.trim() || 'Untitled Note',
            content: content.trim(),
            tags: tags.filter(tag => tag !== 'default').length > 0 
                ? tags.filter(tag => tag !== 'default') 
                : ['default'],
            isPinned
        };

        onSave(noteData, reminders);

        setTitle('');
        setContent('');
        setTags(['default']);
        setIsPinned(false);
        setReminders([]);
    };

    const handleCancel = () => {
        setTitle('');
        setContent('');
        setTags(['default']);
        setIsPinned(false);
        setReminders([]);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave();
        }
    };

    const togglePin = () => {
        setIsPinned(!isPinned);
    };

    if (!isOpen) return null;

    return (
        <EditorOverlay onClick={handleCancel}>
            <EditorModal onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <EditorHeader>
                    <EditorTitle>
                        {editingNote ? 'Edit Note' : initialHiddenTag ? 'Create Hidden Note' : 'Create New Note'}
                    </EditorTitle>
                    <HeaderActions>
                        <PinToggle 
                            $isPinned={isPinned} 
                            onClick={togglePin}
                            title={isPinned ? 'Unpin note' : 'Pin note'}
                        >
                            <span className="material-symbols-outlined">
                                {isPinned ? 'push_pin' : 'push_pin'}
                            </span>
                        </PinToggle>
                        <CloseButton onClick={handleCancel}>
                            <span className="material-symbols-outlined">close</span>
                        </CloseButton>
                    </HeaderActions>
                </EditorHeader>

                <EditorBody>
                    <EditorInput
                        type="text"
                        placeholder="Note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        autoFocus
                    />
                    <TagInput
                        tags={tags}
                        onChange={setTags}
                        availableTags={availableTags}
                        placeholder="Add tags..."
                    />
                    <EditorTextarea
                        placeholder="Write your note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={5000}
                    />
                    <CharacterCount>
                        {content.length} / 5000 characters
                    </CharacterCount>

                    <ReminderList 
                        reminders={reminders} 
                        onChange={setReminders}
                    />
                </EditorBody>

                <EditorFooter>
                    <EditorButton variant="secondary" onClick={handleCancel}>
                        Cancel
                    </EditorButton>
                    <EditorButton 
                        variant="primary" 
                        onClick={handleSave}
                        disabled={!title.trim() && !content.trim()}
                    >
                        <span className="material-symbols-outlined">save</span>
                        {editingNote ? 'Update' : 'Create'}
                    </EditorButton>
                </EditorFooter>
            </EditorModal>
        </EditorOverlay>
    );
};

export default NoteEditor;