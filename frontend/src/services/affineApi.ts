import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export interface AffineStatus {
    running: boolean;
    containers: Array<{
        name: string;
        state: string;
        status: string;
    }>;
    totalContainers: number;
    runningContainers: number;
}

export interface AffineContainerStats {
    containerId: string;
    name: string;
    cpuPercent: string;
    memUsage: string;
    memLimit: string;
    memPercent: string;
    netIO: string;
    blockIO: string;
}

export interface AffineStats {
    running: boolean;
    containers: AffineContainerStats[];
    timestamp: string;
}

export interface CacheClearResult {
    success: boolean;
    message: string;
    before: string;
    after: string;
}

// Helper function to get auth header - matches notesApi.ts pattern
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

const affineApi = {
    getStatus: async (): Promise<AffineStatus> => {
        const response = await apiClient.get(`${API_URL}/api/affine/status`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getStats: async (): Promise<AffineStats> => {
        const response = await apiClient.get(`${API_URL}/api/affine/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    start: async () => {
        const response = await apiClient.post(`${API_URL}/api/affine/start`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    stop: async () => {
        const response = await apiClient.post(`${API_URL}/api/affine/stop`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    restart: async () => {
        const response = await apiClient.post(`${API_URL}/api/affine/restart`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    clearCache: async (): Promise<CacheClearResult> => {
        const response = await apiClient.post(`${API_URL}/api/affine/clear-cache`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getLogs: async (lines: number = 100) => {
        const response = await apiClient.get(`${API_URL}/api/affine/logs`, {
            params: { lines },
            headers: getAuthHeader()
        });
        return response.data;
    }
};

export default affineApi;