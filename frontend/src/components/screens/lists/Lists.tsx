import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listsApi, List, ListFolder, ListItem } from '../../../services/listsApi';
import TagInput from '../notes/TagInput';
import {
    ListsContainer,
    ListsSidebar,
    SidebarHeader,
    SidebarTitle,
    SidebarActions,
    IconButton,
    SidebarSearchWrapper,
    SidebarSearchIcon,
    SidebarSearchInput,
    SidebarBody,
    FolderItem,
    FolderHeader,
    FolderName,
    FolderActions,
    ListsGroup,
    ListItemSidebar,
    ListItemHeader,
    ListTitle,
    ListMeta,
    ListTags,
    ListTagPill,
    ListContent,
    ContentHeader,
    ToggleSidebarButton,
    ContentActions,
    ActionButton,
    EditorContainer,
    TitleInput,
    ItemsContainer,
    ListItemRow,
    ItemMainRow,
    Checkbox,
    ItemText,
    ItemActions,
    ItemDetails,
    AddItemButton,
    EmptyState,
    LoadingState,
    ModalOverlay,
    ModalContent,
    ModalInput,
    ModalActions,
    SidebarOverlay,
    ShareLink,
    ShareModeSelector,
    ShareBanner
} from './Lists.styles';

const Lists = () => {
    const { listId } = useParams<{ listId?: string }>();
    const navigate = useNavigate();

    const [lists, setLists] = useState<List[]>([]);
    const [folders, setFolders] = useState<ListFolder[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Current list state
    const [currentList, setCurrentList] = useState<List | null>(null);
    const [title, setTitle] = useState('');
    const [items, setItems] = useState<ListItem[]>([]);
    const [tags, setTags] = useState<string[]>(['default']);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Modal states
    const [createFolderModal, setCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [shareModal, setShareModal] = useState(false);
    const [shareMode, setShareMode] = useState<'read-only' | 'read-write'>('read-only');
    const [deleteConfirm, setDeleteConfirm] = useState<{ 
        isOpen: boolean; 
        type: 'list' | 'folder' | null;
        id: string | null;
        name: string;
    }>({ isOpen: false, type: null, id: null, name: '' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (currentList && hasUnsavedChanges) {
                    handleSaveList();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentList, hasUnsavedChanges, items, title, tags]);

    useEffect(() => {
        if (listId && lists.length > 0) {
            const list = lists.find(l => l._id === listId);
            if (list) {
                loadList(list);
            }
        } else if (!listId) {
            setCurrentList(null);
            setTitle('');
            setItems([]);
            setTags(['default']);
            setHasUnsavedChanges(false);
        }
    }, [listId, lists]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [listsData, foldersData, tagsData] = await Promise.all([
                listsApi.getAllLists(),
                listsApi.getAllFolders(),
                listsApi.getAllTags()
            ]);
            setLists(listsData);
            setFolders(foldersData);
            setAllTags(tagsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadList = (list: List) => {
        setCurrentList(list);
        setTitle(list.title);
        setItems(list.items || []);
        setTags(list.tags || ['default']);
        setHasUnsavedChanges(false);
    };

    const handleCreateList = async (folderId?: string | null) => {
        try {
            const created = await listsApi.createList({
                title: 'New List',
                folderId: folderId || null,
                items: [],
                tags: ['default']
            });
            setLists([created, ...lists]);
            navigate(`/lists/${created._id}`);
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    const handleSaveList = async () => {
        if (!currentList || !currentList._id) return;

        try {
            const updated = await listsApi.updateList(currentList._id, {
                title,
                items,
                tags: tags.filter(t => t !== 'default').length > 0 
                    ? tags.filter(t => t !== 'default') 
                    : ['default']
            });
            setLists(lists.map(l => l._id === updated._id ? updated : l));
            setCurrentList(updated);
            setHasUnsavedChanges(false);
            loadData(); // Reload to update tags
        } catch (error) {
            console.error('Error saving list:', error);
        }
    };

    const handleDeleteList = async () => {
        if (!deleteConfirm.id) return;

        try {
            await listsApi.deleteList(deleteConfirm.id);
            setLists(lists.filter(l => l._id !== deleteConfirm.id));
            setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' });
            navigate('/lists');
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const created = await listsApi.createFolder({ name: newFolderName.trim() });
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
            await listsApi.deleteFolder(deleteConfirm.id);
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

    const handleAddItem = () => {
        const newItem: ListItem = {
            id: crypto.randomUUID(),
            text: '',
            checked: false,
            isComplex: false,
            detailsExpanded: false
        };
        setItems([...items, newItem]);
        setHasUnsavedChanges(true);
    };

    const handleUpdateItem = (id: string, updates: Partial<ListItem>) => {
        const newItems = items.map(item => 
            item.id === id ? { ...item, ...updates } : item
        );
        setItems(newItems);
        setHasUnsavedChanges(true);

        // Auto-save checkbox changes
        if (updates.checked !== undefined && currentList && currentList._id) {
            setTimeout(async () => {
                try {
                    await listsApi.updateList(currentList._id!, {
                        items: newItems
                    });
                } catch (error) {
                    console.error('Error auto-saving checkbox:', error);
                }
            }, 100);
        }
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        setHasUnsavedChanges(true);
    };

    const handleToggleComplex = (id: string) => {
        setItems(items.map(item => 
            item.id === id 
                ? { 
                    ...item, 
                    isComplex: !item.isComplex,
                    detailsExpanded: !item.isComplex ? true : item.detailsExpanded
                  }
                : item
        ));
        setHasUnsavedChanges(true);
    };

    const handleEnableSharing = async () => {
        if (!currentList || !currentList._id) return;

        try {
            const updated = await listsApi.enableSharing(currentList._id, shareMode);
            setLists(lists.map(l => l._id === updated._id ? updated : l));
            setCurrentList(updated);
            // Don't close modal to show share link
        } catch (error) {
            console.error('Error enabling sharing:', error);
        }
    };

    const handleUpdateShareMode = async (newMode: 'read-only' | 'read-write') => {
        if (!currentList || !currentList._id || !currentList.shareId) return;

        try {
            const updated = await listsApi.updateShareMode(currentList._id, newMode);
            setLists(lists.map(l => l._id === updated._id ? updated : l));
            setCurrentList(updated);
        } catch (error) {
            console.error('Error updating share mode:', error);
        }
    };

    const handleDisableSharing = async () => {
        if (!currentList || !currentList._id) return;

        try {
            const updated = await listsApi.disableSharing(currentList._id);
            setLists(lists.map(l => l._id === updated._id ? updated : l));
            setCurrentList(updated);
            setShareModal(false);
        } catch (error) {
            console.error('Error disabling sharing:', error);
        }
    };

    const handleCopyShareLink = () => {
        if (currentList?.shareId) {
            const shareUrl = `${window.location.origin}/lists/shared/${currentList.shareId}`;
            navigator.clipboard.writeText(shareUrl);
            alert('Share link copied to clipboard!');
        }
    };

    const rootLists = useMemo(() => {
        return lists.filter(l => !l.folderId);
    }, [lists]);

    const getListsByFolder = (folderId: string) => {
        return lists.filter(l => l.folderId === folderId);
    };

    const filteredRootLists = useMemo(() => {
        if (!sidebarSearchQuery.trim()) return rootLists;
        const query = sidebarSearchQuery.toLowerCase();
        return rootLists.filter(list => 
            list.title.toLowerCase().includes(query)
        );
    }, [rootLists, sidebarSearchQuery]);

    const getFilteredListsByFolder = (folderId: string) => {
        const folderLists = getListsByFolder(folderId);
        if (!sidebarSearchQuery.trim()) return folderLists;
        const query = sidebarSearchQuery.toLowerCase();
        return folderLists.filter(list => 
            list.title.toLowerCase().includes(query)
        );
    };

    if (loading) {
        return (
            <ListsContainer>
                <ListContent $sidebarCollapsed={true}>
                    <LoadingState>
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </LoadingState>
                </ListContent>
            </ListsContainer>
        );
    }

    return (
        <ListsContainer>
            {!sidebarCollapsed && (
                <SidebarOverlay onClick={() => setSidebarCollapsed(true)} />
            )}

            <ListsSidebar $collapsed={sidebarCollapsed}>
                <SidebarHeader>
                    <SidebarTitle>
                        <span className="material-symbols-outlined">format_list_bulleted_add</span>
                        Lists
                    </SidebarTitle>
                    <SidebarActions>
                        <IconButton onClick={() => setCreateFolderModal(true)} title="New folder">
                            <span className="material-symbols-outlined">create_new_folder</span>
                        </IconButton>
                        <IconButton onClick={() => handleCreateList()} title="New list">
                            <span className="material-symbols-outlined">add</span>
                        </IconButton>
                    </SidebarActions>
                </SidebarHeader>

                <SidebarSearchWrapper $expanded={true}>
                    <SidebarSearchIcon>
                        <span className="material-symbols-outlined">
                            {'search'}
                        </span>
                    </SidebarSearchIcon>
                    <SidebarSearchInput
                        $visible={true}
                        type="text"
                        placeholder="Search lists..."
                        value={sidebarSearchQuery}
                        onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    />
                </SidebarSearchWrapper>

                <SidebarBody>
                    {/* Root lists */}
                    <ListsGroup>
                        {filteredRootLists.map(list => {
                            const completedItems = list.items.filter(i => i.checked).length;
                            const totalItems = list.items.length;
                            const visibleTags = (list.tags || []).filter(tag => tag !== 'default');
                            return (
                                <ListItemSidebar
                                    key={list._id}
                                    $selected={currentList?._id === list._id}
                                    onClick={() => navigate(`/lists/${list._id}`)}
                                >
                                    <ListItemHeader>
                                        <span className="material-symbols-outlined">
                                            {list.shareMode !== 'none' ? 'share' : 'checklist'}
                                        </span>
                                        <ListTitle>{list.title}</ListTitle>
                                    </ListItemHeader>
                                    <ListMeta>{completedItems} / {totalItems} completed</ListMeta>
                                    {visibleTags.length > 0 && (
                                        <ListTags>
                                            {visibleTags.slice(0, 3).map(tag => (
                                                <ListTagPill key={tag}>{tag}</ListTagPill>
                                            ))}
                                            {visibleTags.length > 3 && (
                                                <ListTagPill>+{visibleTags.length - 3}</ListTagPill>
                                            )}
                                        </ListTags>
                                    )}
                                </ListItemSidebar>
                            );
                        })}
                    </ListsGroup>

                    {/* Folders with lists */}
                    {folders.map(folder => {
                        const folderLists = getFilteredListsByFolder(folder._id!);
                        // Hide folder if search is active and no lists match
                        if (sidebarSearchQuery.trim() && folderLists.length === 0) {
                            return null;
                        }
                        
                        return (
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
                                            onClick={() => handleCreateList(folder._id)}
                                            title="Add list to folder"
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
                                    <ListsGroup $nested>
                                        {folderLists.map(list => {
                                            const completedItems = list.items.filter(i => i.checked).length;
                                            const totalItems = list.items.length;
                                            const visibleTags = (list.tags || []).filter(tag => tag !== 'default');
                                            return (
                                                <ListItemSidebar $nested
                                                    key={list._id}
                                                    $selected={currentList?._id === list._id}
                                                    onClick={() => navigate(`/lists/${list._id}`)}
                                                >
                                                    <ListItemHeader>
                                                        <span className="material-symbols-outlined">
                                                            {list.shareMode !== 'none' ? 'share' : 'checklist'}
                                                        </span>
                                                        <ListTitle>{list.title}</ListTitle>
                                                    </ListItemHeader>
                                                    <ListMeta>{completedItems} / {totalItems} completed</ListMeta>
                                                    {visibleTags.length > 0 && (
                                                        <ListTags>
                                                            {visibleTags.slice(0, 3).map(tag => (
                                                                <ListTagPill key={tag}>{tag}</ListTagPill>
                                                            ))}
                                                            {visibleTags.length > 3 && (
                                                                <ListTagPill>+{visibleTags.length - 3}</ListTagPill>
                                                            )}
                                                        </ListTags>
                                                    )}
                                                </ListItemSidebar>
                                            );
                                        })}
                                    </ListsGroup>
                                )}
                            </FolderItem>
                        );
                    })}
                </SidebarBody>
            </ListsSidebar>

            <ListContent $sidebarCollapsed={sidebarCollapsed}>
                <ContentHeader>
                    <ToggleSidebarButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        <span className="material-symbols-outlined">
                            {sidebarCollapsed ? 'menu' : 'menu_open'}
                        </span>
                    </ToggleSidebarButton>

                    {currentList && (
                        <ContentActions>
                            <ActionButton 
                                onClick={() => {
                                    setShareMode(currentList.shareMode === 'read-only' ? 'read-only' : 'read-write');
                                    setShareModal(true);
                                }}
                                $variant={currentList.shareMode !== 'none' ? 'share' : undefined}
                            >
                                <span className="material-symbols-outlined">
                                    {currentList.shareMode !== 'none' ? 'share' : 'link'}
                                </span>
                                {currentList.shareMode !== 'none' ? 'Sharing' : 'Share'}
                            </ActionButton>
                            <ActionButton onClick={handleSaveList} $variant="primary" disabled={!hasUnsavedChanges}>
                                <span className="material-symbols-outlined">save</span>
                                {hasUnsavedChanges ? 'Save' : 'Saved'}
                            </ActionButton>
                            <ActionButton 
                                onClick={() => setDeleteConfirm({
                                    isOpen: true,
                                    type: 'list',
                                    id: currentList._id!,
                                    name: currentList.title
                                })}
                                $variant="danger"
                            >
                                <span className="material-symbols-outlined">delete</span>
                                Delete
                            </ActionButton>
                        </ContentActions>
                    )}
                </ContentHeader>

                {currentList ? (
                    <EditorContainer>
                        <TitleInput
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setHasUnsavedChanges(true);
                            }}
                            placeholder="List title..."
                        />

                        <TagInput
                            tags={tags}
                            onChange={(newTags) => {
                                setTags(newTags);
                                setHasUnsavedChanges(true);
                            }}
                            availableTags={allTags}
                            placeholder="Add tags..."
                        />

                        <ItemsContainer>
                            {items.map((item) => (
                                <ListItemRow key={item.id} $checked={item.checked}>
                                    <ItemMainRow>
                                        <Checkbox
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={(e) => handleUpdateItem(item.id, { checked: e.target.checked })}
                                        />
                                        <ItemText
                                            value={item.text}
                                            onChange={(e) => handleUpdateItem(item.id, { text: e.target.value })}
                                            placeholder="Item text..."
                                            $checked={item.checked}
                                        />
                                        <ItemActions>
                                            <span 
                                                className="material-symbols-outlined"
                                                onClick={() => handleToggleComplex(item.id)}
                                                title={item.isComplex ? 'Make simple' : 'Make complex'}
                                            >
                                                {item.isComplex ? 'expand_less' : 'expand_more'}
                                            </span>
                                            <span 
                                                className="material-symbols-outlined"
                                                onClick={() => handleDeleteItem(item.id)}
                                                title="Delete item"
                                            >
                                                delete
                                            </span>
                                        </ItemActions>
                                    </ItemMainRow>
                                    {item.isComplex && (
                                        <ItemDetails
                                            value={item.details || ''}
                                            onChange={(e) => handleUpdateItem(item.id, { details: e.target.value })}
                                            placeholder="Additional details..."
                                            $expanded={item.detailsExpanded}
                                            onFocus={() => handleUpdateItem(item.id, { detailsExpanded: true })}
                                        />
                                    )}
                                </ListItemRow>
                            ))}
                            <AddItemButton onClick={handleAddItem}>
                                <span className="material-symbols-outlined">add</span>
                                Add item
                            </AddItemButton>
                        </ItemsContainer>
                    </EditorContainer>
                ) : (
                    <EmptyState>
                        <span className="material-symbols-outlined">event_list</span>
                        <h3>No list selected</h3>
                        <p>Select a list from the sidebar or create a new one to start organizing.</p>
                    </EmptyState>
                )}
            </ListContent>

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

            {/* Share Modal */}
            {shareModal && currentList && (
                <ModalOverlay onClick={() => setShareModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>Share List</h3>
                        
                        {currentList.shareId ? (
                            <>
                                <ShareBanner $mode={currentList.shareMode === 'read-only' ? 'read-only' : 'read-write'}>
                                    <span className="material-symbols-outlined">share</span>
                                    <div>
                                        <strong>Sharing enabled</strong> - Anyone with the link can 
                                        {currentList.shareMode === 'read-only' ? ' view and check items' : ' edit this list'}
                                    </div>
                                </ShareBanner>

                                <ShareLink>
                                    <input 
                                        type="text" 
                                        value={`${window.location.origin}/lists/shared/${currentList.shareId}`}
                                        readOnly 
                                    />
                                    <button onClick={handleCopyShareLink}>Copy</button>
                                </ShareLink>

                                <div>
                                    <p style={{ marginBottom: '8px', fontSize: '13px', opacity: 0.8 }}>Share mode:</p>
                                    <ShareModeSelector>
                                        <button 
                                            className={currentList.shareMode === 'read-only' ? 'active' : ''}
                                            onClick={() => handleUpdateShareMode('read-only')}
                                        >
                                            Read-only
                                        </button>
                                        <button 
                                            className={currentList.shareMode === 'read-write' ? 'active' : ''}
                                            onClick={() => handleUpdateShareMode('read-write')}
                                        >
                                            Read-write
                                        </button>
                                    </ShareModeSelector>
                                </div>

                                <ModalActions>
                                    <ActionButton onClick={handleDisableSharing} $variant="danger">
                                        Disable sharing
                                    </ActionButton>
                                    <ActionButton onClick={() => setShareModal(false)}>
                                        Close
                                    </ActionButton>
                                </ModalActions>
                            </>
                        ) : (
                            <>
                                <p>Choose how others can interact with your list:</p>
                                <ShareModeSelector>
                                    <button 
                                        className={shareMode === 'read-only' ? 'active' : ''}
                                        onClick={() => setShareMode('read-only')}
                                    >
                                        Read-only
                                    </button>
                                    <button 
                                        className={shareMode === 'read-write' ? 'active' : ''}
                                        onClick={() => setShareMode('read-write')}
                                    >
                                        Read-write
                                    </button>
                                </ShareModeSelector>
                                <ModalActions>
                                    <ActionButton onClick={() => setShareModal(false)}>
                                        Cancel
                                    </ActionButton>
                                    <ActionButton onClick={handleEnableSharing} $variant="share">
                                        Enable sharing
                                    </ActionButton>
                                </ModalActions>
                            </>
                        )}
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <ModalOverlay onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' })}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>Delete {deleteConfirm.type === 'list' ? 'List' : 'Folder'}?</h3>
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
                                onClick={deleteConfirm.type === 'list' ? handleDeleteList : handleDeleteFolder}
                                $variant="danger"
                            >
                                Delete
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </ListsContainer>
    );
};

export default Lists;