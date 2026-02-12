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

const affineApi = {
    getStatus: async (): Promise<AffineStatus> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/affine/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getStats: async (): Promise<AffineStats> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/affine/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    start: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/affine/start`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    stop: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/affine/stop`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    restart: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/affine/restart`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    clearCache: async (): Promise<CacheClearResult> => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/api/affine/clear-cache`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getLogs: async (lines: number = 100) => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/affine/logs`, {
            params: { lines },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default affineApi;
