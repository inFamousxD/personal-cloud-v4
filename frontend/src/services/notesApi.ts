import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface NoteReminder {
    id: string;
    enabled: boolean;
    dateTime: Date;
    isRecurring: boolean;
    recurringPattern?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        daysOfWeek?: number[];
        endDate: Date;
    };
    completedAt?: Date;
    lastModified: Date;
}

export interface Note {
    _id?: string;
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
    content: string;
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

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

// Create axios instance with interceptor for handling auth errors
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

export const notesApi = {
    getAllNotes: async (): Promise<Note[]> => {
        const response = await apiClient.get(`${API_URL}/api/notes`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getAllTags: async (): Promise<string[]> => {
        const response = await apiClient.get(`${API_URL}/api/notes/tags`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getNoteById: async (id: string): Promise<Note> => {
        const response = await apiClient.get(`${API_URL}/api/notes/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createNote: async (note: CreateNoteInput): Promise<Note> => {
        const response = await apiClient.post(`${API_URL}/api/notes`, note, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateNote: async (id: string, note: UpdateNoteInput): Promise<Note> => {
        const response = await apiClient.put(`${API_URL}/api/notes/${id}`, note, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteNote: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/notes/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Reminder-specific endpoints
    addReminder: async (noteId: string, reminder: NoteReminder): Promise<Note> => {
        const response = await apiClient.post(
            `${API_URL}/api/notes/${noteId}/reminders`,
            reminder,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    updateReminder: async (noteId: string, reminderId: string, updates: Partial<NoteReminder>): Promise<Note> => {
        const response = await apiClient.put(
            `${API_URL}/api/notes/${noteId}/reminders/${reminderId}`,
            updates,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    deleteReminder: async (noteId: string, reminderId: string): Promise<Note> => {
        const response = await apiClient.delete(
            `${API_URL}/api/notes/${noteId}/reminders/${reminderId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },
};