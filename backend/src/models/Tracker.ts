import { ObjectId } from 'mongodb';

// Tracker types
export type TrackerType = 'binary' | 'numeric' | 'duration' | 'frequency' | 'scale' | 'target';

// Base tracker interface
export interface Tracker {
    _id?: ObjectId;
    userId: string;
    folderId: string | null;
    name: string;
    description?: string;
    type: TrackerType;
    tags: string[];
    config: TrackerConfig;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Configuration for different tracker types
export interface TrackerConfig {
    // For numeric trackers
    unit?: string; // e.g., "glasses", "pages", "km"
    targetValue?: number; // e.g., 8 glasses per day
    
    // For duration trackers
    durationUnit?: 'minutes' | 'hours'; // e.g., "minutes"
    targetDuration?: number; // e.g., 150 minutes per week
    
    // For frequency trackers
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetFrequency?: number; // e.g., 3 times per week
    
    // For scale trackers
    scaleMin?: number; // e.g., 1
    scaleMax?: number; // e.g., 10
    scaleLabels?: string[]; // e.g., ["Poor", "Fair", "Good", "Excellent"]
    
    // For target trackers
    targetDays?: number; // e.g., 5 days per week
    targetPeriod?: 'week' | 'month';
    
    // Common settings
    allowNotes?: boolean; // Allow notes when logging entries
    reminderTime?: string; // e.g., "09:00" for reminder notifications
}

// Entry for tracking data (historical records)
export interface TrackerEntry {
    _id?: ObjectId;
    trackerId: string;
    userId: string;
    date: Date; // The date this entry is for (normalized to start of day)
    timestamp: Date; // When this entry was created/modified
    
    // Different value types based on tracker type
    completed?: boolean; // For binary trackers
    numericValue?: number; // For numeric trackers
    durationValue?: number; // For duration trackers (in minutes)
    scaleValue?: number; // For scale trackers
    
    // Additional metadata
    note?: string; // Optional note for this entry
    skipped?: boolean; // User intentionally skipped this day
    
    createdAt: Date;
    updatedAt: Date;
}

// Folder for organizing trackers
export interface TrackerFolder {
    _id?: ObjectId;
    userId: string;
    name: string;
    color?: string; // Optional color for visual distinction
    icon?: string; // Optional icon name
    createdAt: Date;
    updatedAt: Date;
}

// Input types for creating/updating
export interface CreateTrackerInput {
    folderId?: string | null;
    name: string;
    description?: string;
    type: TrackerType;
    tags?: string[];
    config: TrackerConfig;
}

export interface UpdateTrackerInput {
    folderId?: string | null;
    name?: string;
    description?: string;
    tags?: string[];
    config?: TrackerConfig;
    isActive?: boolean;
}

export interface CreateTrackerEntryInput {
    trackerId: string;
    date: string; // ISO date string (YYYY-MM-DD)
    completed?: boolean;
    numericValue?: number;
    durationValue?: number;
    scaleValue?: number;
    note?: string;
    skipped?: boolean;
}

export interface UpdateTrackerEntryInput {
    completed?: boolean;
    numericValue?: number;
    durationValue?: number;
    scaleValue?: number;
    note?: string;
    skipped?: boolean;
}

export interface CreateTrackerFolderInput {
    name: string;
    color?: string;
    icon?: string;
}

export interface UpdateTrackerFolderInput {
    name?: string;
    color?: string;
    icon?: string;
}

// Statistics and analytics types
export interface TrackerStats {
    trackerId: string;
    currentStreak: number;
    longestStreak: number;
    totalEntries: number;
    completionRate: number; // Percentage
    averageValue?: number; // For numeric/duration/scale trackers
    lastEntry?: Date;
    thisWeekCount?: number;
    thisMonthCount?: number;
}

export interface TrackerEntryQuery {
    trackerId: string;
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
    limit?: number;
    skip?: number;
}