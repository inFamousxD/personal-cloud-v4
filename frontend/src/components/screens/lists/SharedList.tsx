import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listsApi, List, ListItem } from '../../../services/listsApi';
import {
    ListContent,
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
    ShareBanner
} from './Lists.styles';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';

const SharedContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${darkTheme.backgroundDarker};
    width: 100%;
    height: 100vh;
    overflow: hidden;
`;

const SharedHeader = styled.div`
    padding: 8px 12px;
    background: ${darkTheme.backgroundDarkest};
    border-bottom: 1px solid ${darkTheme.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 768px) {
        padding: 8px 12px;
        flex-direction: column;
        align-items: flex-start;
    }
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${darkTheme.accent};
    font-size: 18px;
    font-weight: 600;

    .material-symbols-outlined {
        font-size: 24px;
    }
`;

const SharedList = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [list, setList] = useState<List | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const isReadOnly = list?.shareMode === 'read-only';

    useEffect(() => {
        loadSharedList();
    }, [shareId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && !isReadOnly) {
                e.preventDefault();
                if (hasUnsavedChanges) {
                    handleSave();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasUnsavedChanges, list, isReadOnly]);

    const loadSharedList = async () => {
        if (!shareId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await listsApi.getSharedList(shareId);
            setList(data);
        } catch (error: any) {
            console.error('Error loading shared list:', error);
            setError(error.response?.status === 404 
                ? 'This shared list was not found or is no longer available.' 
                : 'Failed to load shared list. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!shareId || !list || isReadOnly) return;

        try {
            const updated = await listsApi.updateSharedList(shareId, {
                title: list.title,
                items: list.items,
                tags: list.tags
            });
            setList(updated);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving shared list:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleUpdateItem = (id: string, updates: Partial<ListItem>) => {
        if (!list) return;

        const newItems = list.items.map(item => 
            item.id === id ? { ...item, ...updates } : item
        );

        setList({
            ...list,
            items: newItems
        });
        setHasUnsavedChanges(true);

        // Auto-save checkbox changes
        if (updates.checked !== undefined && !isReadOnly) {
            setTimeout(async () => {
                try {
                    await listsApi.updateSharedList(shareId!, {
                        items: newItems
                    });
                } catch (error) {
                    console.error('Error auto-saving checkbox:', error);
                }
            }, 100);
        }
    };

    const handleAddItem = () => {
        if (!list || isReadOnly) return;

        const newItem: ListItem = {
            id: crypto.randomUUID(),
            text: '',
            checked: false,
            isComplex: false,
            detailsExpanded: false
        };
        setList({
            ...list,
            items: [...list.items, newItem]
        });
        setHasUnsavedChanges(true);
    };

    const handleDeleteItem = (id: string) => {
        if (!list || isReadOnly) return;

        setList({
            ...list,
            items: list.items.filter(item => item.id !== id)
        });
        setHasUnsavedChanges(true);
    };

    const handleToggleComplex = (id: string) => {
        if (!list || isReadOnly) return;

        setList({
            ...list,
            items: list.items.map(item => 
                item.id === id 
                    ? { 
                        ...item, 
                        isComplex: !item.isComplex,
                        detailsExpanded: !item.isComplex ? true : item.detailsExpanded
                      }
                    : item
            )
        });
        setHasUnsavedChanges(true);
    };

    if (loading) {
        return (
            <SharedContainer>
                <LoadingState>
                    <div className="lds-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </LoadingState>
            </SharedContainer>
        );
    }

    if (error || !list) {
        return (
            <SharedContainer>
                <EmptyState>
                    <span className="material-symbols-outlined">error</span>
                    <h3>List Not Found</h3>
                    <p>{error || 'This shared list could not be loaded.'}</p>
                </EmptyState>
            </SharedContainer>
        );
    }

    return (
        <SharedContainer>
            <SharedHeader>
                <Logo>
                    <span className="material-symbols-outlined">event_list</span>
                    Shared List
                </Logo>
                {!isReadOnly && (
                    <ActionButton onClick={handleSave} $variant="primary" disabled={!hasUnsavedChanges}>
                        <span className="material-symbols-outlined">save</span>
                        {hasUnsavedChanges ? 'Save' : 'Saved'}
                    </ActionButton>
                )}
            </SharedHeader>

            <ListContent $sidebarCollapsed={true}>
                <EditorContainer>
                    <ShareBanner $mode={isReadOnly ? 'read-only' : 'read-write'}>
                        <span className="material-symbols-outlined">
                            {isReadOnly ? 'visibility' : 'edit'}
                        </span>
                        <div>
                            <strong>{isReadOnly ? 'View-only mode' : 'Edit mode'}</strong> - 
                            {isReadOnly 
                                ? ' You can view and check items but cannot make other changes.'
                                : ' You can make changes to this list. Remember to save your changes.'}
                        </div>
                    </ShareBanner>

                    <TitleInput
                        value={list.title}
                        onChange={(e) => {
                            setList({ ...list, title: e.target.value });
                            setHasUnsavedChanges(true);
                        }}
                        placeholder="List title..."
                        disabled={isReadOnly}
                    />

                    <ItemsContainer>
                        {list.items.map((item) => (
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
                                        disabled={isReadOnly}
                                    />
                                    {!isReadOnly && (
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
                                    )}
                                </ItemMainRow>
                                {item.isComplex && (
                                    <ItemDetails
                                        value={item.details || ''}
                                        onChange={(e) => handleUpdateItem(item.id, { details: e.target.value })}
                                        placeholder="Additional details..."
                                        $expanded={item.detailsExpanded}
                                        onFocus={() => handleUpdateItem(item.id, { detailsExpanded: true })}
                                        disabled={isReadOnly}
                                    />
                                )}
                            </ListItemRow>
                        ))}
                        {!isReadOnly && (
                            <AddItemButton onClick={handleAddItem}>
                                <span className="material-symbols-outlined">add</span>
                                Add item
                            </AddItemButton>
                        )}
                    </ItemsContainer>
                </EditorContainer>
            </ListContent>
        </SharedContainer>
    );
};

export default SharedList;