import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry, trackersApi } from '../../../services/trackersApi';
import {
    HistoryOverlay,
    HistoryModal,
    HistoryHeader,
    HistoryTitle,
    CloseButton,
    HistoryBody,
    CalendarSection,
    MonthHeader,
    MonthTitle,
    MonthNav,
    NavButton,
    CalendarGrid,
    DayHeader,
    CalendarDay,
    EntryList,
    EntryCard,
    EntryInfo,
    EntryDate,
    EntryValue,
    EntryNote,
    EntryActions,
    IconButton,
    EmptyState,
    QuickAddSection,
    QuickAddInputs,
    QuickAddRow,
    QuickInput,
    QuickTextArea,
    QuickAddButton
} from './TrackerHistory.styles';

interface TrackerHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    tracker: Tracker | null;
}

const TrackerHistory: React.FC<TrackerHistoryProps> = ({ isOpen, onClose, tracker }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [entries, setEntries] = useState<TrackerEntry[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Quick add form state
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [quickValue, setQuickValue] = useState('');
    const [quickNote, setQuickNote] = useState('');

    useEffect(() => {
        if (isOpen && tracker) {
            loadEntries();
        }
    }, [isOpen, tracker, currentMonth]);

    const loadEntries = async () => {
        if (!tracker?._id) return;

        setLoading(true);
        try {
            const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const data = await trackersApi.getEntries(tracker._id, {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            setEntries(data);
        } catch (error) {
            console.error('Error loading entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    const getDayStatus = (date: Date): 'completed' | 'partial' | 'missed' | 'skipped' | 'future' | 'empty' => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date > today) return 'future';

        const entry = entries.find(e => {
            const entryDate = new Date(e.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === date.getTime();
        });

        if (!entry) return 'missed';
        if (entry.skipped) return 'skipped';

        if (tracker?.type === 'binary') {
            return entry.completed ? 'completed' : 'missed';
        } else if (tracker?.type === 'numeric') {
            const target = tracker.config.targetValue || 0;
            const value = entry.numericValue || 0;
            if (value >= target) return 'completed';
            if (value > 0) return 'partial';
            return 'missed';
        } else if (tracker?.type === 'duration') {
            const value = entry.durationValue || 0;
            return value > 0 ? 'completed' : 'missed';
        } else if (tracker?.type === 'scale') {
            return entry.scaleValue !== undefined ? 'completed' : 'missed';
        }

        return 'missed';
    };

    const handleDayClick = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) return;

        setSelectedDate(date);
        
        // Pre-fill with existing entry if available
        const entry = entries.find(e => {
            const entryDate = new Date(e.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === date.getTime();
        });

        if (entry) {
            if (tracker?.type === 'numeric') {
                setQuickValue(entry.numericValue?.toString() || '');
            } else if (tracker?.type === 'duration') {
                setQuickValue(entry.durationValue?.toString() || '');
            } else if (tracker?.type === 'scale') {
                setQuickValue(entry.scaleValue?.toString() || '');
            }
            setQuickNote(entry.note || '');
        } else {
            setQuickValue('');
            setQuickNote('');
        }
    };

    const handleQuickAdd = async () => {
        if (!tracker?._id) return;

        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];

            if (tracker.type === 'binary') {
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    completed: true,
                    note: quickNote || undefined
                });
            } else if (tracker.type === 'numeric') {
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    numericValue: parseInt(quickValue) || 0,
                    note: quickNote || undefined
                });
            } else if (tracker.type === 'duration') {
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    durationValue: parseInt(quickValue) || 0,
                    note: quickNote || undefined
                });
            } else if (tracker.type === 'scale') {
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    scaleValue: parseInt(quickValue) || 0,
                    note: quickNote || undefined
                });
            }

            setQuickValue('');
            setQuickNote('');
            await loadEntries();
        } catch (error) {
            console.error('Error adding entry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        if (!tracker?._id) return;

        setLoading(true);
        try {
            await trackersApi.deleteEntry(tracker._id, entryId);
            await loadEntries();
        } catch (error) {
            console.error('Error deleting entry:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();

        const days: JSX.Element[] = [];

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<CalendarDay key={`empty-${i}`} $status="empty" />);
        }

        // Days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const status = getDayStatus(date);
            const isToday = date.getTime() === today.getTime();

            days.push(
                <CalendarDay
                    key={day}
                    $status={status}
                    $isToday={isToday}
                    onClick={() => handleDayClick(date)}
                >
                    <span>{day}</span>
                </CalendarDay>
            );
        }

        return days;
    };

    const formatEntryValue = (entry: TrackerEntry) => {
        if (tracker?.type === 'binary') {
            return entry.completed ? 'Completed' : 'Not completed';
        } else if (tracker?.type === 'numeric') {
            return `${entry.numericValue} ${tracker.config.unit || 'units'}`;
        } else if (tracker?.type === 'duration') {
            return `${entry.durationValue} ${tracker.config.durationUnit || 'minutes'}`;
        } else if (tracker?.type === 'scale') {
            return `${entry.scaleValue}/${tracker.config.scaleMax || 10}`;
        }
        return 'Logged';
    };

    if (!isOpen || !tracker) return null;

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    const canGoNext = currentMonth < new Date(today.getFullYear(), today.getMonth(), 1);

    return (
        <HistoryOverlay onClick={onClose}>
            <HistoryModal onClick={(e) => e.stopPropagation()}>
                <HistoryHeader>
                    <HistoryTitle>
                        <h2>{tracker.name}</h2>
                        <span>History & Calendar View</span>
                    </HistoryTitle>
                    <CloseButton onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                </HistoryHeader>

                <HistoryBody>
                    <CalendarSection>
                        <MonthHeader>
                            <MonthTitle>{monthName}</MonthTitle>
                            <MonthNav>
                                <NavButton onClick={handlePrevMonth}>
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </NavButton>
                                <NavButton onClick={handleToday}>
                                    <span className="material-symbols-outlined">today</span>
                                </NavButton>
                                <NavButton onClick={handleNextMonth} disabled={!canGoNext}>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </NavButton>
                            </MonthNav>
                        </MonthHeader>

                        <CalendarGrid>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <DayHeader key={day}>{day}</DayHeader>
                            ))}
                            {renderCalendar()}
                        </CalendarGrid>
                    </CalendarSection>

                    <QuickAddSection>
                        <QuickAddInputs>
                            <QuickAddRow>
                                <QuickInput
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {(tracker.type === 'numeric' || tracker.type === 'duration' || tracker.type === 'scale') && (
                                    <QuickInput
                                        type="number"
                                        value={quickValue}
                                        onChange={(e) => setQuickValue(e.target.value)}
                                        placeholder={
                                            tracker.type === 'numeric' 
                                                ? `Value (${tracker.config.unit || 'units'})`
                                                : tracker.type === 'duration'
                                                ? `Duration (${tracker.config.durationUnit || 'min'})`
                                                : `Rating (${tracker.config.scaleMin || 1}-${tracker.config.scaleMax || 10})`
                                        }
                                    />
                                )}
                            </QuickAddRow>
                            {tracker.config.allowNotes && (
                                <QuickTextArea
                                    value={quickNote}
                                    onChange={(e) => setQuickNote(e.target.value)}
                                    placeholder="Add a note (optional)..."
                                />
                            )}
                        </QuickAddInputs>
                        <QuickAddButton onClick={handleQuickAdd} disabled={loading}>
                            <span className="material-symbols-outlined">add</span>
                            Log
                        </QuickAddButton>
                    </QuickAddSection>

                    {entries.length > 0 ? (
                        <EntryList>
                            {entries
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map(entry => (
                                    <EntryCard key={entry._id}>
                                        <EntryInfo>
                                            <EntryDate>
                                                {new Date(entry.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </EntryDate>
                                            <EntryValue>
                                                {(entry.completed || entry.numericValue || entry.durationValue || entry.scaleValue) && (
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                )}
                                                {formatEntryValue(entry)}
                                            </EntryValue>
                                            {entry.note && <EntryNote>"{entry.note}"</EntryNote>}
                                        </EntryInfo>
                                        <EntryActions>
                                            <IconButton
                                                onClick={() => handleDayClick(new Date(entry.date))}
                                                title="Edit"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </IconButton>
                                            <IconButton
                                                className="delete"
                                                onClick={() => handleDeleteEntry(entry._id!)}
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </IconButton>
                                        </EntryActions>
                                    </EntryCard>
                                ))}
                        </EntryList>
                    ) : (
                        <EmptyState>
                            <span className="material-symbols-outlined">event_available</span>
                            <p>No entries for this month yet. Start tracking by clicking on a day above!</p>
                        </EmptyState>
                    )}
                </HistoryBody>
            </HistoryModal>
        </HistoryOverlay>
    );
};

export default TrackerHistory;