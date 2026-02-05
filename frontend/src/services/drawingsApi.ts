import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface DrawingImage {
    id: string;
    created: number;
    dataURL?: string;
    storedPath?: string;
    mimeType: string;
}

export interface DrawingSceneData {
    elements: any[];
    appState: any;
    files?: {
        [fileId: string]: DrawingImage;
    };
}

export interface Drawing {
    _id?: string;
    userId: string;
    title: string;
    sceneData: DrawingSceneData;
    folderId?: string | null;
    thumbnail?: string;
    collaborators?: string[];
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

export interface CreateDrawingInput {
    title: string;
    sceneData?: DrawingSceneData;
    folderId?: string | null;
}

export interface UpdateDrawingInput {
    title?: string;
    sceneData?: DrawingSceneData;
    folderId?: string | null;
    thumbnail?: string;
}

export interface CreateFolderInput {
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

export const drawingsApi = {
    // Drawing CRUD operations
    getAllDrawings: async (): Promise<Drawing[]> => {
        const response = await apiClient.get(`${API_URL}/api/drawings`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getDrawingById: async (id: string): Promise<Drawing> => {
        const response = await apiClient.get(`${API_URL}/api/drawings/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createDrawing: async (drawing: CreateDrawingInput): Promise<Drawing> => {
        const response = await apiClient.post(`${API_URL}/api/drawings`, drawing, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateDrawing: async (id: string, drawing: UpdateDrawingInput): Promise<Drawing> => {
        const response = await apiClient.put(`${API_URL}/api/drawings/${id}`, drawing, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteDrawing: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/drawings/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // Image operations
    uploadImage: async (drawingId: string, file: File): Promise<{ imageId: string; url: string; mimeType: string }> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post(
            `${API_URL}/api/drawings/${drawingId}/images`,
            formData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    getImageUrl: (drawingId: string, imageId: string): string => {
        const user = localStorage.getItem('user');
        if (!user) return '';
        const { token } = JSON.parse(user);
        return `${API_URL}/api/drawings/${drawingId}/images/${imageId}?token=${token}`;
    },

    deleteImage: async (drawingId: string, imageId: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/drawings/${drawingId}/images/${imageId}`, {
            headers: getAuthHeader(),
        });
    },

    // Folder operations
    getAllFolders: async (): Promise<Folder[]> => {
        const response = await apiClient.get(`${API_URL}/api/drawings/folders/all`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createFolder: async (folder: CreateFolderInput): Promise<Folder> => {
        const response = await apiClient.post(`${API_URL}/api/drawings/folders`, folder, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    deleteFolder: async (id: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/api/drawings/folders/${id}`, {
            headers: getAuthHeader(),
        });
    },
};