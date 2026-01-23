import cron from 'node-cron';
import { db } from '../db.js';
import { Note, NoteReminder } from '../models/Note.js';
import { pushService } from './pushService.js';

export class NotificationScheduler {
    private task: cron.ScheduledTask | null = null;

    /**
     * Start the scheduler - runs every minute
     */
    start() {
        if (this.task) {
            console.log('Notification scheduler already running');
            return;
        }

        // Run every minute
        this.task = cron.schedule('* * * * *', async () => {
            await this.checkAndSendNotifications();
        });

        console.log('Notification scheduler started - checking every minute');
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
            console.log('Notification scheduler stopped');
        }
    }

    /**
     * Check for due reminders and send notifications
     */
    private async checkAndSendNotifications() {
        try {
            const now = new Date();
            const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());

            // Find all notes with active reminders
            const notes = await db.collection<Note>('notes')
                .find({ 'reminders.enabled': true })
                .toArray();

            console.log(`[Scheduler ${currentMinute.toISOString()}] Found ${notes.length} notes with enabled reminders`);

            for (const note of notes) {
                for (const reminder of note.reminders) {
                    if (!reminder.enabled) continue;

                    const reminderTime = new Date(reminder.dateTime);
                    const reminderMinute = new Date(
                        reminderTime.getFullYear(),
                        reminderTime.getMonth(),
                        reminderTime.getDate(),
                        reminderTime.getHours(),
                        reminderTime.getMinutes()
                    );

                    // Check if this reminder should fire now
                    if (currentMinute.getTime() === reminderMinute.getTime()) {
                        console.log(`[Scheduler] Firing reminder ${reminder.id} for note ${note._id}, user ${note.userId}`);
                        await this.sendReminderNotification(note, reminder);
                        await this.handleReminderAfterFiring(note, reminder);
                    }
                }
            }
        } catch (error) {
            console.error('Error in notification scheduler:', error);
        }
    }

    /**
     * Send notification for a reminder
     */
    private async sendReminderNotification(note: Note, reminder: NoteReminder) {
        try {
            await pushService.sendNotification(note.userId, {
                title: '🔔 Reminder',
                body: note.title || 'Untitled Note',
                tag: `reminder-${note._id}-${reminder.id}`,
                noteId: note._id!.toString(),
                reminderId: reminder.id,
                data: {
                    url: `/notes?view=${note._id}`
                }
            });

            console.log(`[Scheduler] Sent reminder notification for note ${note._id}, reminder ${reminder.id}`);
        } catch (error) {
            console.error('[Scheduler] Error sending reminder notification:', error);
        }
    }

    /**
     * Handle reminder after it fires
     * - For non-recurring: mark as completed
     * - For recurring: generate next reminder
     */
    private async handleReminderAfterFiring(note: Note, reminder: NoteReminder) {
        try {
            if (!reminder.isRecurring) {
                // Mark as completed
                await db.collection<Note>('notes').updateOne(
                    { _id: note._id, 'reminders.id': reminder.id },
                    {
                        $set: {
                            'reminders.$.enabled': false,
                            'reminders.$.completedAt': new Date()
                        }
                    }
                );
                console.log(`[Scheduler] Marked non-recurring reminder ${reminder.id} as completed`);
            } else {
                // Generate next reminder
                const nextReminder = this.generateNextReminder(reminder);
                
                if (nextReminder) {
                    // Add next reminder to the array
                    await db.collection<Note>('notes').updateOne(
                        { _id: note._id },
                        { $push: { reminders: nextReminder } }
                    );

                    // Mark current as completed
                    await db.collection<Note>('notes').updateOne(
                        { _id: note._id, 'reminders.id': reminder.id },
                        {
                            $set: {
                                'reminders.$.enabled': false,
                                'reminders.$.completedAt': new Date()
                            }
                        }
                    );
                    console.log(`[Scheduler] Generated next recurring reminder for ${reminder.id}, next: ${nextReminder.dateTime}`);
                } else {
                    // Recurring ended, mark as completed
                    await db.collection<Note>('notes').updateOne(
                        { _id: note._id, 'reminders.id': reminder.id },
                        {
                            $set: {
                                'reminders.$.enabled': false,
                                'reminders.$.completedAt': new Date()
                            }
                        }
                    );
                    console.log(`[Scheduler] Recurring reminder ${reminder.id} ended`);
                }
            }
        } catch (error) {
            console.error('[Scheduler] Error handling reminder after firing:', error);
        }
    }

    /**
     * Generate the next reminder in a recurring series
     */
    private generateNextReminder(reminder: NoteReminder): NoteReminder | null {
        if (!reminder.recurringPattern) return null;

        const { frequency, interval, daysOfWeek, endDate } = reminder.recurringPattern;
        const currentDate = new Date(reminder.dateTime);
        let nextDate = new Date(currentDate);

        switch (frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + interval);
                break;

            case 'weekly':
                if (daysOfWeek && daysOfWeek.length > 0) {
                    // Find next day of week
                    const currentDay = currentDate.getDay();
                    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
                    
                    // Find next day in the same week
                    let nextDay = sortedDays.find(day => day > currentDay);
                    
                    if (nextDay !== undefined) {
                        // Next occurrence is in the same week
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

        // Check if next date exceeds end date
        if (nextDate > new Date(endDate)) {
            return null;
        }

        // Create new reminder
        return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            enabled: true,
            dateTime: nextDate,
            isRecurring: true,
            recurringPattern: reminder.recurringPattern,
            lastModified: new Date()
        };
    }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();