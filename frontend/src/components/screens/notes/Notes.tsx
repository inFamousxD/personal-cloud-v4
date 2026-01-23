import { useState, useEffect, useMemo, useRef } from 'react';
import { notesApi, Note, CreateNoteInput, NoteReminder } from '../../../services/notesApi';
import { pushNotificationService } from '../../../services/pushNotificationService';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import NoteViewer from './NoteViewer';
import {
    NotesContainer,
    NotesHeader,
    NotesHeaderTop,
    NotesHeaderLeft,
    NotesTitle,
    NotesCount,
    CreateButton,
    CreateButtonGroup,
    HiddenNoteButton,
    FilterBar,
    SearchWrapper,
    SearchInput,
    FilterControls,
    SortButton,
    FavoriteTags,
    FavoriteTagPill,
    TagFilterButton,
    TagFilterDropdown,
    TagFilterItem,
    TagFilterWrapper,
    SelectedTagsDisplay,
    NotesBody,
    NotesGrid,
    EmptyState,
    LoadingState,
    DeleteConfirmModal,
    DeleteConfirmContent,
    DeleteConfirmActions,
    RefreshButton
} from './Notes.styles';
import { useSelector } from 'react-redux';
import { RootState } from "../../../redux/store";
import VoiceRecorder from './VoiceRecorder';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const NotificationBanner = styled.div<{ $show: boolean }>`
    display: ${props => props.$show ? 'flex' : 'none'};
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: ${darkTheme.accentOrange}20;
    border: 1px solid ${darkTheme.accentOrange};
    border-radius: 4px;
    margin: 8px 12px 0;
    gap: 8px;
`;

const BannerText = styled.div`
    color: ${darkTheme.text.color};
    font-size: 12px;
    flex: 1;
`;

const BannerButton = styled.button`
    background: ${darkTheme.accentOrange};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;

    &:hover {
        opacity: 0.9;
    }
`;

const BannerClose = styled.button`
    background: transparent;
    border: none;
    color: ${darkTheme.text.color};
    cursor: pointer;
    padding: 4px;
    opacity: 0.5;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

type SortOrder = 'newest' | 'oldest';

const Notes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewingNote, setViewingNote] = useState<Note | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; noteId: string | null }>({
        isOpen: false,
        noteId: null
    });
    const [isCreatingHidden, setIsCreatingHidden] = useState(false);
    const [voiceTranscription, setVoiceTranscription] = useState<string | null>(null);
    const [showNotificationBanner, setShowNotificationBanner] = useState(false);

    // Filter and sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [favoriteTags, setFavoriteTags] = useState<string[]>([]);
    const [showTagFilter, setShowTagFilter] = useState(false);

    const tagFilterRef = useRef<HTMLDivElement>(null);
    const topOptions = useSelector((state: RootState) => state.mainDock.dockTopOptions);

    const MAX_FAVORITES = 5;

    useEffect(() => {
        loadNotes();
        loadTags();
        loadFavoriteTags();
        checkNotificationPermission();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tagFilterRef.current && !tagFilterRef.current.contains(event.target as Node)) {
                setShowTagFilter(false);
            }
        };

        if (showTagFilter) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTagFilter]);

    useEffect(() => {
        if (voiceTranscription) {
            handleVoiceNote(voiceTranscription);
            setVoiceTranscription(null);
        }
    }, [voiceTranscription]);

    const checkNotificationPermission = async () => {
        const permission = pushNotificationService.getPermission();
        const isSubscribed = await pushNotificationService.isSubscribed();
        
        // Show banner if notifications are not granted or not subscribed
        if (permission !== 'granted' || !isSubscribed) {
            setShowNotificationBanner(true);
        }
    };

    const handleUpdateReminders = async (noteId: string, reminders: NoteReminder[]) => {
        try {
            const updated = await notesApi.updateNote(noteId, { reminders });
            setNotes(notes.map(n => n._id === updated._id ? updated : n));
            if (viewingNote && viewingNote._id === noteId) {
                setViewingNote(updated);
            }
        } catch (error) {
            console.error('Error updating reminders:', error);
        }
    };

    const handleEnableNotifications = async () => {
        const success = await pushNotificationService.subscribe();
        if (success) {
            setShowNotificationBanner(false);
        }
    };

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

    const loadTags = async () => {
        try {
            const tags = await notesApi.getAllTags();
            const uniqueTags = Array.from(new Set([...tags, 'hidden', 'voice']));
            setAllTags(uniqueTags);
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    };

    const loadFavoriteTags = () => {
        const stored = localStorage.getItem('favoriteTags');
        if (stored) {
            setFavoriteTags(JSON.parse(stored));
        }
    };

    const saveFavoriteTags = (tags: string[]) => {
        localStorage.setItem('favoriteTags', JSON.stringify(tags));
        setFavoriteTags(tags);
    };

    const toggleFavoriteTag = (tag: string) => {
        const newFavorites = favoriteTags.includes(tag)
            ? favoriteTags.filter(t => t !== tag)
            : favoriteTags.length < MAX_FAVORITES
                ? [...favoriteTags, tag]
                : favoriteTags;
        saveFavoriteTags(newFavorites);
    };

    const removeFavoriteTag = (tag: string, e: React.MouseEvent) => {
        e.stopPropagation();
        saveFavoriteTags(favoriteTags.filter(t => t !== tag));
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        }
    };

    const handleVoiceNote = async (transcriptionData: string) => {
        if (!transcriptionData || transcriptionData.trim().length === 0) {
            console.log('Empty transcription received');
            return;
        }

        try {
            const noteData = JSON.parse(transcriptionData);
            
            const noteInput: CreateNoteInput = {
                title: noteData.title,
                content: noteData.content,
                tags: noteData.tags || ['voice']
            };

            const created = await notesApi.createNote(noteInput);
            setNotes([created, ...notes]);
            loadTags();
            
            console.log(`Voice note created successfully${noteData.useAI ? ' (AI-enhanced)' : ''}`);
        } catch (error) {
            console.error('Error creating voice note:', error);
        }
    };

    const filteredAndSortedNotes = useMemo(() => {
        let filtered = notes;

        const hasHiddenFilter = selectedTags.includes('hidden');
        
        if (hasHiddenFilter) {
            filtered = filtered.filter(note => note.tags.includes('hidden'));
        } else {
            filtered = filtered.filter(note => !note.tags.includes('hidden'));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(note => {
                const titleMatch = note.title.toLowerCase().includes(query);
                const contentMatch = note.content.toLowerCase().includes(query);
                const dateMatch = new Date(note.updatedAt).toLocaleDateString().toLowerCase().includes(query);
                const tagsMatch = note.tags.some(tag => tag.toLowerCase().includes(query));
                return titleMatch || contentMatch || dateMatch || tagsMatch;
            });
        }

        const otherSelectedTags = selectedTags.filter(tag => tag !== 'hidden');
        if (otherSelectedTags.length > 0) {
            filtered = filtered.filter(note => 
                otherSelectedTags.some(tag => note.tags.includes(tag))
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    }, [notes, searchQuery, selectedTags, sortOrder]);

    const handleCreateNote = () => {
        setEditingNote(null);
        setIsCreatingHidden(false);
        setIsEditorOpen(true);
    };

    const handleCreateHiddenNote = () => {
        setEditingNote(null);
        setIsCreatingHidden(true);
        setIsEditorOpen(true);
    };

    const handleViewNote = (note: Note) => {
        setViewingNote(note);
        setIsViewerOpen(true);
    };

    const handleEditNote = (note: Note) => {
        setEditingNote(note);
        setIsCreatingHidden(false);
        setIsEditorOpen(true);
    };

    const handleSaveNote = async (noteInput: CreateNoteInput, reminders?: NoteReminder[]) => {
        try {
            if (editingNote) {
                const updated = await notesApi.updateNote(editingNote._id!, {
                    ...noteInput,
                    reminders
                });
                setNotes(notes.map(n => n._id === updated._id ? updated : n));
            } else {
                const created = await notesApi.createNote(noteInput);
                // If reminders were added, update the note with them
                if (reminders && reminders.length > 0) {
                    const withReminders = await notesApi.updateNote(created._id!, { reminders });
                    setNotes([withReminders, ...notes]);
                } else {
                    setNotes([created, ...notes]);
                }
            }
            setIsEditorOpen(false);
            setEditingNote(null);
            setIsCreatingHidden(false);
            loadTags();
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleTogglePin = async (note: Note) => {
        try {
            const updated = await notesApi.updateNote(note._id!, {
                isPinned: !note.isPinned
            });
            setNotes(notes.map(n => n._id === updated._id ? updated : n));
            if (viewingNote && viewingNote._id === note._id) {
                setViewingNote(updated);
            }
        } catch (error) {
            console.error('Error toggling pin:', error);
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
            loadTags();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ isOpen: false, noteId: null });
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const handleTagFilter = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const clearAllTags = () => {
        setSelectedTags([]);
        setShowTagFilter(false);
    };

    const handleFavoriteTagClick = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const getTagFilterButtonText = () => {
        if (selectedTags.length === 0) return 'All Tags';
        if (selectedTags.length === 1) return selectedTags[0];
        return `${selectedTags.length} Tags`;
    };

    return (
        <NotesContainer>
            <NotificationBanner $show={showNotificationBanner}>
                <BannerText>
                    Enable notifications to receive reminders for your pinned notes
                </BannerText>
                <BannerButton onClick={handleEnableNotifications}>
                    Enable
                </BannerButton>
                <BannerClose onClick={() => setShowNotificationBanner(false)}>
                    <span className="material-symbols-outlined">close</span>
                </BannerClose>
            </NotificationBanner>

            <NotesHeader>
                <NotesHeaderTop>
                    <NotesHeaderLeft>
                        <NotesTitle>
                            <span className="material-symbols-outlined">{topOptions.find(o => o.id === "notes")?.icon}</span>
                            Notes
                            <NotesCount>({filteredAndSortedNotes.length})</NotesCount>
                            <RefreshButton onClick={() => loadNotes()}>
                                <span className="material-symbols-outlined">refresh</span>
                                Refresh
                            </RefreshButton>
                        </NotesTitle>
                    </NotesHeaderLeft>
                    <CreateButtonGroup>
                        <HiddenNoteButton onClick={handleCreateHiddenNote} title="Create hidden note">
                            <span className="material-symbols-outlined">add</span>
                        </HiddenNoteButton>
                        <VoiceRecorder 
                            onTranscriptionComplete={setVoiceTranscription}
                            disabled={loading}
                            useAI={true}
                        />
                        <CreateButton onClick={handleCreateNote}>
                            <span className="material-symbols-outlined">add</span>
                            New Note
                        </CreateButton>
                    </CreateButtonGroup>
                </NotesHeaderTop>

                <FilterBar>
                    <SearchWrapper>
                        <span className="material-symbols-outlined">search</span>
                        <SearchInput
                            type="text"
                            placeholder="Search notes"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchWrapper>
                    
                    <FilterControls>
                        {favoriteTags.length > 0 && (
                            <FavoriteTags>
                                {favoriteTags.map(tag => (
                                    <FavoriteTagPill
                                        key={tag}
                                        $active={selectedTags.includes(tag)}
                                        onClick={() => handleFavoriteTagClick(tag)}
                                    >
                                        {tag}
                                        <span 
                                            className="material-symbols-outlined"
                                            onClick={(e) => removeFavoriteTag(tag, e)}
                                        >
                                            close
                                        </span>
                                    </FavoriteTagPill>
                                ))}
                            </FavoriteTags>
                        )}

                        <TagFilterWrapper ref={tagFilterRef}>
                            <TagFilterButton onClick={() => setShowTagFilter(!showTagFilter)}>
                                <span className="material-symbols-outlined">label</span>
                                <SelectedTagsDisplay>
                                    <span>{getTagFilterButtonText()}</span>
                                </SelectedTagsDisplay>
                            </TagFilterButton>
                            {showTagFilter && (
                                <TagFilterDropdown>
                                    <TagFilterItem
                                        $selected={selectedTags.length === 0}
                                        onClick={clearAllTags}
                                    >
                                        All Tags
                                        {selectedTags.length === 0 && (
                                            <span className="material-symbols-outlined">check</span>
                                        )}
                                    </TagFilterItem>
                                    {allTags.map(tag => (
                                        <TagFilterItem
                                            key={tag}
                                            $selected={selectedTags.includes(tag)}
                                            onClick={() => handleTagFilter(tag)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', flexDirection: 'row', width: '100%' }}>
                                                <>
                                                    {tag}
                                                </>
                                                {!favoriteTags.includes(tag) && favoriteTags.length < MAX_FAVORITES && tag !== 'hidden' && (
                                                    <span 
                                                        className="material-symbols-outlined"
                                                        style={{ fontSize: '12px', opacity: 0.5 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavoriteTag(tag);
                                                        }}
                                                        title="Add to favorites"
                                                    >
                                                        star
                                                    </span>
                                                )}
                                            </div>
                                            {selectedTags.includes(tag) && (
                                                <span className="material-symbols-outlined">check</span>
                                            )}
                                        </TagFilterItem>
                                    ))}
                                </TagFilterDropdown>
                            )}
                        </TagFilterWrapper>

                        <SortButton $active={sortOrder === 'newest'} onClick={toggleSortOrder}>
                            <span className="material-symbols-outlined">
                                {sortOrder === 'newest' ? 'arrow_downward' : 'arrow_upward'}
                            </span>
                            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                        </SortButton>
                    </FilterControls>
                </FilterBar>
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
                ) : filteredAndSortedNotes.length === 0 ? (
                    <EmptyState>
                        <span className="material-symbols-outlined">
                            {searchQuery || selectedTags.length > 0 ? 'search_off' : 'note_add'}
                        </span>
                        <h3>
                            {searchQuery || selectedTags.length > 0 ? 'No notes found' : 'No notes yet'}
                        </h3>
                        <p>
                            {searchQuery || selectedTags.length > 0
                                ? 'Try adjusting your search or filters.'
                                : 'Create your first note to get started. Click the "New Note" button above.'}
                        </p>
                    </EmptyState>
                ) : (
                    <NotesGrid>
                        {filteredAndSortedNotes.map(note => (
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
                onTogglePin={handleTogglePin}
                onUpdateReminders={handleUpdateReminders}
                note={viewingNote}
            />

            <NoteEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingNote(null);
                    setIsCreatingHidden(false);
                }}
                onSave={handleSaveNote}
                editingNote={editingNote}
                availableTags={allTags}
                initialHiddenTag={isCreatingHidden}
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