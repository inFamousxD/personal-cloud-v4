import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    database: 'connected' | 'disconnected';
    uptime: number;
}

export interface ServerStats {
    system: {
        platform: string;
        arch: string;
        hostname: string;
        uptime: number;
        totalMemory: number;
        freeMemory: number;
        usedMemory: number;
        memoryUsagePercent: string;
        cpuCount: number;
        cpuModel: string;
        cpuUsagePercent: number;
    };
    process: {
        uptime: number;
        memoryUsage: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
            external: number;
        };
        nodeVersion: string;
    };
    database: {
        collections: number;
        dataSize: number;
        storageSize: number;
        indexes: number;
        indexSize: number;
    } | null;
}

export interface PingResponse {
    pong: boolean;
    timestamp: string;
    responseTime: number;
}

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

// Create axios instance with interceptor
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

export const serverApi = {
    getHealth: async (): Promise<HealthResponse> => {
        const response = await apiClient.get(`${API_URL}/api/server/health`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getStats: async (): Promise<ServerStats> => {
        const response = await apiClient.get(`${API_URL}/api/server/stats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    ping: async (): Promise<PingResponse> => {
        const start = Date.now();
        const response = await apiClient.get(`${API_URL}/api/server/ping`, {
            headers: getAuthHeader(),
        });
        return {
            ...response.data,
            responseTime: Date.now() - start
        };
    },
};