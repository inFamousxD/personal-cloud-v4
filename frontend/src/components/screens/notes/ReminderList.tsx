import React, { useState } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
import { NoteReminder } from '../../../services/notesApi';
import { formatReminderDisplay } from '../../../utils/reminderUtils';
import ReminderModal from './ReminderModal';

const Container = styled.div`
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    overflow: hidden;
`;

const Header = styled.div<{ $expanded: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: ${darkTheme.backgroundDarker};
    cursor: pointer;
    user-select: none;

    &:hover {
        background: ${darkTheme.backgroundDarkest};
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    font-weight: 600;

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Badge = styled.span<{ $type: 'active' | 'completed' }>`
    background: ${props => props.$type === 'active' ? darkTheme.accent : darkTheme.text.color};
    color: ${props => props.$type === 'active' ? 'white' : darkTheme.backgroundDarkest};
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
`;

const ExpandIcon = styled.span<{ $expanded: boolean }>`
    color: ${darkTheme.text.color};
    opacity: 0.5;
    transition: transform 0.2s;
    transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

const Body = styled.div<{ $expanded: boolean }>`
    display: ${props => props.$expanded ? 'flex' : 'none'};
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: ${darkTheme.backgroundDarkest};
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const SectionTitle = styled.div`
    color: ${darkTheme.text.color};
    font-size: 11px;
    font-weight: 600;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    user-select: none;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 12px;
    }
`;

const ReminderItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    gap: 8px;
`;

const ReminderInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ReminderDate = styled.div`
    color: ${darkTheme.text.color};
    font-size: 12px;
    font-weight: 600;
`;

const ReminderDetails = styled.div`
    color: ${darkTheme.text.color};
    font-size: 11px;
    opacity: 0.6;
`;

const ReminderActions = styled.div`
    display: flex;
    gap: 4px;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
    background: transparent;
    border: none;
    color: ${props => props.$danger ? '#e74c3c' : darkTheme.text.color};
    opacity: 0.5;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        opacity: 1;
    }

    .material-symbols-outlined {
        font-size: 16px;
    }
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: ${darkTheme.accent};
    color: ${darkTheme.text.accentAlt};
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;

    &:hover {
        opacity: 0.9;
    }

    .material-symbols-outlined {
        font-size: 14px;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 16px;
    color: ${darkTheme.text.color};
    opacity: 0.5;
    font-size: 12px;
`;

interface ReminderListProps {
    reminders: NoteReminder[];
    onChange: (reminders: NoteReminder[]) => void;
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders, onChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<NoteReminder | null>(null);

    const activeReminders = reminders.filter(r => r.enabled);
    const completedReminders = reminders.filter(r => !r.enabled);

    const handleAdd = () => {
        setEditingReminder(null);
        setModalOpen(true);
    };

    const handleEdit = (reminder: NoteReminder) => {
        setEditingReminder(reminder);
        setModalOpen(true);
    };

    const handleSave = (reminder: NoteReminder) => {
        if (editingReminder) {
            // Update existing
            onChange(reminders.map(r => r.id === reminder.id ? reminder : r));
        } else {
            // Add new
            onChange([...reminders, reminder]);
        }
    };

    const handleDelete = (reminderId: string) => {
        onChange(reminders.filter(r => r.id !== reminderId));
    };

    const handleReactivate = (reminder: NoteReminder) => {
        // Open modal to set new date
        setEditingReminder({
            ...reminder,
            enabled: true,
            completedAt: undefined
        });
        setModalOpen(true);
    };

    return (
        <>
            <Container>
                <Header $expanded={expanded} onClick={() => setExpanded(!expanded)}>
                    <HeaderLeft>
                        <span className="material-symbols-outlined">notifications</span>
                        Reminders
                    </HeaderLeft>
                    <HeaderRight>
                        {activeReminders.length > 0 && (
                            <Badge $type="active">{activeReminders.length}</Badge>
                        )}
                        {completedReminders.length > 0 && (
                            <Badge $type="completed">{completedReminders.length}</Badge>
                        )}
                        <ExpandIcon $expanded={expanded}>
                            <span className="material-symbols-outlined">expand_more</span>
                        </ExpandIcon>
                    </HeaderRight>
                </Header>

                <Body $expanded={expanded}>
                    {activeReminders.length > 0 && (
                        <Section>
                            <SectionTitle>Active ({activeReminders.length})</SectionTitle>
                            {activeReminders.map(reminder => (
                                <ReminderItem key={reminder.id}>
                                    <ReminderInfo>
                                        <ReminderDate>
                                            {new Date(reminder.dateTime).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </ReminderDate>
                                        {reminder.isRecurring && (
                                            <ReminderDetails>
                                                {formatReminderDisplay(reminder)}
                                            </ReminderDetails>
                                        )}
                                    </ReminderInfo>
                                    <ReminderActions>
                                        <ActionButton onClick={() => handleEdit(reminder)} title="Edit">
                                            <span className="material-symbols-outlined">edit</span>
                                        </ActionButton>
                                        <ActionButton 
                                            $danger 
                                            onClick={() => handleDelete(reminder.id)}
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </ActionButton>
                                    </ReminderActions>
                                </ReminderItem>
                            ))}
                        </Section>
                    )}

                    {completedReminders.length > 0 && (
                        <Section>
                            <SectionTitle onClick={() => setShowCompleted(!showCompleted)}>
                                Completed ({completedReminders.length})
                                <span className="material-symbols-outlined">
                                    {showCompleted ? 'expand_less' : 'expand_more'}
                                </span>
                            </SectionTitle>
                            {showCompleted && completedReminders.map(reminder => (
                                <ReminderItem key={reminder.id} style={{ opacity: 0.6 }}>
                                    <ReminderInfo>
                                        <ReminderDate>
                                            {new Date(reminder.dateTime).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </ReminderDate>
                                        {reminder.isRecurring && (
                                            <ReminderDetails>
                                                {formatReminderDisplay(reminder)}
                                            </ReminderDetails>
                                        )}
                                    </ReminderInfo>
                                    <ReminderActions>
                                        <ActionButton onClick={() => handleReactivate(reminder)} title="Reactivate">
                                            <span className="material-symbols-outlined">refresh</span>
                                        </ActionButton>
                                        <ActionButton 
                                            $danger 
                                            onClick={() => handleDelete(reminder.id)}
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </ActionButton>
                                    </ReminderActions>
                                </ReminderItem>
                            ))}
                        </Section>
                    )}

                    {reminders.length === 0 && (
                        <EmptyState>No reminders yet</EmptyState>
                    )}

                    <AddButton onClick={handleAdd}>
                        <span className="material-symbols-outlined">add</span>
                        Add Reminder
                    </AddButton>
                </Body>
            </Container>

            <ReminderModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingReminder(null);
                }}
                onSave={handleSave}
                editingReminder={editingReminder}
            />
        </>
    );
};

export default ReminderList;