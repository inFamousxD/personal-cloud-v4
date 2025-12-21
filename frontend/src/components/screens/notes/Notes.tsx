import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { notesApi, Note, CreateNoteInput } from '../../../services/notesApi';
import {
    NotesContainer,
    NotesHeader,
    NotesTitle,
    LogoutButton,
    UserInfo,
    UserAvatar,
    UserName,
    NotesContent,
    NotesList,
    NoteCard,
    NoteTitle,
    NotePreview,
    NoteDate,
    CreateNoteButton,
    NoteEditor,
    EditorInput,
    EditorTextarea,
    EditorActions,
    SaveButton,
    CancelButton,
    DeleteButton,
    EmptyState,
    NoteCardActions,
} from './Notes.styles';

const Notes = () => {
    const { user, logout } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await notesApi.getAllNotes();
            setNotes(data);
        } catch (error) {
            console.error('Failed to load notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async () => {
        if (!title.trim() || !content.trim()) return;

        try {
            const noteInput: CreateNoteInput = {
                title: title.trim(),
                content: content.trim(),
            };
            const newNote = await notesApi.createNote(noteInput);
            setNotes([newNote, ...notes]);
            setTitle('');
            setContent('');
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const handleUpdateNote = async () => {
        if (!selectedNote || !title.trim() || !content.trim()) return;

        try {
            const updated = await notesApi.updateNote(selectedNote._id!, {
                title: title.trim(),
                content: content.trim(),
            });
            setNotes(notes.map((n) => (n._id === updated._id ? updated : n)));
            setSelectedNote(null);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;

        try {
            await notesApi.deleteNote(id);
            setNotes(notes.filter((n) => n._id !== id));
            if (selectedNote?._id === id) {
                setSelectedNote(null);
                setTitle('');
                setContent('');
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const handleEditNote = (note: Note) => {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content);
        setIsCreating(false);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setSelectedNote(null);
        setTitle('');
        setContent('');
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <NotesContainer>
            <NotesHeader>
                <NotesTitle>My Notes</NotesTitle>
                <UserInfo>
                    {user && (
                        <>
                            <UserAvatar src={user.picture} alt={user.name} />
                            <UserName>{user.name}</UserName>
                            <LogoutButton onClick={logout}>Logout</LogoutButton>
                        </>
                    )}
                </UserInfo>
            </NotesHeader>

            <NotesContent>
                <NotesList>
                    <CreateNoteButton onClick={() => setIsCreating(true)}>
                        + New Note
                    </CreateNoteButton>

                    {loading ? (
                        <EmptyState>Loading notes...</EmptyState>
                    ) : notes.length === 0 ? (
                        <EmptyState>No notes yet. Create your first note!</EmptyState>
                    ) : (
                        notes.map((note) => (
                            <NoteCard
                                key={note._id}
                                onClick={() => handleEditNote(note)}
                                $isSelected={selectedNote?._id === note._id}
                            >
                                <NoteTitle>{note.title}</NoteTitle>
                                <NotePreview>{note.content.substring(0, 100)}...</NotePreview>
                                <NoteDate>{formatDate(note.updatedAt)}</NoteDate>
                                <NoteCardActions onClick={(e) => e.stopPropagation()}>
                                    <DeleteButton onClick={() => handleDeleteNote(note._id!)}>
                                        Delete
                                    </DeleteButton>
                                </NoteCardActions>
                            </NoteCard>
                        ))
                    )}
                </NotesList>

                {(isCreating || selectedNote) && (
                    <NoteEditor>
                        <EditorInput
                            type="text"
                            placeholder="Note title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <EditorTextarea
                            placeholder="Start writing..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <EditorActions>
                            <CancelButton onClick={handleCancel}>Cancel</CancelButton>
                            <SaveButton
                                onClick={selectedNote ? handleUpdateNote : handleCreateNote}
                            >
                                {selectedNote ? 'Update' : 'Save'}
                            </SaveButton>
                        </EditorActions>
                    </NoteEditor>
                )}

                {!isCreating && !selectedNote && (
                    <EmptyState>Select a note to edit or create a new one</EmptyState>
                )}
            </NotesContent>
        </NotesContainer>
    );
};

export default Notes;