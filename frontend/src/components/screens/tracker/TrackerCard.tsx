import React, { useState, useEffect } from 'react';
import { Tracker, TrackerEntry, TrackerStats, trackersApi } from '../../../services/trackersApi';
import {
    TrackerCardStyled,
    TrackerCardHeader,
    TrackerTitleSection,
    TrackerTitle,
    TrackerType,
    TrackerActions,
    IconButton,
    TrackerStats as TrackerStatsStyled,
    Stat,
    StatValue,
    StatLabel,
    ProgressSection,
    ProgressLabel,
    ProgressBarContainer,
    ProgressBar,
    Heatmap,
    HeatmapDay,
    ActionSection,
    CompleteButton,
    SecondaryButton,
    TrackerTags,
    Tag,
    StreakBadge,
    NumericControls,
    NumericValue,
    NumericButton
} from './TrackerCard.styles';

interface TrackerCardProps {
    tracker: Tracker;
    onEdit: (tracker: Tracker) => void;
    onDelete: (id: string) => void;
    onViewHistory: (tracker: Tracker) => void;
}

const TrackerCard: React.FC<TrackerCardProps> = ({ tracker, onEdit, onDelete, onViewHistory }) => {
    const [stats, setStats] = useState<TrackerStats | null>(null);
    const [todayEntry, setTodayEntry] = useState<TrackerEntry | null>(null);
    const [weekEntries, setWeekEntries] = useState<TrackerEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [tracker._id]);

    const loadData = async () => {
        if (!tracker._id) return;

        try {
            // Load stats
            const statsData = await trackersApi.getStats(tracker._id);
            setStats(statsData);

            // Load today's entry
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            try {
                const entry = await trackersApi.getEntryByDate(tracker._id, todayStr);
                setTodayEntry(entry);
            } catch (error) {
                // No entry for today
                setTodayEntry(null);
            }

            // Load this week's entries for heatmap
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            
            const entries = await trackersApi.getEntries(tracker._id, {
                startDate: startOfWeek.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0]
            });
            setWeekEntries(entries);
        } catch (error) {
            console.error('Error loading tracker data:', error);
        }
    };

    const handleToggleComplete = async () => {
        if (!tracker._id) return;

        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            if (todayEntry) {
                // Toggle completion
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: todayStr,
                    completed: !todayEntry.completed
                });
            } else {
                // Create new entry
                await trackersApi.createOrUpdateEntry({
                    trackerId: tracker._id,
                    date: todayStr,
                    completed: true
                });
            }

            await loadData();
        } catch (error) {
            console.error('Error toggling completion:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNumericChange = async (delta: number) => {
        if (!tracker._id) return;

        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];

            const currentValue = todayEntry?.numericValue || 0;
            const newValue = Math.max(0, currentValue + delta);

            await trackersApi.createOrUpdateEntry({
                trackerId: tracker._id,
                date: todayStr,
                numericValue: newValue
            });

            await loadData();
        } catch (error) {
            console.error('Error updating numeric value:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = () => {
        switch (tracker.type) {
            case 'binary': return 'check_circle';
            case 'numeric': return '123';
            case 'duration': return 'schedule';
            case 'frequency': return 'repeat';
            case 'scale': return 'sentiment_satisfied';
            case 'target': return 'flag';
            default: return 'track_changes';
        }
    };

    const getTypeLabel = () => {
        switch (tracker.type) {
            case 'binary': return `Binary • ${tracker.config.frequency || 'Daily'}`;
            case 'numeric': 
                return `Numeric • ${tracker.config.frequency || 'Daily'} target: ${tracker.config.targetValue || 0} ${tracker.config.unit || 'units'}`;
            case 'duration': 
                return `Duration • ${tracker.config.targetPeriod || 'Weekly'} target: ${tracker.config.targetDuration || 0} ${tracker.config.durationUnit || 'min'}`;
            case 'frequency': 
                return `Frequency • ${tracker.config.targetFrequency || 0}x per ${tracker.config.frequency || 'week'}`;
            case 'scale': 
                return `Scale • Rate ${tracker.config.scaleMin || 1}-${tracker.config.scaleMax || 10}`;
            case 'target': 
                return `Target • ${tracker.config.targetDays || 0} days per ${tracker.config.targetPeriod || 'week'}`;
            default: return tracker.type;
        }
    };

    const getHeatmapStatus = (dayIndex: number): 'completed' | 'partial' | 'missed' | 'none' => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const targetDate = new Date(startOfWeek);
        targetDate.setDate(startOfWeek.getDate() + dayIndex);

        // Don't show future days
        if (targetDate > today) return 'none';

        const entry = weekEntries.find(e => {
            const entryDate = new Date(e.date);
            return entryDate.getUTCDate() === targetDate.getUTCDate();
        });

        if (!entry) return 'missed';

        if (entry.skipped) return 'none';

        if (tracker.type === 'binary') {
            return entry.completed ? 'completed' : 'missed';
        } else if (tracker.type === 'numeric') {
            const target = tracker.config.targetValue || 0;
            const value = entry.numericValue || 0;
            if (value >= target) return 'completed';
            if (value > 0) return 'partial';
            return 'missed';
        } else if (tracker.type === 'duration') {
            const target = tracker.config.targetDuration || 0;
            const value = entry.durationValue || 0;
            if (value >= target) return 'completed';
            if (value > 0) return 'partial';
            return 'missed';
        } else if (tracker.type === 'scale') {
            return entry.scaleValue !== undefined ? 'completed' : 'missed';
        }

        return 'none';
    };

    const getProgressPercentage = () => {
        if (tracker.type === 'numeric' && todayEntry?.numericValue && tracker.config.targetValue) {
            return Math.min(100, (todayEntry.numericValue / tracker.config.targetValue) * 100);
        } else if (tracker.type === 'duration' && stats?.thisWeekCount && tracker.config.targetDuration) {
            // Simplified - would need to sum up actual durations
            return Math.min(100, (stats.thisWeekCount / 7) * 100);
        }
        return 0;
    };

    const renderActionButton = () => {
        if (tracker.type === 'binary') {
            return (
                <CompleteButton
                    $completed={todayEntry?.completed}
                    onClick={handleToggleComplete}
                    disabled={loading}
                >
                    <span className="material-symbols-outlined">check</span>
                    {todayEntry?.completed ? 'Completed!' : 'Mark Complete'}
                </CompleteButton>
            );
        } else if (tracker.type === 'numeric') {
            return (
                <NumericControls>
                    <NumericButton onClick={() => handleNumericChange(-1)} disabled={loading}>
                        <span className="material-symbols-outlined">remove</span>
                    </NumericButton>
                    <NumericValue>{todayEntry?.numericValue || 0}</NumericValue>
                    <NumericButton onClick={() => handleNumericChange(1)} disabled={loading}>
                        <span className="material-symbols-outlined">add</span>
                    </NumericButton>
                </NumericControls>
            );
        } else {
            return (
                <CompleteButton onClick={() => onViewHistory(tracker)}>
                    <span className="material-symbols-outlined">calendar_month</span>
                    Log Entry
                </CompleteButton>
            );
        }
    };

    return (
        <TrackerCardStyled>
            <TrackerCardHeader>
                <TrackerTitleSection>
                    <TrackerTitle>{tracker.name}</TrackerTitle>
                    <TrackerType>
                        <span className="material-symbols-outlined">{getTypeIcon()}</span>
                        {getTypeLabel()}
                    </TrackerType>
                </TrackerTitleSection>
                <TrackerActions>
                    <IconButton onClick={() => onEdit(tracker)}>
                        <span className="material-symbols-outlined">edit</span>
                    </IconButton>
                    <IconButton className="delete" onClick={() => onDelete(tracker._id!)}>
                        <span className="material-symbols-outlined">delete</span>
                    </IconButton>
                </TrackerActions>
            </TrackerCardHeader>

            {stats && (
                <TrackerStatsStyled>
                    <Stat>
                        <StatValue>{stats.currentStreak}</StatValue>
                        <StatLabel>Current</StatLabel>
                    </Stat>
                    <Stat>
                        <StatValue>{stats.longestStreak}</StatValue>
                        <StatLabel>Best</StatLabel>
                    </Stat>
                    <Stat>
                        <StatValue>{stats.completionRate}%</StatValue>
                        <StatLabel>Rate</StatLabel>
                    </Stat>
                </TrackerStatsStyled>
            )}

            {stats && stats.currentStreak > 0 && (
                <StreakBadge>
                    <span className="material-symbols-outlined">local_fire_department</span>
                    {stats.currentStreak} day streak
                </StreakBadge>
            )}

            {tracker.tags && tracker.tags.length > 0 && (
                <TrackerTags>
                    {tracker.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </TrackerTags>
            )}

            {(tracker.type === 'numeric' || tracker.type === 'duration') && (
                <ProgressSection>
                    <ProgressLabel>
                        {tracker.type === 'numeric' 
                            ? `Today: ${todayEntry?.numericValue || 0} / ${tracker.config.targetValue || 0} ${tracker.config.unit || 'units'}`
                            : 'Weekly Progress'
                        }
                    </ProgressLabel>
                    <ProgressBarContainer>
                        <ProgressBar $width={getProgressPercentage()} />
                    </ProgressBarContainer>
                </ProgressSection>
            )}

            <Heatmap>
                {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                    <HeatmapDay 
                        key={dayIndex} 
                        $status={getHeatmapStatus(dayIndex)}
                        onClick={() => onViewHistory(tracker)}
                        title={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex]}
                    />
                ))}
            </Heatmap>

            <ActionSection>
                {renderActionButton()}
                <SecondaryButton onClick={() => onViewHistory(tracker)}>
                    <span className="material-symbols-outlined">history</span>
                </SecondaryButton>
            </ActionSection>
        </TrackerCardStyled>
    );
};

export default TrackerCard;