import { useState, useEffect } from 'react';
import { notesApi, Note, CreateNoteInput } from '../../../services/notesApi';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import {
    NotesContainer,
    NotesHeader,
    NotesHeaderLeft,
    NotesTitle,
    NotesCount,
    CreateButton,
    NotesBody,
    NotesGrid,
    EmptyState,
    LoadingState,
    DeleteConfirmModal,
    DeleteConfirmContent,
    DeleteConfirmActions
} from './Notes.styles';

const Notes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewingNote, setViewingNote] = useState<Note | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; noteId: string | null }>({
        isOpen: false,
        noteId: null
    });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const data = await notesApi.getAllNotes();
            setNotes(data);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = () => {
        setEditingNote(null);
        setIsEditorOpen(true);
    };

    const handleViewNote = (note: Note) => {
        setViewingNote(note);
        setIsViewerOpen(true);
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setIsEditorOpen(true);
    };

    const handleSaveNote = async (noteInput: CreateNoteInput) => {
        try {
            if (editingNote) {
                // Update existing note
                const updated = await notesApi.updateNote(editingNote._id!, noteInput);
                setNotes(notes.map(n => n._id === updated._id ? updated : n));
            } else {
                // Create new note
                const created = await notesApi.createNote(noteInput);
                setNotes([created, ...notes]);
            }
            setIsEditorOpen(false);
            setEditingNote(null);
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleDeleteNote = (noteId: string) => {
        setDeleteConfirm({ isOpen: true, noteId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.noteId) return;

        try {
            await notesApi.deleteNote(deleteConfirm.noteId);
            setNotes(notes.filter(n => n._id !== deleteConfirm.noteId));
            setDeleteConfirm({ isOpen: false, noteId: null });
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ isOpen: false, noteId: null });
    };

    return (
        <NotesContainer>
            <NotesHeader>
                <NotesHeaderLeft>
                    <NotesTitle>
                        <span className="material-symbols-outlined">notes</span>
                        Notes
                        <NotesCount>({notes.length})</NotesCount>
                    </NotesTitle>
                </NotesHeaderLeft>
                <CreateButton onClick={handleCreateNote}>
                    <span className="material-symbols-outlined">add</span>
                    New Note
                </CreateButton>
            </NotesHeader>

            <NotesBody>
                {loading ? (
                    <LoadingState>
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </LoadingState>
                ) : notes.length === 0 ? (
                    <EmptyState>
                        <span className="material-symbols-outlined">note_add</span>
                        <h3>No notes yet</h3>
                        <p>Create your first note to get started. Click the "New Note" button above.</p>
                    </EmptyState>
                ) : (
                    <NotesGrid>
                        {notes.map(note => (
                            <NoteCard
                                key={note._id}
                                note={note}
                                onView={handleViewNote}
                                onEdit={handleEditNote}
                                onDelete={handleDeleteNote}
                            />
                        ))}
                    </NotesGrid>
                )}
            </NotesBody>

            <NoteViewer
                isOpen={isViewerOpen}
                onClose={() => {
                    setIsViewerOpen(false);
                    setViewingNote(null);
                }}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                note={viewingNote}
            />

            <NoteEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingNote(null);
                }}
                onSave={handleSaveNote}
                editingNote={editingNote}
            />

            {deleteConfirm.isOpen && (
                <DeleteConfirmModal onClick={cancelDelete}>
                    <DeleteConfirmContent onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Note?</h3>
                        <p>Are you sure you want to delete this note? This action cannot be undone.</p>
                        <DeleteConfirmActions>
                            <button onClick={cancelDelete}>Cancel</button>
                            <button onClick={confirmDelete}>Delete</button>
                        </DeleteConfirmActions>
                    </DeleteConfirmContent>
                </DeleteConfirmModal>
            )}
        </NotesContainer>
    );
};

export default Notes;