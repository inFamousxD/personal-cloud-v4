import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Note {
    _id?: string;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNoteInput {
    title: string;
    content: string;
    tags?: string[];
}

export interface UpdateNoteInput {
    title?: string;
    content?: string;
    tags?: string[];
}

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

export const notesApi = {
    getAllNotes: async (): Promise<Note[]> => {
        const response = await axios.get(`${API_URL}/api/notes`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getAllTags: async (): Promise<string[]> => {
        const response = await axios.get(`${API_URL}/api/notes/tags`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getNoteById: async (id: string): Promise<Note> => {
        const response = await axios.get(`${API_URL}/api/notes/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createNote: async (note: CreateNoteInput): Promise<Note> => {
        const response = await axios.post(`${API_URL}/api/notes`, note, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateNote: async (id: string, note: UpdateNoteInput): Promise<Note> => {
        const response = await axios.put(`${API_URL}/api/notes/${id}`, note, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteNote: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/api/notes/${id}`, {
            headers: getAuthHeader(),
        });
    },
};