import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { trackersApi, Tracker, TrackerFolder, CreateTrackerInput, UpdateTrackerInput } from '../../../services/trackersApi';
import TrackerCard from './TrackerCard';
import TrackerEditor from './TrackerEditor';
import TrackerHistory from './TrackerHistory';
import {
    TrackerContainer,
    TrackerHeader,
    TrackerHeaderTop,
    TrackerHeaderLeft,
    TrackerTitle,
    TrackerCount,
    CreateButton,
    RefreshButton,
    FilterBar,
    SearchWrapper,
    SearchInput,
    FilterControls,
    FilterButton,
    TrackerBody,
    FolderSection,
    FolderHeader,
    FolderName,
    TrackerGrid,
    EmptyState,
    LoadingState,
    DeleteConfirmModal,
    DeleteConfirmContent,
    DeleteConfirmActions,
} from './Tracker.styles';

type FilterView = 'all' | 'active' | 'archived';

const Trackers: React.FC = () => {
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [folders, setFolders] = useState<TrackerFolder[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterView, setFilterView] = useState<FilterView>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; trackerId: string | null }>({
        isOpen: false,
        trackerId: null
    });

    // Modal states
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyTracker, setHistoryTracker] = useState<Tracker | null>(null);

    const topOptions = useSelector((state: RootState) => state.mainDock.dockTopOptions);

    useEffect(() => {
        loadData();
    }, [filterView]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const [trackersData, foldersData, tagsData] = await Promise.all([
                trackersApi.getAllTrackers(filterView === 'active' ? true : filterView === 'archived' ? false : undefined),
                trackersApi.getAllFolders(),
                trackersApi.getAllTags()
            ]);

            setTrackers(trackersData);
            setFolders(foldersData);
            setTags(tagsData);
        } catch (error) {
            console.error('Error loading trackers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrackers = React.useMemo(() => {
        let filtered = trackers;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(tracker => {
                const nameMatch = tracker.name.toLowerCase().includes(query);
                const descriptionMatch = tracker.description?.toLowerCase().includes(query);
                const tagsMatch = tracker.tags.some(tag => tag.toLowerCase().includes(query));
                return nameMatch || descriptionMatch || tagsMatch;
            });
        }

        return filtered;
    }, [trackers, searchQuery]);

    // Group trackers by folder
    const trackersByFolder = React.useMemo(() => {
        const grouped: { [key: string]: Tracker[] } = {
            'no-folder': []
        };

        folders.forEach(folder => {
            if (folder._id) {
                grouped[folder._id] = [];
            }
        });

        filteredTrackers.forEach(tracker => {
            if (tracker.folderId && grouped[tracker.folderId]) {
                grouped[tracker.folderId].push(tracker);
            } else {
                grouped['no-folder'].push(tracker);
            }
        });

        return grouped;
    }, [filteredTrackers, folders]);

    const handleCreateTracker = () => {
        setEditingTracker(null);
        setIsEditorOpen(true);
    };

    const handleEditTracker = (tracker: Tracker) => {
        setEditingTracker(tracker);
        setIsEditorOpen(true);
    };

    const handleSaveTracker = async (data: CreateTrackerInput | UpdateTrackerInput, id?: string) => {
        try {
            if (id) {
                // Update existing tracker
                const updated = await trackersApi.updateTracker(id, data as UpdateTrackerInput);
                setTrackers(trackers.map(t => t._id === updated._id ? updated : t));
            } else {
                // Create new tracker
                const created = await trackersApi.createTracker(data as CreateTrackerInput);
                setTrackers([created, ...trackers]);
            }
            setIsEditorOpen(false);
            setEditingTracker(null);
            await loadData(); // Reload to get fresh stats
        } catch (error) {
            console.error('Error saving tracker:', error);
            throw error;
        }
    };

    const handleDeleteTracker = (trackerId: string) => {
        setDeleteConfirm({ isOpen: true, trackerId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.trackerId) return;

        try {
            await trackersApi.deleteTracker(deleteConfirm.trackerId);
            setTrackers(trackers.filter(t => t._id !== deleteConfirm.trackerId));
            setDeleteConfirm({ isOpen: false, trackerId: null });
        } catch (error) {
            console.error('Error deleting tracker:', error);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ isOpen: false, trackerId: null });
    };

    const handleViewHistory = (tracker: Tracker) => {
        setHistoryTracker(tracker);
        setIsHistoryOpen(true);
    };

    return (
        <TrackerContainer>
            <TrackerHeader>
                <TrackerHeaderTop>
                    <TrackerHeaderLeft>
                        <TrackerTitle>
                            <span className="material-symbols-outlined">
                                {topOptions.find(o => o.id === "tracker")?.icon}
                            </span>
                            Tracker
                            <TrackerCount>({filteredTrackers.length})</TrackerCount>
                            <RefreshButton onClick={() => loadData()}>
                                <span className="material-symbols-outlined">refresh</span>
                                Refresh
                            </RefreshButton>
                        </TrackerTitle>
                    </TrackerHeaderLeft>
                    <CreateButton onClick={handleCreateTracker}>
                        <span className="material-symbols-outlined">add</span>
                        New Tracker
                    </CreateButton>
                </TrackerHeaderTop>

                <FilterBar>
                    <SearchWrapper>
                        <span className="material-symbols-outlined">search</span>
                        <SearchInput
                            type="text"
                            placeholder="Search trackers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchWrapper>

                    <FilterControls>
                        <FilterButton
                            $active={filterView === 'all'}
                            onClick={() => setFilterView('all')}
                        >
                            <span className="material-symbols-outlined">view_list</span>
                            All
                        </FilterButton>
                        <FilterButton
                            $active={filterView === 'active'}
                            onClick={() => setFilterView('active')}
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            Active
                        </FilterButton>
                        <FilterButton
                            $active={filterView === 'archived'}
                            onClick={() => setFilterView('archived')}
                        >
                            <span className="material-symbols-outlined">archive</span>
                            Archived
                        </FilterButton>
                    </FilterControls>
                </FilterBar>
            </TrackerHeader>

            <TrackerBody>
                {loading ? (
                    <LoadingState>
                        <div className="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </LoadingState>
                ) : filteredTrackers.length === 0 ? (
                    <EmptyState>
                        <span className="material-symbols-outlined">
                            {searchQuery ? 'search_off' : 'track_changes'}
                        </span>
                        <h3>
                            {searchQuery ? 'No trackers found' : 'No trackers yet'}
                        </h3>
                        <p>
                            {searchQuery
                                ? 'Try adjusting your search query.'
                                : 'Create your first tracker to start building better habits. Click the "New Tracker" button above.'}
                        </p>
                    </EmptyState>
                ) : (
                    <>
                        {/* Trackers in folders */}
                        {folders.map(folder => {
                            const folderTrackers = trackersByFolder[folder._id!] || [];
                            if (folderTrackers.length === 0) return null;

                            return (
                                <FolderSection key={folder._id}>
                                    <FolderHeader>
                                        <span className="material-symbols-outlined">folder</span>
                                        <FolderName>{folder.name}</FolderName>
                                    </FolderHeader>
                                    <TrackerGrid>
                                        {folderTrackers.map(tracker => (
                                            <TrackerCard
                                                key={tracker._id}
                                                tracker={tracker}
                                                onEdit={handleEditTracker}
                                                onDelete={handleDeleteTracker}
                                                onViewHistory={handleViewHistory}
                                            />
                                        ))}
                                    </TrackerGrid>
                                </FolderSection>
                            );
                        })}

                        {/* Trackers without folder */}
                        {trackersByFolder['no-folder']?.length > 0 && (
                            <FolderSection>
                                {folders.length > 0 && (
                                    <FolderHeader>
                                        <span className="material-symbols-outlined">folder_open</span>
                                        <FolderName>Uncategorized</FolderName>
                                    </FolderHeader>
                                )}
                                <TrackerGrid>
                                    {trackersByFolder['no-folder'].map(tracker => (
                                        <TrackerCard
                                            key={tracker._id}
                                            tracker={tracker}
                                            onEdit={handleEditTracker}
                                            onDelete={handleDeleteTracker}
                                            onViewHistory={handleViewHistory}
                                        />
                                    ))}
                                </TrackerGrid>
                            </FolderSection>
                        )}
                    </>
                )}
            </TrackerBody>

            {deleteConfirm.isOpen && (
                <DeleteConfirmModal onClick={cancelDelete}>
                    <DeleteConfirmContent onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Tracker?</h3>
                        <p>
                            Are you sure you want to delete this tracker? This will also delete all historical
                            data associated with it. This action cannot be undone.
                        </p>
                        <DeleteConfirmActions>
                            <button onClick={cancelDelete}>Cancel</button>
                            <button onClick={confirmDelete}>Delete</button>
                        </DeleteConfirmActions>
                    </DeleteConfirmContent>
                </DeleteConfirmModal>
            )}

            <TrackerEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingTracker(null);
                }}
                onSave={handleSaveTracker}
                editingTracker={editingTracker}
                folders={folders}
                availableTags={tags}
            />

            <TrackerHistory
                isOpen={isHistoryOpen}
                onClose={() => {
                    setIsHistoryOpen(false);
                    setHistoryTracker(null);
                }}
                tracker={historyTracker}
            />
        </TrackerContainer>
    );
};

export default Trackers;