import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { drawingsApi, Drawing, Folder, CreateDrawingInput } from '../../../services/drawingsApi';
import { useTheme } from '../../../contexts/ThemeContext';
import {
    DrawingsContainer,
    DrawingsSidebar,
    SidebarHeader,
    SidebarTitle,
    SidebarActions,
    IconButton,
    SidebarBody,
    FolderItem,
    FolderHeader,
    FolderName,
    FolderActions,
    DrawingsList,
    DrawingItem,
    DrawingThumbnail,
    DrawingInfo,
    DrawingTitle,
    DrawingSubtitle,
    DrawingContent,
    ContentHeader,
    DrawingTitleContainer,
    DrawingTitleInput,
    DrawingTitleDisplay,
    ToggleSidebarButton,
    ContentActions,
    ActionButton,
    AutoSaveToggle,
    ToggleSwitch,
    ExcalidrawContainer,
    EmptyState,
    LoadingState,
    ModalOverlay,
    ModalContent,
    ModalInput,
    ModalActions,
    SidebarOverlay
} from './Drawings.styles';

const Drawings = () => {
    const { drawingId } = useParams<{ drawingId?: string }>();
    const navigate = useNavigate();
    const { currentTheme } = useTheme();

    // Determine if we should use dark theme for Excalidraw
    // Check if background is dark
    const isDarkTheme = useMemo(() => {
        const bgColor = currentTheme.values.backgroundDarker || currentTheme.values.backgroundDarkest;
        // Simple check: if background starts with #1, #2, #3 it's likely dark
        return bgColor.startsWith('#1') || bgColor.startsWith('#2') || bgColor.startsWith('#3');
    }, [currentTheme]);

    const excalidrawTheme = isDarkTheme ? 'dark' : 'light';

    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Current drawing state
    const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
    const [title, setTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Excalidraw API reference
    const excalidrawRef = useRef<any>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveRef = useRef<string>('');

    // Modal states
    const [createFolderModal, setCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ 
        isOpen: boolean; 
        type: 'drawing' | 'folder' | null;
        id: string | null;
        name: string;
    }>({ isOpen: false, type: null, id: null, name: '' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (drawingId && drawings.length > 0) {
            const drawing = drawings.find(d => d._id === drawingId);
            if (drawing) {
                loadDrawing(drawing);
            }
        } else if (!drawingId) {
            setCurrentDrawing(null);
            setHasUnsavedChanges(false);
        }
    }, [drawingId, drawings]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [drawingsData, foldersData] = await Promise.all([
                drawingsApi.getAllDrawings(),
                drawingsApi.getAllFolders()
            ]);
            setDrawings(drawingsData);
            setFolders(foldersData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadDrawing = (drawing: Drawing) => {
        setCurrentDrawing(drawing);
        setTitle(drawing.title);
        setHasUnsavedChanges(false);
        
        // Load files if they exist (handled via key prop remount)
        // The key prop will cause Excalidraw to remount with new initialData
    };

    const generateThumbnail = async (): Promise<string | undefined> => {
        if (!excalidrawRef.current) return undefined;

        try {
            const elements = excalidrawRef.current.getSceneElements();
            const appState = excalidrawRef.current.getAppState();
            
            const blob = await exportToBlob({
                elements,
                appState: { ...appState, exportBackground: true },
                files: excalidrawRef.current.getFiles(),
                mimeType: 'image/png',
                quality: 0.5,
            });

            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return undefined;
        }
    };

    const handleSaveDrawing = async () => {
        if (!currentDrawing || !currentDrawing._id || !excalidrawRef.current) return;
        
        setIsSaving(true);

        try {
            const elements = excalidrawRef.current.getSceneElements();
            const appState = excalidrawRef.current.getAppState();
            const files = excalidrawRef.current.getFiles();

            // Create scene data
            const sceneData = {
                elements,
                appState,
                files: files ? Object.fromEntries(
                    Object.entries(files).map(([id, file]: [string, any]) => [id, {
                        id: file.id,
                        created: file.created,
                        dataURL: file.dataURL,
                        mimeType: file.mimeType,
                    }])
                ) : undefined,
            };

            // Generate thumbnail
            const thumbnail = await generateThumbnail();

            // Check if content has changed
            const currentData = JSON.stringify({ title, sceneData });
            if (currentData === lastSaveRef.current) {
                setIsSaving(false);
                return;
            }

            // Save to backend
            const updated = await drawingsApi.updateDrawing(currentDrawing._id, {
                title: title.trim() || 'Untitled Drawing',
                sceneData,
                thumbnail
            });

            setDrawings(drawings.map(d => d._id === updated._id ? updated : d));
            setCurrentDrawing(updated);
            setTitle(updated.title);
            setHasUnsavedChanges(false);
            lastSaveRef.current = currentData;
        } catch (error) {
            console.error('Error saving drawing:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const debouncedSave = useCallback(() => {
        if (!autoSaveEnabled) return;
        
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            handleSaveDrawing();
        }, 10000); // 10 seconds
    }, [autoSaveEnabled, currentDrawing]);

    const handleExcalidrawChange = (
        _elements: readonly any[],
        _appState: any,
        _files: any
    ) => {
        if (!currentDrawing) return;
        
        setHasUnsavedChanges(true);
        debouncedSave();
    };

    const handleCreateDrawing = async (folderId?: string | null) => {
        const newDrawingInput: CreateDrawingInput = {
            title: 'Untitled Drawing',
            sceneData: { elements: [], appState: {} },
            folderId: folderId || null
        };

        try {
            const created = await drawingsApi.createDrawing(newDrawingInput);
            setDrawings([created, ...drawings]);
            navigate(`/drawings/${created._id}`);
        } catch (error) {
            console.error('Error creating drawing:', error);
        }
    };

    const handleDeleteDrawing = async () => {
        if (!deleteConfirm.id) return;

        try {
            await drawingsApi.deleteDrawing(deleteConfirm.id);
            setDrawings(drawings.filter(d => d._id !== deleteConfirm.id));
            setDeleteConfirm({ isOpen: false, type: null, id: null, name: '' });
            navigate('/drawings');
        } catch (error) {
            console.error('Error deleting drawing:', error);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const created = await drawingsApi.createFolder({ name: newFolderName.trim() });
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
            await drawingsApi.deleteFolder(deleteConfirm.id);
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

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const rootDrawings = useMemo(() => {
        return drawings.filter(d => !d.folderId);
    }, [drawings]);

    const getDrawingsByFolder = (folderId: string) => {
        return drawings.filter(d => d.folderId === folderId);
    };

    if (loading) {
        return (
            <DrawingsContainer>
                <DrawingContent $sidebarCollapsed={true}>
                    <LoadingState>
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </LoadingState>
                </DrawingContent>
            </DrawingsContainer>
        );
    }

    return (
        <DrawingsContainer>
            {!sidebarCollapsed && (
                <SidebarOverlay onClick={() => setSidebarCollapsed(true)} />
            )}

            <DrawingsSidebar $collapsed={sidebarCollapsed}>
                <SidebarHeader>
                    <SidebarTitle>
                        <span className="material-symbols-outlined">draw</span>
                        Drawings
                    </SidebarTitle>
                    <SidebarActions>
                        <IconButton onClick={() => setCreateFolderModal(true)} title="New folder">
                            <span className="material-symbols-outlined">create_new_folder</span>
                        </IconButton>
                        <IconButton onClick={() => handleCreateDrawing()} title="New drawing">
                            <span className="material-symbols-outlined">add</span>
                        </IconButton>
                    </SidebarActions>
                </SidebarHeader>

                <SidebarBody>
                    {/* Root drawings */}
                    <DrawingsList>
                        {rootDrawings.map(drawing => (
                            <DrawingItem
                                key={drawing._id}
                                $selected={currentDrawing?._id === drawing._id}
                                onClick={() => navigate(`/drawings/${drawing._id}`)}
                            >
                                <DrawingThumbnail>
                                    {drawing.thumbnail ? (
                                        <img src={drawing.thumbnail} alt={drawing.title} />
                                    ) : (
                                        <span className="material-symbols-outlined">draw</span>
                                    )}
                                </DrawingThumbnail>
                                <DrawingInfo>
                                    <DrawingTitle>{drawing.title}</DrawingTitle>
                                    <DrawingSubtitle>Updated {formatDate(drawing.updatedAt)}</DrawingSubtitle>
                                </DrawingInfo>
                            </DrawingItem>
                        ))}
                    </DrawingsList>

                    {/* Folders with drawings */}
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
                                        onClick={() => handleCreateDrawing(folder._id)}
                                        title="Add drawing to folder"
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
                                <DrawingsList $nested>
                                    {getDrawingsByFolder(folder._id!).map(drawing => (
                                        <DrawingItem
                                            key={drawing._id}
                                            $selected={currentDrawing?._id === drawing._id}
                                            $nested
                                            onClick={() => navigate(`/drawings/${drawing._id}`)}
                                        >
                                            <DrawingThumbnail>
                                                {drawing.thumbnail ? (
                                                    <img src={drawing.thumbnail} alt={drawing.title} />
                                                ) : (
                                                    <span className="material-symbols-outlined">draw</span>
                                                )}
                                            </DrawingThumbnail>
                                            <DrawingInfo>
                                                <DrawingTitle>{drawing.title}</DrawingTitle>
                                                <DrawingSubtitle>Updated {formatDate(drawing.updatedAt)}</DrawingSubtitle>
                                            </DrawingInfo>
                                        </DrawingItem>
                                    ))}
                                </DrawingsList>
                            )}
                        </FolderItem>
                    ))}
                </SidebarBody>
            </DrawingsSidebar>

            <DrawingContent $sidebarCollapsed={sidebarCollapsed}>
                <ContentHeader>
                    <ToggleSidebarButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        <span className="material-symbols-outlined">
                            {sidebarCollapsed ? 'menu' : 'menu_open'}
                        </span>
                    </ToggleSidebarButton>

                    {currentDrawing && (
                        <>
                            <DrawingTitleContainer>
                                {isEditingTitle ? (
                                    <DrawingTitleInput
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            setHasUnsavedChanges(true);
                                        }}
                                        onBlur={() => setIsEditingTitle(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setIsEditingTitle(false);
                                                if (autoSaveEnabled) {
                                                    debouncedSave();
                                                }
                                            }
                                            if (e.key === 'Escape') {
                                                setTitle(currentDrawing.title);
                                                setIsEditingTitle(false);
                                            }
                                        }}
                                        placeholder="Untitled Drawing"
                                        autoFocus
                                    />
                                ) : (
                                    <DrawingTitleDisplay onClick={() => setIsEditingTitle(true)}>
                                        {title || 'Untitled Drawing'}
                                    </DrawingTitleDisplay>
                                )}
                            </DrawingTitleContainer>

                            <ContentActions>
                                <AutoSaveToggle>
                                    <span className="material-symbols-outlined">
                                        {autoSaveEnabled ? 'cloud_sync' : 'cloud_off'}
                                    </span>
                                    Auto-save
                                    <ToggleSwitch>
                                        <input
                                            type="checkbox"
                                            checked={autoSaveEnabled}
                                            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                        />
                                        <span></span>
                                    </ToggleSwitch>
                                </AutoSaveToggle>

                                <ActionButton onClick={handleSaveDrawing} $variant="primary" disabled={!hasUnsavedChanges && !isSaving}>
                                    <span className="material-symbols-outlined">save</span>
                                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
                                </ActionButton>
                                
                                <ActionButton 
                                    onClick={() => setDeleteConfirm({
                                        isOpen: true,
                                        type: 'drawing',
                                        id: currentDrawing._id!,
                                        name: currentDrawing.title
                                    })}
                                    $variant="danger"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                    Delete
                                </ActionButton>
                            </ContentActions>
                        </>
                    )}
                </ContentHeader>

                {currentDrawing ? (
                    <ExcalidrawContainer>
                        <Excalidraw
                            key={currentDrawing._id}
                            excalidrawAPI={(api) => excalidrawRef.current = api}
                            onChange={handleExcalidrawChange}
                            theme={excalidrawTheme}
                            initialData={{
                                elements: currentDrawing.sceneData?.elements || [],
                                appState: {
                                    ...(currentDrawing.sceneData?.appState || {}),
                                    collaborators: []
                                },
                            }}
                        />
                    </ExcalidrawContainer>
                ) : (
                    <EmptyState>
                        <span className="material-symbols-outlined">draw</span>
                        <h3>No drawing selected</h3>
                        <p>Select a drawing from the sidebar or create a new one to start drawing.</p>
                    </EmptyState>
                )}
            </DrawingContent>

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
                        <h3>Delete {deleteConfirm.type === 'drawing' ? 'Drawing' : 'Folder'}?</h3>
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
                                onClick={deleteConfirm.type === 'drawing' ? handleDeleteDrawing : handleDeleteFolder}
                                $variant="danger"
                            >
                                Delete
                            </ActionButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </DrawingsContainer>
    );
};

export default Drawings;