import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Note {
    _id?: string;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
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

    // Add response interceptor to handle auth errors
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            // If we get 401 or 403, the token is invalid/expired
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.error('Authentication failed - token invalid or expired');
                // Clear invalid token from storage
                localStorage.removeItem('user');
                // Redirect to login
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
};