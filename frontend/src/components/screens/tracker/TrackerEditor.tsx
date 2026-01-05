import React, { useState, useEffect } from 'react';
import { Tracker, TrackerFolder, TrackerType, TrackerConfig, CreateTrackerInput, UpdateTrackerInput } from '../../../services/trackersApi';
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
    Select,
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
    InlineAddButton,
    FolderRow
} from './TrackerEditor.styles';

interface TrackerEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tracker: CreateTrackerInput | UpdateTrackerInput, id?: string) => Promise<void>;
    editingTracker: Tracker | null;
    folders: TrackerFolder[];
    availableTags: string[];
}

const trackerTypes: { type: TrackerType; icon: string; label: string; description: string }[] = [
    { type: 'binary', icon: 'check_circle', label: 'Binary', description: 'Yes/No tracking' },
    { type: 'numeric', icon: '123', label: 'Numeric', description: 'Count values' },
    { type: 'duration', icon: 'schedule', label: 'Duration', description: 'Track time' },
    { type: 'frequency', icon: 'repeat', label: 'Frequency', description: 'Times per period' },
    { type: 'scale', icon: 'sentiment_satisfied', label: 'Scale', description: 'Rate 1-10' },
    { type: 'target', icon: 'flag', label: 'Target', description: 'Goal-based' }
];

const TrackerEditor: React.FC<TrackerEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    editingTracker,
    folders,
    availableTags
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TrackerType>('binary');
    const [folderId, setFolderId] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [config, setConfig] = useState<TrackerConfig>({});
    const [saving, setSaving] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

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

    const resetForm = () => {
        setName('');
        setDescription('');
        setType('binary');
        setFolderId(null);
        setTags([]);
        setConfig({
            allowNotes: true,
            frequency: 'daily'
        });
        setIsAddingFolder(false);
        setNewFolderName('');
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
                                    placeholder="glasses, pages, km..."
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
                                <Select
                                    value={config.durationUnit || 'minutes'}
                                    onChange={(e) => updateConfig('durationUnit', e.target.value)}
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Target Duration</Label>
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
                                <Select
                                    value={config.frequency || 'weekly'}
                                    onChange={(e) => updateConfig('frequency', e.target.value)}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </Select>
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
                                <Label>Min Value</Label>
                                <Input
                                    type="number"
                                    value={config.scaleMin || ''}
                                    onChange={(e) => updateConfig('scaleMin', parseInt(e.target.value) || 1)}
                                    placeholder="1"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Max Value</Label>
                                <Input
                                    type="number"
                                    value={config.scaleMax || ''}
                                    onChange={(e) => updateConfig('scaleMax', parseInt(e.target.value) || 10)}
                                    placeholder="10"
                                />
                            </FormGroup>
                        </ConfigRow>
                        <HelpText>Rate on a scale for mood, energy, etc.</HelpText>
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
                                <Select
                                    value={config.targetPeriod || 'week'}
                                    onChange={(e) => updateConfig('targetPeriod', e.target.value)}
                                >
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                </Select>
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
            <EditorModal onClick={(e) => e.stopPropagation()}>
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
                                            <div>
                                                <span>{t.label}</span>
                                                <small>{t.description}</small>
                                            </div>
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
                        {!isAddingFolder ? (
                            <FolderRow>
                                <Select
                                    value={folderId || ''}
                                    onChange={(e) => setFolderId(e.target.value || null)}
                                >
                                    <option value="">No Folder</option>
                                    {folders.map(folder => (
                                        <option key={folder._id} value={folder._id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </Select>
                                <InlineAddButton onClick={() => setIsAddingFolder(true)}>
                                    <span className="material-symbols-outlined">add</span>
                                </InlineAddButton>
                            </FolderRow>
                        ) : (
                            <FolderRow>
                                <Input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="New folder name..."
                                    autoFocus
                                />
                                <InlineAddButton 
                                    onClick={() => {
                                        // TODO: Call API to create folder
                                        setIsAddingFolder(false);
                                        setNewFolderName('');
                                    }}
                                    disabled={!newFolderName.trim()}
                                >
                                    <span className="material-symbols-outlined">check</span>
                                </InlineAddButton>
                                <InlineAddButton 
                                    onClick={() => {
                                        setIsAddingFolder(false);
                                        setNewFolderName('');
                                    }}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </InlineAddButton>
                            </FolderRow>
                        )}
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