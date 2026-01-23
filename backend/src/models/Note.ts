import { ObjectId } from 'mongodb';

export interface NoteReminder {
    id: string;
    enabled: boolean;
    dateTime: Date;
    isRecurring: boolean;
    recurringPattern?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;              // e.g., every 2 days, every 3 weeks
        daysOfWeek?: number[];         // For weekly: [0,1,2] = Sun, Mon, Tue
        endDate: Date;                 // Max 12 months from creation
    };
    completedAt?: Date;
    lastModified: Date;
}

export interface Note {
    _id?: ObjectId;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    reminders: NoteReminder[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNoteInput {
    title: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
}

export interface UpdateNoteInput {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
    reminders?: NoteReminder[];
}

export interface PushSubscription {
    _id?: ObjectId;
    userId: string;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    createdAt: Date;
}