import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { journalsApi, Journal, Folder, CreateJournalInput } from '../../../services/journalsApi';
import {
    JournalContainer,
    JournalSidebar,
    SidebarHeader,
    SidebarTitle,
    SidebarActions,
    IconButton,
    SidebarBody,
    FolderItem,
    FolderHeader,
    FolderName,
    FolderActions,
    JournalsList,
    JournalItem,
    JournalItemHeader,
    JournalTitle,
    JournalSubtitle,
    JournalContent,
    ContentHeader,
    ToggleSidebarButton,
    ContentActions,
    ActionButton,
    EditorContainer,
    EditorModeToggle,
    ModeButton,
    MarkdownEditor,
    MarkdownPreview,
    EmptyState,
    LoadingState,
    ModalOverlay,
    ModalContent,
    ModalInput,
    ModalActions,
    SidebarOverlay
} from './Journal.styles';

const Journals = () => {
    const { journalId } = useParams<{ journalId?: string }>();
    const navigate = useNavigate();

    const [journals, setJournals] = useState<Journal[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [expandedJournals, setExpandedJournals] = useState<Set<string>>(new Set());
    const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');

    // Current journal state
    const [currentJournal, setCurrentJournal] = useState<Journal | null>(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [content, setContent] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Modal states
    const [createFolderModal, setCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ 
        isOpen: boolean; 
        type: 'journal' | 'folder' | null;
        id: string | null;
        name: string;
    }>({ isOpen: false, type: null, id: null, name: '' });

    useEffect(() => {
        loadData();
        console.log(title, subtitle);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (currentJournal && hasUnsavedChanges) {
                    handleSaveJournal();
                }
            }
            // Ctrl+P or Cmd+P to toggle preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                setEditorMode(mode => mode === 'edit' ? 'preview' : 'edit');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentJournal, hasUnsavedChanges, content]);

    useEffect(() => {
        if (journalId && journals.length > 0) {
            const journal = journals.find(j => j._id === journalId);
            if (journal) {
                loadJournal(journal);
            }
        } else if (!journalId) {
            setCurrentJournal(null);
            setTitle('');
            setSubtitle('');
            setContent('');
            setHasUnsavedChanges(false);
        }
    }, [journalId, journals]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [journalsData, foldersData] = await Promise.all([
                journalsApi.getAllJournals(),
                journalsApi.getAllFolders()
            ]);
            setJournals(journalsData);
            setFolders(foldersData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadJournal = (journal: Journal) => {
        setCurrentJournal(journal);
        setTitle(journal.title);
        setSubtitle(journal.subtitle);
        setContent(journal.content);
        setHasUnsavedChanges(false);
    };

    const handleCreateJournal = async (folderId?: string | null) => {
        const defaultDate = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const initialContent = `# Untitled Journal
${defaultDate}

---

Start writing your thoughts here...`;

        const newJournalInput: CreateJournalInput = {
            title: 'Untitled Journal',
            subtitle: defaultDate,
            content: initialContent,
            folderId: folderId || null
        };

        try {
            const created = await journalsApi.createJournal(newJournalInput);
            setJournals([created, ...journals]);
            navigate(`/journal/${created._id}`);
        } catch (error) {
            console.error('Error creating journal:', error);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveJournal = async () => {
        if (!currentJournal || !currentJournal._id) return;
        setIsSaving(true);

        // Parse title and subtitle from content
        const lines = content.split('\n');
        let parsedTitle = 'Untitled Journal';
        let parsedSubtitle = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // First line is the title (remove # if present)
        if (lines.length > 0 && lines[0].trim()) {
            parsedTitle = lines[0].trim().replace(/^#\s*/, '') || 'Untitled Journal';
        }

        // Second populated line (ignoring blank lines) is the subtitle
        let foundTitle = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                if (!foundTitle) {
                    foundTitle = true; // First non-empty line is title
                } else {
                    // Second non-empty line is subtitle
                    parsedSubtitle = line.replace(/^#\s*/, '');
                    break;
                }
            }
        }

        try {
            const updated = await journalsApi.updateJournal(currentJournal._id, {
                title: parsedTitle,
                subtitle: parsedSubtitle,
                content
            });
            setJournals(journals.map(j => j._id === updated._id ? updated : j));
            setCurrentJournal(updated);
            setTitle(parsedTitle);
            setSubtitle(parsedSubtitle);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving journal:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteJournal = async () => {
        if (!deleteConfirm.id) return;

        try {
            await journalsApi.deleteJournal(deleteConfirm.id);
            setJournals(journals.filter(j => j._id !== deleteConfirm.id));
            setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' });
            navigate('/journal');
        } catch (error) {
            console.error('Error deleting journal:', error);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const created = await journalsApi.createFolder({ name: newFolderName.trim() });
            setFolders([...folders, created]);
            setCreateFolderModal(false);
            setNewFolderName('');
            if (created._id) {
                setExpandedFolders(new Set([...expandedFolders, created._id]));
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleDeleteFolder = async () => {
        if (!deleteConfirm.id) return;

        try {
            await journalsApi.deleteFolder(deleteConfirm.id);
            setFolders(folders.filter(f => f._id !== deleteConfirm.id));
            setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' });
        } catch (error: any) {
            console.error('Error deleting folder:', error);
            if (error.response?.status === 400) {
                alert(error.response.data.error);
            }
        }
    };

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const toggleJournal = (journalId: string) => {
        const newExpanded = new Set(expandedJournals);
        if (newExpanded.has(journalId)) {
            newExpanded.delete(journalId);
        } else {
            newExpanded.add(journalId);
        }
        setExpandedJournals(newExpanded);
    };

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            handleSaveJournal();
            setHasUnsavedChanges(false);
        }, 1500); // 2 second delay
    }, []);

    const handleContentChange = (value: string) => {
        setContent(value);
        setHasUnsavedChanges(true);

        debouncedSave();
    };

    const rootJournals = useMemo(() => {
        return journals.filter(j => !j.folderId);
    }, [journals]);

    const getJournalsByFolder = (folderId: string) => {
        return journals.filter(j => j.folderId === folderId);
    };

    if (loading) {
        return (
            <JournalContainer>
                <JournalContent $sidebarCollapsed={true}>
                    <LoadingState>
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </LoadingState>
                </JournalContent>
            </JournalContainer>
        );
    }

    return (
        <JournalContainer>
            {!sidebarCollapsed && (
                <SidebarOverlay onClick={() => setSidebarCollapsed(true)} />
            )}

            <JournalSidebar $collapsed={sidebarCollapsed}>
                <SidebarHeader>
                    <SidebarTitle>
                        <span className="material-symbols-outlined">history_edu</span>
                        Journals
                    </SidebarTitle>
                    <SidebarActions>
                        <IconButton onClick={() => setCreateFolderModal(true)} title="New folder">
                            <span className="material-symbols-outlined">create_new_folder</span>
                        </IconButton>
                        <IconButton onClick={() => handleCreateJournal()} title="New journal">
                            <span className="material-symbols-outlined">add</span>
                        </IconButton>
                    </SidebarActions>
                </SidebarHeader>

                <SidebarBody>
                    {/* Root journals */}
                    <JournalsList>
                        {rootJournals.map(journal => (
                            <JournalItem
                                key={journal._id}
                                $selected={currentJournal?._id === journal._id}
                                onClick={() => navigate(`/journal/${journal._id}`)}
                            >
                                <JournalItemHeader>
                                    <span className="material-symbols-outlined">history_edu</span>
                                    <JournalTitle>{journal.title}</JournalTitle>
                                    <span
                                        onClick={() => toggleJournal(journal._id!)} 
                                        className="material-symbols-outlined chevron"
                                        style={{ 
                                            transform: expandedJournals.has(journal._id!) 
                                                ? 'rotate(90deg)' 
                                                : 'rotate(0deg)' 
                                        }}
                                    >
                                        chevron_right
                                    </span>
                                </JournalItemHeader>
                                <JournalSubtitle>{journal.subtitle}</JournalSubtitle>
                                {
                                    expandedJournals.has(journal._id!) && 
                                    <>
                                        <JournalSubtitle>Created {formatDate(journal.createdAt)}</JournalSubtitle>
                                        <JournalSubtitle>Updated {formatDate(journal.updatedAt)}</JournalSubtitle>
                                    </>
                                }
                            </JournalItem>
                        ))}
                    </JournalsList>

                    {/* Folders with journals */}
                    {folders.map(folder => (
                        <FolderItem key={folder._id} $expanded={expandedFolders.has(folder._id!)}>
                            <FolderHeader onClick={() => toggleFolder(folder._id!)}>
                                <span 
                                    className="material-symbols-outlined chevron"
                                    style={{ 
                                        transform: expandedFolders.has(folder._id!) 
                                            ? 'rotate(90deg)' 
                                            : 'rotate(0deg)' 
                                    }}
                                >
                                    chevron_right
                                </span>
                                <span className="material-symbols-outlined">folder</span>
                                <FolderName>{folder.name}</FolderName>
                                <FolderActions onClick={(e) => e.stopPropagation()}>
                                    <span 
                                        className="material-symbols-outlined"
                                        onClick={() => handleCreateJournal(folder._id)}
                                        title="Add journal to folder"
                                    >
                                        add
                                    </span>
                                    <span 
                                        className="material-symbols-outlined"
                                        onClick={() => setDeleteConfirm({
                                            isOpen: true,
                                            type: 'folder',
                                            id: folder._id!,
                                            name: folder.name
                                        })}
                                        title="Delete folder"
                                    >
                                        delete
                                    </span>
                                </FolderActions>
                            </FolderHeader>
                            {expandedFolders.has(folder._id!) && (
                                <JournalsList $nested>
                                    {getJournalsByFolder(folder._id!).map(journal => (
                                        <JournalItem $nested
                                            key={journal._id}
                                            $selected={currentJournal?._id === journal._id}
                                            onClick={() => navigate(`/journal/${journal._id}`)}
                                        >
                                            <JournalItemHeader>
                                                <span className="material-symbols-outlined">history_edu</span>
                                                <JournalTitle>{journal.title}</JournalTitle>
                                                <span 
                                                    onClick={() => toggleJournal(journal._id!)} 
                                                    className="material-symbols-outlined chevron"
                                                    style={{ 
                                                        transform: expandedJournals.has(journal._id!) 
                                                            ? 'rotate(90deg)' 
                                                            : 'rotate(0deg)' 
                                                    }}
                                                >
                                                    chevron_right
                                                </span>
                                            </JournalItemHeader>
                                            <JournalSubtitle>{journal.subtitle}</JournalSubtitle>
                                            {
                                                expandedJournals.has(journal._id!) && 
                                                <>
                                                    <JournalSubtitle>Created {formatDate(journal.createdAt)}</JournalSubtitle>
                                                    <JournalSubtitle>Updated {formatDate(journal.updatedAt)}</JournalSubtitle>
                                                </>
                                            }
                                        </JournalItem>
                                    ))}
                                </JournalsList>
                            )}
                        </FolderItem>
                    ))}
                </SidebarBody>
            </JournalSidebar>

            <JournalContent $sidebarCollapsed={sidebarCollapsed}>
                <ContentHeader>
                    <ToggleSidebarButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        <span className="material-symbols-outlined">
                            {sidebarCollapsed ? 'menu' : 'menu_open'}
                        </span>
                    </ToggleSidebarButton>

                    {currentJournal && (
                        <ContentActions>
                            <EditorModeToggle>
                                <ModeButton 
                                    $active={editorMode === 'edit'}
                                    onClick={() => setEditorMode('edit')}
                                    title="Edit mode (Ctrl+P to toggle)"
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                    Edit
                                </ModeButton>
                                <ModeButton 
                                    $active={editorMode === 'preview'}
                                    onClick={() => setEditorMode('preview')}
                                    title="Preview mode (Ctrl+P to toggle)"
                                >
                                    <span className="material-symbols-outlined">visibility</span>
                                    Preview
                                </ModeButton>
                            </EditorModeToggle>

                            <ActionButton onClick={handleSaveJournal} $variant="primary" disabled={!hasUnsavedChanges}>
                                <span className="material-symbols-outlined">save</span>
                                {hasUnsavedChanges ? 'Save' : isSaving ? 'Saving...' : 'Saved'}
                            </ActionButton>
                            <ActionButton 
                                onClick={() => setDeleteConfirm({
                                    isOpen: true,
                                    type: 'journal',
                                    id: currentJournal._id!,
                                    name: currentJournal.title
                                })}
                                $variant="danger"
                            >
                                <span className="material-symbols-outlined">delete</span>
                                Delete
                            </ActionButton>
                        </ContentActions>
                    )}
                </ContentHeader>

                {currentJournal ? (
                    <EditorContainer>
                        {editorMode === 'edit' ? (
                            <MarkdownEditor
                                value={content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                placeholder="# Title

Subtitle

Write your thoughts in markdown..."
                            />
                        ) : (
                            <MarkdownPreview>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </MarkdownPreview>
                        )}
                    </EditorContainer>
                ) : (
                    <EmptyState>
                        <span className="material-symbols-outlined">history_edu</span>
                        <h3>No journal selected</h3>
                        <p>Select a journal from the sidebar or create a new one to start writing.</p>
                    </EmptyState>
                )}
            </JournalContent>

            {/* Create Folder Modal */}
            {createFolderModal && (
                <ModalOverlay onClick={() => setCreateFolderModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Folder</h3>
                        <ModalInput
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateFolder();
                                if (e.key === 'Escape') setCreateFolderModal(false);
                            }}
                        />
                        <ModalActions>
                            <ActionButton onClick={() => setCreateFolderModal(false)}>
                                Cancel
                            </ActionButton>
                            <ActionButton 
                                onClick={handleCreateFolder} 
                                $variant="primary"
                                disabled={!newFolderName.trim()}
                            >
                                Create
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <ModalOverlay onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' })}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>Delete {deleteConfirm.type === 'journal' ? 'Journal' : 'Folder'}?</h3>
                        <p>
                            Are you sure you want to delete "{deleteConfirm.name}"? 
                            {deleteConfirm.type === 'folder' && ' The folder must be empty to delete it.'}
                            {' '}This action cannot be undone.
                        </p>
                        <ModalActions>
                            <ActionButton onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' })}>
                                Cancel
                            </ActionButton>
                            <ActionButton 
                                onClick={deleteConfirm.type === 'journal' ? handleDeleteJournal : handleDeleteFolder}
                                $variant="danger"
                            >
                                Delete
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </JournalContainer>
    );
};

export default Journals;