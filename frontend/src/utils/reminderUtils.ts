import { NoteReminder } from '../services/notesApi';

export interface ReminderFormData {
    dateTime: Date;
    isRecurring: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
    endDate?: Date;
}

/**
 * Generate ID for a reminder
 */
export const generateReminderId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate reminder form data
 */
export const validateReminderForm = (data: ReminderFormData): string | null => {
    if (!data.dateTime) {
        return 'Date and time are required';
    }

    const now = new Date();
    if (data.dateTime <= now) {
        return 'Reminder must be in the future';
    }

    if (data.isRecurring) {
        if (!data.frequency) {
            return 'Frequency is required for recurring reminders';
        }

        if (!data.interval || data.interval < 1) {
            return 'Interval must be at least 1';
        }

        if (!data.endDate) {
            return 'End date is required for recurring reminders';
        }

        if (data.endDate <= data.dateTime) {
            return 'End date must be after start date';
        }

        const maxEndDate = new Date(data.dateTime);
        maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
        if (data.endDate > maxEndDate) {
            return 'End date cannot be more than 12 months from start date';
        }

        if (data.frequency === 'weekly' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
            return 'At least one day must be selected for weekly reminders';
        }
    }

    return null;
};

/**
 * Create a single reminder from form data
 */
export const createReminder = (data: ReminderFormData): NoteReminder => {
    const reminder: NoteReminder = {
        id: generateReminderId(),
        enabled: true,
        dateTime: data.dateTime,
        isRecurring: data.isRecurring,
        lastModified: new Date()
    };

    if (data.isRecurring && data.frequency && data.interval && data.endDate) {
        reminder.recurringPattern = {
            frequency: data.frequency,
            interval: data.interval,
            endDate: data.endDate
        };

        if (data.frequency === 'weekly' && data.daysOfWeek) {
            reminder.recurringPattern.daysOfWeek = data.daysOfWeek;
        }
    }

    return reminder;
};

/**
 * Calculate the next occurrence date for a recurring reminder
 */
export const getNextOccurrence = (
    currentDate: Date,
    frequency: 'daily' | 'weekly' | 'monthly',
    interval: number,
    daysOfWeek?: number[]
): Date => {
    const nextDate = new Date(currentDate);

    switch (frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + interval);
            break;

        case 'weekly':
            if (daysOfWeek && daysOfWeek.length > 0) {
                const currentDay = currentDate.getDay();
                const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
                
                // Find next day in current week
                let nextDay = sortedDays.find(day => day > currentDay);
                
                if (nextDay !== undefined) {
                    const daysToAdd = nextDay - currentDay;
                    nextDate.setDate(nextDate.getDate() + daysToAdd);
                } else {
                    // Next occurrence is in next cycle
                    const daysToAdd = (7 * interval) - currentDay + sortedDays[0];
                    nextDate.setDate(nextDate.getDate() + daysToAdd);
                }
            } else {
                nextDate.setDate(nextDate.getDate() + (7 * interval));
            }
            break;

        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + interval);
            break;
    }

    return nextDate;
};

/**
 * Preview how many reminders will be created for recurring pattern
 */
export const countRecurringReminders = (data: ReminderFormData): number => {
    if (!data.isRecurring || !data.frequency || !data.interval || !data.endDate) {
        return 1;
    }

    let count = 0;
    let currentDate = new Date(data.dateTime);
    const endDate = new Date(data.endDate);

    while (currentDate <= endDate) {
        if (data.frequency === 'weekly' && data.daysOfWeek && data.daysOfWeek.length > 0) {
            // For weekly with multiple days, count each selected day
            const sortedDays = [...data.daysOfWeek].sort((a, b) => a - b);
            const currentDay = currentDate.getDay();
            
            // Count remaining days in current week
            const remainingDays = sortedDays.filter(day => day >= currentDay);
            count += remainingDays.length;

            // Move to next cycle
            if (remainingDays.length > 0) {
                const lastDay = remainingDays[remainingDays.length - 1];
                const daysToAdd = (7 * data.interval) - lastDay + sortedDays[0];
                currentDate.setDate(currentDate.getDate() + daysToAdd);
            } else {
                currentDate.setDate(currentDate.getDate() + (7 * data.interval));
            }
        } else {
            count++;
            currentDate = getNextOccurrence(currentDate, data.frequency, data.interval, data.daysOfWeek);
        }

        // Safety limit
        if (count > 1000) {
            break;
        }
    }

    return count;
};

/**
 * Format reminder for display
 */
export const formatReminderDisplay = (reminder: NoteReminder): string => {
    const date = new Date(reminder.dateTime);
    const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });

    if (!reminder.isRecurring) {
        return `${dateStr} at ${timeStr}`;
    }

    const pattern = reminder.recurringPattern!;
    let frequency = '';
    
    if (pattern.frequency === 'daily') {
        frequency = pattern.interval === 1 ? 'Daily' : `Every ${pattern.interval} days`;
    } else if (pattern.frequency === 'weekly') {
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            const days = pattern.daysOfWeek
                .map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                .join(', ');
            frequency = pattern.interval === 1 
                ? `Weekly on ${days}` 
                : `Every ${pattern.interval} weeks on ${days}`;
        } else {
            frequency = pattern.interval === 1 ? 'Weekly' : `Every ${pattern.interval} weeks`;
        }
    } else if (pattern.frequency === 'monthly') {
        frequency = pattern.interval === 1 ? 'Monthly' : `Every ${pattern.interval} months`;
    }

    return `${frequency} at ${timeStr} (until ${new Date(pattern.endDate).toLocaleDateString()})`;
};

/**
 * Check if a reminder can be reactivated
 */
export const canReactivateReminder = (reminder: NoteReminder): boolean => {
    if (reminder.enabled) return false;
    if (!reminder.completedAt) return false;
    
    const now = new Date();
    const reminderDate = new Date(reminder.dateTime);
    
    // Can always reactivate if it's in the future
    if (reminderDate > now) return true;
    
    // Can reactivate past reminders (will need new date)
    return true;
};