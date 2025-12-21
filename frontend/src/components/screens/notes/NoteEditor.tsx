import React, { useState, useEffect } from 'react';
import { Note, CreateNoteInput } from '../../../services/notesApi';
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

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (note: CreateNoteInput) => void;
    editingNote?: Note | null;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, onClose, onSave, editingNote }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (editingNote) {
            setTitle(editingNote.title);
            setContent(editingNote.content);
        } else {
            setTitle('');
            setContent('');
        }
    }, [editingNote, isOpen]);

    const handleSave = () => {
        if (!title.trim() && !content.trim()) {
            return;
        }

        onSave({
            title: title.trim() || 'Untitled Note',
            content: content.trim()
        });

        setTitle('');
        setContent('');
    };

    const handleCancel = () => {
        setTitle('');
        setContent('');
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave();
        }
    };

    if (!isOpen) return null;

    return (
        <EditorOverlay onClick={handleCancel}>
            <EditorModal onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <EditorHeader>
                    <EditorTitle>
                        {editingNote ? 'Edit Note' : 'Create New Note'}
                    </EditorTitle>
                    <CloseButton onClick={handleCancel}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
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
                    <EditorTextarea
                        placeholder="Write your note here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={5000}
                    />
                    <CharacterCount>
                        {content.length} / 5000 characters
                    </CharacterCount>
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