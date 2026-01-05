import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Types
export type TrackerType = 'binary' | 'numeric' | 'duration' | 'frequency' | 'scale' | 'target';

export interface TrackerConfig {
    unit?: string;
    targetValue?: number;
    durationUnit?: 'minutes' | 'hours';
    targetDuration?: number;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetFrequency?: number;
    scaleMin?: number;
    scaleMax?: number;
    scaleLabels?: string[];
    targetDays?: number;
    targetPeriod?: 'week' | 'month';
    allowNotes?: boolean;
    reminderTime?: string;
}

export interface Tracker {
    _id?: string;
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

export interface TrackerEntry {
    _id?: string;
    trackerId: string;
    userId: string;
    date: Date;
    timestamp: Date;
    completed?: boolean;
    numericValue?: number;
    durationValue?: number;
    scaleValue?: number;
    note?: string;
    skipped?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TrackerFolder {
    _id?: string;
    userId: string;
    name: string;
    color?: string;
    icon?: string;
    createdAt: Date;
    updatedAt: Date;
}

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
    date: string;
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

export interface TrackerStats {
    trackerId: string;
    currentStreak: number;
    longestStreak: number;
    totalEntries: number;
    completionRate: number;
    averageValue?: number;
    lastEntry?: Date;
    thisWeekCount?: number;
    thisMonthCount?: number;
}

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

const createApiClient = () => {
    const client = axios.create();

    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.error('Authentication failed - token invalid or expired');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const apiClient = createApiClient();

export const trackersApi = {
    // Folder operations
    getAllFolders: async (): Promise<TrackerFolder[]> => {
        const response = await apiClient.get(`${API_URL}/api/trackers/folders`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createFolder: async (folder: CreateTrackerFolderInput): Promise<TrackerFolder> => {
        const response = await apiClient.post(`${API_URL}/api/trackers/folders`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateFolder: async (id: string, folder: UpdateTrackerFolderInput): Promise<TrackerFolder> => {
        const response = await apiClient.put(`${API_URL}/api/trackers/folders/${id}`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteFolder: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/trackers/folders/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Tracker operations
    getAllTrackers: async (active?: boolean): Promise<Tracker[]> => {
        const params = active !== undefined ? { active: active.toString() } : {};
        const response = await apiClient.get(`${API_URL}/api/trackers`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    },

    getAllTags: async (): Promise<string[]> => {
        const response = await apiClient.get(`${API_URL}/api/trackers/tags`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getTrackerById: async (id: string): Promise<Tracker> => {
        const response = await apiClient.get(`${API_URL}/api/trackers/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createTracker: async (tracker: CreateTrackerInput): Promise<Tracker> => {
        const response = await apiClient.post(`${API_URL}/api/trackers`, tracker, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateTracker: async (id: string, tracker: UpdateTrackerInput): Promise<Tracker> => {
        const response = await apiClient.put(`${API_URL}/api/trackers/${id}`, tracker, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteTracker: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/trackers/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Entry operations
    getEntries: async (
        trackerId: string,
        params?: {
            startDate?: string;
            endDate?: string;
            limit?: number;
            skip?: number;
        }
    ): Promise<TrackerEntry[]> => {
        const response = await apiClient.get(`${API_URL}/api/trackers/${trackerId}/entries`, {
            headers: getAuthHeader(),
            params,
        });
        return response.data;
    },

    getEntryByDate: async (trackerId: string, date: string): Promise<TrackerEntry> => {
        const response = await apiClient.get(`${API_URL}/api/trackers/${trackerId}/entries/${date}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createOrUpdateEntry: async (entry: CreateTrackerEntryInput): Promise<TrackerEntry> => {
        const response = await apiClient.post(
            `${API_URL}/api/trackers/${entry.trackerId}/entries`,
            entry,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    },

    updateEntry: async (
        trackerId: string,
        entryId: string,
        entry: UpdateTrackerEntryInput
    ): Promise<TrackerEntry> => {
        const response = await apiClient.put(
            `${API_URL}/api/trackers/${trackerId}/entries/${entryId}`,
            entry,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    },

    deleteEntry: async (trackerId: string, entryId: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/trackers/${trackerId}/entries/${entryId}`, {
            headers: getAuthHeader(),
        });
    },

    // Statistics
    getStats: async (trackerId: string): Promise<TrackerStats> => {
        const response = await apiClient.get(`${API_URL}/api/trackers/${trackerId}/stats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },
};