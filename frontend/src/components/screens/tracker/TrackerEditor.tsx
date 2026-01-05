import React, { useState, useEffect, useRef } from 'react';
import { Tracker, TrackerFolder, TrackerType, TrackerConfig, CreateTrackerInput, UpdateTrackerInput, trackersApi } from '../../../services/trackersApi';
import TagInput from '../notes/TagInput';
import {
    EditorOverlay,
    EditorModal,
    EditorHeader,
    EditorTitle,
    CloseButton,
    EditorBody,
    FormGroup,
    Label,
    Input,
    TextArea,
    TypeGrid,
    TypeCard,
    ConfigSection,
    ConfigRow,
    CheckboxGroup,
    EditorFooter,
    ArchiveButton,
    FooterActions,
    EditorButton,
    HelpText,
    SectionDivider,
    FolderSelectorWrapper,
    FolderSelectorButton,
    FolderDropdown,
    FolderDropdownItem,
    AddFolderInput,
    FolderInput,
    FolderActionButton
} from './TrackerEditor.styles';

interface TrackerEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tracker: CreateTrackerInput | UpdateTrackerInput, id?: string) => Promise<void>;
    editingTracker: Tracker | null;
    folders: TrackerFolder[];
    availableTags: string[];
    onFoldersUpdate: () => void;
}

const trackerTypes: { type: TrackerType; icon: string; label: string; description: string }[] = [
    { type: 'binary', icon: 'check_circle', label: 'Binary', description: 'Yes/No' },
    { type: 'numeric', icon: '123', label: 'Numeric', description: 'Count' },
    { type: 'duration', icon: 'schedule', label: 'Duration', description: 'Time' },
    { type: 'frequency', icon: 'repeat', label: 'Frequency', description: 'Times/period' },
    { type: 'scale', icon: 'sentiment_satisfied', label: 'Scale', description: 'Rate 1-10' },
    { type: 'target', icon: 'flag', label: 'Target', description: 'Goal-based' }
];

const TrackerEditor: React.FC<TrackerEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    editingTracker,
    folders,
    availableTags,
    onFoldersUpdate
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TrackerType>('binary');
    const [folderId, setFolderId] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [config, setConfig] = useState<TrackerConfig>({});
    const [saving, setSaving] = useState(false);
    
    // Folder selector states
    const [showFolderDropdown, setShowFolderDropdown] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const folderDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingTracker) {
            setName(editingTracker.name);
            setDescription(editingTracker.description || '');
            setType(editingTracker.type);
            setFolderId(editingTracker.folderId);
            setTags(editingTracker.tags || []);
            setConfig(editingTracker.config || {});
        } else {
            resetForm();
        }
    }, [editingTracker, isOpen]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target as Node)) {
                setShowFolderDropdown(false);
                setIsAddingFolder(false);
                setNewFolderName('');
            }
        };

        if (showFolderDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFolderDropdown]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setType('binary');
        setFolderId(null);
        setTags([]);
        setConfig({
            allowNotes: false,
            frequency: 'daily'
        });
        setShowFolderDropdown(false);
        setIsAddingFolder(false);
        setNewFolderName('');
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const newFolder = await trackersApi.createFolder({ name: newFolderName.trim() });
            setFolderId(newFolder._id || null);
            setIsAddingFolder(false);
            setNewFolderName('');
            setShowFolderDropdown(false);
            onFoldersUpdate();
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            if (editingTracker) {
                await onSave({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    folderId,
                    tags,
                    config
                }, editingTracker._id);
            } else {
                await onSave({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    type,
                    folderId,
                    tags,
                    config
                });
            }
            resetForm();
        } catch (error) {
            console.error('Error saving tracker:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleArchiveToggle = async () => {
        if (!editingTracker) return;

        setSaving(true);
        try {
            await onSave({
                isActive: !editingTracker.isActive
            }, editingTracker._id);
        } catch (error) {
            console.error('Error toggling archive:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (key: keyof TrackerConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSave();
        }
    };

    const getSelectedFolderName = () => {
        if (!folderId) return 'No Folder';
        const folder = folders.find(f => f._id === folderId);
        return folder?.name || 'No Folder';
    };

    const renderConfigForm = () => {
        switch (type) {
            case 'numeric':
                return (
                    <ConfigSection>
                        <ConfigRow>
                            <FormGroup>
                                <Label>Unit</Label>
                                <Input
                                    type="text"
                                    value={config.unit || ''}
                                    onChange={(e) => updateConfig('unit', e.target.value)}
                                    placeholder="glasses, pages..."
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Daily Target</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={config.targetValue || ''}
                                    onChange={(e) => updateConfig('targetValue', parseInt(e.target.value) || 0)}
                                    placeholder="8"
                                />
                            </FormGroup>
                        </ConfigRow>
                    </ConfigSection>
                );

            case 'duration':
                return (
                    <ConfigSection>
                        <ConfigRow>
                            <FormGroup>
                                <Label>Unit</Label>
                                <Input
                                    as="select"
                                    value={config.durationUnit || 'minutes'}
                                    onChange={(e) => updateConfig('durationUnit', e.target.value)}
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Target</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={config.targetDuration || ''}
                                    onChange={(e) => updateConfig('targetDuration', parseInt(e.target.value) || 0)}
                                    placeholder="30"
                                />
                            </FormGroup>
                        </ConfigRow>
                    </ConfigSection>
                );

            case 'frequency':
                return (
                    <ConfigSection>
                        <ConfigRow>
                            <FormGroup>
                                <Label>Target Count</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={config.targetFrequency || ''}
                                    onChange={(e) => updateConfig('targetFrequency', parseInt(e.target.value) || 1)}
                                    placeholder="3"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Per Period</Label>
                                <Input
                                    as="select"
                                    value={config.frequency || 'weekly'}
                                    onChange={(e) => updateConfig('frequency', e.target.value)}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </Input>
                            </FormGroup>
                        </ConfigRow>
                        <HelpText>Example: 3 times per week</HelpText>
                    </ConfigSection>
                );

            case 'scale':
                return (
                    <ConfigSection>
                        <ConfigRow>
                            <FormGroup>
                                <Label>Min</Label>
                                <Input
                                    type="number"
                                    value={config.scaleMin || ''}
                                    onChange={(e) => updateConfig('scaleMin', parseInt(e.target.value) || 1)}
                                    placeholder="1"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Max</Label>
                                <Input
                                    type="number"
                                    value={config.scaleMax || ''}
                                    onChange={(e) => updateConfig('scaleMax', parseInt(e.target.value) || 10)}
                                    placeholder="10"
                                />
                            </FormGroup>
                        </ConfigRow>
                        <HelpText>Rate on a scale (mood, energy, etc.)</HelpText>
                    </ConfigSection>
                );

            case 'target':
                return (
                    <ConfigSection>
                        <ConfigRow>
                            <FormGroup>
                                <Label>Target Days</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={config.targetDays || ''}
                                    onChange={(e) => updateConfig('targetDays', parseInt(e.target.value) || 1)}
                                    placeholder="5"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Per Period</Label>
                                <Input
                                    as="select"
                                    value={config.targetPeriod || 'week'}
                                    onChange={(e) => updateConfig('targetPeriod', e.target.value)}
                                >
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                </Input>
                            </FormGroup>
                        </ConfigRow>
                        <HelpText>Example: 5 days per week</HelpText>
                    </ConfigSection>
                );

            case 'binary':
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <EditorOverlay onClick={onClose}>
            <EditorModal onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <EditorHeader>
                    <EditorTitle>
                        {editingTracker ? 'Edit Tracker' : 'Create New Tracker'}
                    </EditorTitle>
                    <CloseButton onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                </EditorHeader>

                <EditorBody>
                    <FormGroup>
                        <Label>Name *</Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Morning Meditation, Read 30 mins..."
                            maxLength={100}
                            autoFocus
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Description</Label>
                        <TextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            maxLength={500}
                            rows={2}
                        />
                    </FormGroup>

                    {!editingTracker && (
                        <>
                            <SectionDivider />
                            <FormGroup>
                                <Label>Type *</Label>
                                <TypeGrid>
                                    {trackerTypes.map(t => (
                                        <TypeCard
                                            key={t.type}
                                            $selected={type === t.type}
                                            onClick={() => setType(t.type)}
                                        >
                                            <span className="material-symbols-outlined">{t.icon}</span>
                                            <span>{t.label}</span>
                                            <small>{t.description}</small>
                                        </TypeCard>
                                    ))}
                                </TypeGrid>
                            </FormGroup>
                        </>
                    )}

                    {renderConfigForm()}

                    <SectionDivider />

                    <FormGroup>
                        <Label>Folder</Label>
                        <FolderSelectorWrapper ref={folderDropdownRef}>
                            <FolderSelectorButton
                                type="button"
                                $hasValue={!!folderId}
                                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                            >
                                {getSelectedFolderName()}
                                <span className="material-symbols-outlined">
                                    {showFolderDropdown ? 'expand_less' : 'expand_more'}
                                </span>
                            </FolderSelectorButton>
                            {showFolderDropdown && (
                                <FolderDropdown>
                                    {isAddingFolder ? (
                                        <AddFolderInput>
                                            <FolderInput
                                                type="text"
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                placeholder="Folder name..."
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleCreateFolder();
                                                    } else if (e.key === 'Escape') {
                                                        setIsAddingFolder(false);
                                                        setNewFolderName('');
                                                    }
                                                }}
                                            />
                                            <FolderActionButton
                                                type="button"
                                                $variant="primary"
                                                onClick={handleCreateFolder}
                                                disabled={!newFolderName.trim()}
                                            >
                                                <span className="material-symbols-outlined">check</span>
                                            </FolderActionButton>
                                            <FolderActionButton
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingFolder(false);
                                                    setNewFolderName('');
                                                }}
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </FolderActionButton>
                                        </AddFolderInput>
                                    ) : (
                                        <FolderDropdownItem
                                            $isAdd
                                            onClick={() => setIsAddingFolder(true)}
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                            Create New Folder
                                        </FolderDropdownItem>
                                    )}
                                    <FolderDropdownItem
                                        $selected={!folderId}
                                        onClick={() => {
                                            setFolderId(null);
                                            setShowFolderDropdown(false);
                                        }}
                                    >
                                        No Folder
                                        {!folderId && (
                                            <span className="material-symbols-outlined">check</span>
                                        )}
                                    </FolderDropdownItem>
                                    {folders.map(folder => (
                                        <FolderDropdownItem
                                            key={folder._id}
                                            $selected={folderId === folder._id}
                                            onClick={() => {
                                                setFolderId(folder._id || null);
                                                setShowFolderDropdown(false);
                                            }}
                                        >
                                            {folder.name}
                                            {folderId === folder._id && (
                                                <span className="material-symbols-outlined">check</span>
                                            )}
                                        </FolderDropdownItem>
                                    ))}
                                </FolderDropdown>
                            )}
                        </FolderSelectorWrapper>
                    </FormGroup>

                    <FormGroup>
                        <Label>Tags</Label>
                        <TagInput
                            tags={tags}
                            onChange={setTags}
                            availableTags={availableTags}
                            placeholder="Add tags..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <CheckboxGroup>
                            <input
                                type="checkbox"
                                checked={config.allowNotes || false}
                                onChange={(e) => updateConfig('allowNotes', e.target.checked)}
                            />
                            Allow notes when logging entries
                        </CheckboxGroup>
                    </FormGroup>
                </EditorBody>

                <EditorFooter>
                    {editingTracker && (
                        <ArchiveButton onClick={handleArchiveToggle} disabled={saving}>
                            <span className="material-symbols-outlined">
                                {editingTracker.isActive ? 'archive' : 'unarchive'}
                            </span>
                            {editingTracker.isActive ? 'Archive' : 'Unarchive'}
                        </ArchiveButton>
                    )}
                    <div style={{ flex: 1 }} />
                    <FooterActions>
                        <EditorButton variant="secondary" onClick={onClose}>
                            Cancel
                        </EditorButton>
                        <EditorButton
                            variant="primary"
                            onClick={handleSave}
                            disabled={!name.trim() || saving}
                        >
                            <span className="material-symbols-outlined">save</span>
                            {editingTracker ? 'Update' : 'Create'}
                        </EditorButton>
                    </FooterActions>
                </EditorFooter>
            </EditorModal>
        </EditorOverlay>
    );
};

export default TrackerEditor;