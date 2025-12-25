import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface ListItem {
    id: string;
    text: string;
    checked: boolean;
    isComplex: boolean;
    details?: string;
    detailsExpanded?: boolean;
}

export interface List {
    _id?: string;
    userId: string;
    folderId: string | null;
    title: string;
    items: ListItem[];
    tags: string[];
    shareId?: string;
    shareMode?: 'none' | 'read-only' | 'read-write';
    createdAt: Date;
    updatedAt: Date;
}

export interface ListFolder {
    _id?: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateListInput {
    folderId?: string | null;
    title: string;
    items?: ListItem[];
    tags?: string[];
}

export interface UpdateListInput {
    folderId?: string | null;
    title?: string;
    items?: ListItem[];
    tags?: string[];
}

export interface ShareListInput {
    shareMode: 'read-only' | 'read-write';
}

export interface CreateListFolderInput {
    name: string;
}

export interface UpdateListFolderInput {
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

export const listsApi = {
    // Folder operations
    getAllFolders: async (): Promise<ListFolder[]> => {
        const response = await apiClient.get(`${API_URL}/api/lists/folders`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createFolder: async (folder: CreateListFolderInput): Promise<ListFolder> => {
        const response = await apiClient.post(`${API_URL}/api/lists/folders`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateFolder: async (id: string, folder: UpdateListFolderInput): Promise<ListFolder> => {
        const response = await apiClient.put(`${API_URL}/api/lists/folders/${id}`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteFolder: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/lists/folders/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // List operations
    getAllLists: async (): Promise<List[]> => {
        const response = await apiClient.get(`${API_URL}/api/lists`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getAllTags: async (): Promise<string[]> => {
        const response = await apiClient.get(`${API_URL}/api/lists/tags`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getListById: async (id: string): Promise<List> => {
        const response = await apiClient.get(`${API_URL}/api/lists/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createList: async (list: CreateListInput): Promise<List> => {
        const response = await apiClient.post(`${API_URL}/api/lists`, list, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateList: async (id: string, list: UpdateListInput): Promise<List> => {
        const response = await apiClient.put(`${API_URL}/api/lists/${id}`, list, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteList: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/lists/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Sharing operations
    enableSharing: async (id: string, shareMode: 'read-only' | 'read-write'): Promise<List> => {
        const response = await apiClient.post(`${API_URL}/api/lists/${id}/share`, 
            { shareMode },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    updateShareMode: async (id: string, shareMode: 'read-only' | 'read-write'): Promise<List> => {
        const response = await apiClient.put(`${API_URL}/api/lists/${id}/share`, 
            { shareMode },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    disableSharing: async (id: string): Promise<List> => {
        const response = await apiClient.delete(`${API_URL}/api/lists/${id}/share`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Shared list operations (no auth required)
    getSharedList: async (shareId: string): Promise<List> => {
        const response = await axios.get(`${API_URL}/api/lists/shared/${shareId}`);
        return response.data;
    },

    updateSharedList: async (shareId: string, list: UpdateListInput): Promise<List> => {
        const response = await axios.put(`${API_URL}/api/lists/shared/${shareId}`, list);
        return response.data;
    },
};