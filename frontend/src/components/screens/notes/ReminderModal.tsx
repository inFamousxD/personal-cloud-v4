import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { darkTheme } from '../../../theme/dark.colors';
import { 
    ReminderFormData, 
    validateReminderForm, 
    createReminder,
    countRecurringReminders 
} from '../../../utils/reminderUtils';
import { NoteReminder } from '../../../services/notesApi';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    background: ${darkTheme.backgroundDarkest};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    width: 90%;
    max-width: 500px;
    max-height: 85vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${darkTheme.backgroundDarker};
    }

    &::-webkit-scrollbar-thumb {
        background: ${darkTheme.accent}40;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid ${darkTheme.border};

    h3 {
        margin: 0;
        color: ${darkTheme.accent};
        font-size: 16px;
    }
`;

const CloseButton = styled.button`
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
        font-size: 20px;
    }
`;

const ModalBody = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Label = styled.label`
    color: ${darkTheme.text.color};
    font-size: 13px;
    font-weight: 600;
`;

const Input = styled.input`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: ${darkTheme.accent};
    }
`;

const Select = styled.select`
    background: ${darkTheme.backgroundDarker};
    border: 1px solid ${darkTheme.border};
    border-radius: 4px;
    color: ${darkTheme.text.color};
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${darkTheme.accent};
    }
`;

const Checkbox = styled.input`
    cursor: pointer;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${darkTheme.text.color};
    font-size: 13px;
    cursor: pointer;
`;

const RecurringSection = styled.div<{ $visible: boolean }>`
    display: ${props => props.$visible ? 'flex' : 'none'};
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: ${darkTheme.backgroundDarker};
    border-radius: 4px;
`;

const DaysOfWeekGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
`;

const DayButton = styled.button<{ $selected: boolean }>`
    background: ${props => props.$selected ? darkTheme.accent : 'transparent'};
    color: ${props => props.$selected ? 'white' : darkTheme.text.color};
    border: 1px solid ${props => props.$selected ? darkTheme.accent : darkTheme.border};
    border-radius: 4px;
    padding: 8px 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;

    &:hover {
        border-color: ${darkTheme.accent};
    }
`;

const PreviewText = styled.div`
    color: ${darkTheme.accent};
    font-size: 12px;
    padding: 8px;
    background: ${darkTheme.accent}10;
    border-radius: 4px;
    text-align: center;
`;

const ErrorText = styled.div`
    color: #e74c3c;
    font-size: 12px;
    padding: 8px;
    background: rgba(231, 76, 60, 0.1);
    border: 1px solid #e74c3c;
    border-radius: 4px;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid ${darkTheme.border};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    border: none;

    ${props => props.$variant === 'primary' ? `
        background: ${darkTheme.accent};
        color: ${darkTheme.text.accentAlt};

        &:hover {
            opacity: 0.9;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    ` : `
        background: transparent;
        color: ${darkTheme.text.color};
        border: 1px solid ${darkTheme.border};

        &:hover {
            background: ${darkTheme.backgroundDarker};
        }
    `}
`;

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (reminder: NoteReminder) => void;
    editingReminder?: NoteReminder | null;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onSave, editingReminder }) => {
    const [formData, setFormData] = useState<ReminderFormData>({
        dateTime: new Date(),
        isRecurring: false,
        frequency: 'daily',
        interval: 1,
        daysOfWeek: [],
        endDate: undefined
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (editingReminder) {
                // Load existing reminder data
                setFormData({
                    dateTime: new Date(editingReminder.dateTime),
                    isRecurring: editingReminder.isRecurring,
                    frequency: editingReminder.recurringPattern?.frequency || 'daily',
                    interval: editingReminder.recurringPattern?.interval || 1,
                    daysOfWeek: editingReminder.recurringPattern?.daysOfWeek || [],
                    endDate: editingReminder.recurringPattern?.endDate 
                        ? new Date(editingReminder.recurringPattern.endDate) 
                        : undefined
                });
            } else {
                // Reset for new reminder
                const defaultDate = new Date();
                defaultDate.setHours(defaultDate.getHours() + 1, 0, 0, 0);
                
                const defaultEndDate = new Date(defaultDate);
                defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);

                setFormData({
                    dateTime: defaultDate,
                    isRecurring: false,
                    frequency: 'daily',
                    interval: 1,
                    daysOfWeek: [],
                    endDate: defaultEndDate
                });
            }
            setError(null);
        }
    }, [isOpen, editingReminder]);

    const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
        const current = new Date(formData.dateTime);
        
        if (field === 'date') {
            const [year, month, day] = value.split('-').map(Number);
            current.setFullYear(year, month - 1, day);
        } else {
            const [hours, minutes] = value.split(':').map(Number);
            current.setHours(hours, minutes, 0, 0);
        }

        setFormData({ ...formData, dateTime: current });
    };

    const handleEndDateChange = (value: string) => {
        const [year, month, day] = value.split('-').map(Number);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);
        setFormData({ ...formData, endDate });
    };

    const toggleDayOfWeek = (day: number) => {
        const current = formData.daysOfWeek || [];
        const updated = current.includes(day)
            ? current.filter(d => d !== day)
            : [...current, day].sort();
        setFormData({ ...formData, daysOfWeek: updated });
    };

    const handleSave = () => {
        const validationError = validateReminderForm(formData);
        if (validationError) {
            setError(validationError);
            return;
        }

        const reminder = createReminder(formData);
        
        // If editing, preserve the original ID
        if (editingReminder) {
            reminder.id = editingReminder.id;
        }

        onSave(reminder);
        onClose();
    };

    if (!isOpen) return null;

    const dateValue = formData.dateTime.toISOString().split('T')[0];
    const timeValue = formData.dateTime.toTimeString().slice(0, 5);
    const endDateValue = formData.endDate?.toISOString().split('T')[0] || '';

    const reminderCount = countRecurringReminders(formData);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <h3>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</h3>
                    <CloseButton onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    <FormGroup>
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={dateValue}
                            onChange={(e) => handleDateTimeChange('date', e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Time</Label>
                        <Input
                            type="time"
                            value={timeValue}
                            onChange={(e) => handleDateTimeChange('time', e.target.value)}
                        />
                    </FormGroup>

                    <CheckboxLabel>
                        <Checkbox
                            type="checkbox"
                            checked={formData.isRecurring}
                            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        />
                        Make recurring
                    </CheckboxLabel>

                    <RecurringSection $visible={formData.isRecurring}>
                        <FormGroup>
                            <Label>Frequency</Label>
                            <Select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    frequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                                })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>Every</Label>
                            <Input
                                type="number"
                                min="1"
                                max="30"
                                value={formData.interval}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    interval: parseInt(e.target.value) || 1 
                                })}
                            />
                        </FormGroup>

                        {formData.frequency === 'weekly' && (
                            <FormGroup>
                                <Label>Days of Week</Label>
                                <DaysOfWeekGrid>
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                        <DayButton
                                            key={day}
                                            type="button"
                                            $selected={(formData.daysOfWeek || []).includes(index)}
                                            onClick={() => toggleDayOfWeek(index)}
                                        >
                                            {day}
                                        </DayButton>
                                    ))}
                                </DaysOfWeekGrid>
                            </FormGroup>
                        )}

                        <FormGroup>
                            <Label>End Date (max 12 months)</Label>
                            <Input
                                type="date"
                                value={endDateValue}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                            />
                        </FormGroup>
                    </RecurringSection>

                    {formData.isRecurring && reminderCount > 0 && (
                        <PreviewText>
                            Will create {reminderCount} reminder{reminderCount !== 1 ? 's' : ''}
                        </PreviewText>
                    )}

                    {error && <ErrorText>{error}</ErrorText>}
                </ModalBody>

                <ModalFooter>
                    <Button $variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button $variant="primary" onClick={handleSave}>
                        Save
                    </Button>
                </ModalFooter>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ReminderModal;