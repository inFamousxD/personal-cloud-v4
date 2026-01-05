import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry, trackersApi } from '../../../services/trackersApi';
import {
    HistoryOverlay,
    HistoryModal,
    HistoryHeader,
    HistoryTitle,
    CloseButton,
    HistoryBody,
    QuickLogSection,
    QuickLogTitle,
    QuickLogControls,
    QuickLogButton,
    QuickInput,
    QuickTextArea,
    CalendarSection,
    MonthHeader,
    MonthTitle,
    MonthNav,
    NavButton,
    CalendarGrid,
    DayHeader,
    CalendarDay,
    HistoryListSection,
    HistoryListTitle,
    EntryList,
    EntryCard,
    EntryInfo,
    EntryDate,
    EntryValue,
    EntryNote,
    EntryActions,
    IconButton,
    EmptyState,
    NumericControls,
    NumericValue,
    NumericButton,
    ScaleButtons,
    ScaleButton
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
    
    // Quick log state
    const [quickValue, setQuickValue] = useState('');
    const [quickNote, setQuickNote] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        if (isOpen && tracker) {
            loadEntries();
            setSelectedDate(new Date());
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

    const getTodayEntry = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return entries.find(e => {
            const entryDate = new Date(e.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });
    };

    const handleQuickLog = async (value?: number | boolean) => {
        if (!tracker?._id) return;

        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dateStr = today.toISOString().split('T')[0];

            if (tracker.type === 'binary') {
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    completed: value !== undefined ? Boolean(value) : true,
                    note: quickNote || undefined
                });
            } else if (tracker.type === 'numeric') {
                const numValue = value !== undefined ? Number(value) : parseInt(quickValue) || 0;
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    numericValue: numValue,
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
                const scaleValue = value !== undefined ? Number(value) : parseInt(quickValue) || 0;
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: dateStr,
                    scaleValue: scaleValue,
                    note: quickNote || undefined
                });
            }

            setQuickValue('');
            setQuickNote('');
            await loadEntries();
        } catch (error) {
            console.error('Error logging entry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNumericChange = async (delta: number) => {
        const todayEntry = getTodayEntry();
        const currentValue = todayEntry?.numericValue || 0;
        const newValue = Math.max(0, currentValue + delta);
        await handleQuickLog(newValue);
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

    const renderQuickLog = () => {
        const todayEntry = getTodayEntry();

        if (tracker?.type === 'binary') {
            return (
                <QuickLogControls>
                    <QuickLogButton
                        $completed={todayEntry?.completed}
                        onClick={() => handleQuickLog(!todayEntry?.completed)}
                        disabled={loading}
                    >
                        <span className="material-symbols-outlined">
                            {todayEntry?.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {todayEntry?.completed ? 'Completed Today!' : 'Mark Complete'}
                    </QuickLogButton>
                </QuickLogControls>
            );
        } else if (tracker?.type === 'numeric') {
            return (
                <QuickLogControls>
                    <NumericControls>
                        <NumericButton onClick={() => handleNumericChange(-1)} disabled={loading || (todayEntry?.numericValue || 0) === 0}>
                            <span className="material-symbols-outlined">remove</span>
                        </NumericButton>
                        <NumericValue>{todayEntry?.numericValue || 0} {tracker.config.unit || ''}</NumericValue>
                        <NumericButton onClick={() => handleNumericChange(1)} disabled={loading}>
                            <span className="material-symbols-outlined">add</span>
                        </NumericButton>
                    </NumericControls>
                </QuickLogControls>
            );
        } else if (tracker?.type === 'duration') {
            return (
                <QuickLogControls>
                    <QuickInput
                        type="number"
                        value={quickValue}
                        onChange={(e) => setQuickValue(e.target.value)}
                        placeholder={`Duration (${tracker.config.durationUnit || 'min'})`}
                        min="0"
                    />
                    <QuickLogButton onClick={() => handleQuickLog()} disabled={loading || !quickValue}>
                        <span className="material-symbols-outlined">add</span>
                        Log
                    </QuickLogButton>
                </QuickLogControls>
            );
        } else if (tracker?.type === 'scale') {
            const min = tracker.config.scaleMin || 1;
            const max = tracker.config.scaleMax || 10;
            const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

            return (
                <QuickLogControls>
                    <ScaleButtons>
                        {range.map(value => (
                            <ScaleButton
                                key={value}
                                $selected={todayEntry?.scaleValue === value}
                                onClick={() => handleQuickLog(value)}
                                disabled={loading}
                            >
                                {value}
                            </ScaleButton>
                        ))}
                    </ScaleButtons>
                </QuickLogControls>
            );
        }

        return null;
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
                        <span>{tracker.type.charAt(0).toUpperCase() + tracker.type.slice(1)} Tracker</span>
                    </HistoryTitle>
                    <CloseButton onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </CloseButton>
                </HistoryHeader>

                <HistoryBody>
                    <QuickLogSection>
                        <QuickLogTitle>Log Today</QuickLogTitle>
                        {renderQuickLog()}
                        {tracker.config.allowNotes && (
                            <QuickTextArea
                                value={quickNote}
                                onChange={(e) => setQuickNote(e.target.value)}
                                placeholder="Add a note (optional)..."
                                rows={2}
                            />
                        )}
                    </QuickLogSection>

                    <CalendarSection>
                        <MonthHeader>
                            <MonthTitle>{monthName}</MonthTitle>
                            <MonthNav>
                                <NavButton onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </NavButton>
                                <NavButton onClick={() => { setCurrentMonth(new Date()); }}>
                                    <span className="material-symbols-outlined">today</span>
                                </NavButton>
                                <NavButton 
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                    disabled={!canGoNext}
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </NavButton>
                            </MonthNav>
                        </MonthHeader>

                        <CalendarGrid>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <DayHeader key={i}>{day}</DayHeader>
                            ))}
                            {renderCalendar()}
                        </CalendarGrid>
                    </CalendarSection>

                    {entries.length > 0 && (
                        <HistoryListSection>
                            <HistoryListTitle>Recent History</HistoryListTitle>
                            <EntryList>
                                {entries
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 10)
                                    .map(entry => (
                                        <EntryCard key={entry._id}>
                                            <EntryInfo>
                                                <EntryDate>
                                                    {new Date(entry.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
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
                        </HistoryListSection>
                    )}

                    {entries.length === 0 && (
                        <EmptyState>
                            <span className="material-symbols-outlined">event_available</span>
                            <p>No entries yet. Use the quick log above to get started!</p>
                        </EmptyState>
                    )}
                </HistoryBody>
            </HistoryModal>
        </HistoryOverlay>
    );
};

export default TrackerHistory;