import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Journal {
    _id?: string;
    userId: string;
    folderId: string | null;
    title: string;
    subtitle: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Folder {
    _id?: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateJournalInput {
    folderId?: string | null;
    title: string;
    subtitle?: string;
    content: string;
}

export interface UpdateJournalInput {
    folderId?: string | null;
    title?: string;
    subtitle?: string;
    content?: string;
}

export interface CreateFolderInput {
    name: string;
}

export interface UpdateFolderInput {
    name: string;
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

export const journalsApi = {
    // Folder operations
    getAllFolders: async (): Promise<Folder[]> => {
        const response = await apiClient.get(`${API_URL}/api/journals/folders`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createFolder: async (folder: CreateFolderInput): Promise<Folder> => {
        const response = await apiClient.post(`${API_URL}/api/journals/folders`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateFolder: async (id: string, folder: UpdateFolderInput): Promise<Folder> => {
        const response = await apiClient.put(`${API_URL}/api/journals/folders/${id}`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteFolder: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/journals/folders/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Journal operations
    getAllJournals: async (): Promise<Journal[]> => {
        const response = await apiClient.get(`${API_URL}/api/journals`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getJournalById: async (id: string): Promise<Journal> => {
        const response = await apiClient.get(`${API_URL}/api/journals/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createJournal: async (journal: CreateJournalInput): Promise<Journal> => {
        const response = await apiClient.post(`${API_URL}/api/journals`, journal, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateJournal: async (id: string, journal: UpdateJournalInput): Promise<Journal> => {
        const response = await apiClient.put(`${API_URL}/api/journals/${id}`, journal, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteJournal: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/journals/${id}`, {
            headers: getAuthHeader(),
        });
    },
};