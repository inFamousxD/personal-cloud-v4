import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatRequest {
    model?: string;
    messages: Message[];
    stream?: boolean;
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
                console.error('Authentication failed');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
    
    return client;
};

const apiClient = createApiClient();

export const agentApi = {
    streamChat: async (
        request: ChatRequest,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void,
        abortController?: AbortController
    ) => {
        try {
            const authHeaders = getAuthHeader();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(authHeaders.Authorization && { Authorization: authHeaders.Authorization }),
            };

            const response = await fetch(`${API_URL}/api/agent/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ ...request, stream: true }),
                signal: abortController?.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    onComplete();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                
                // Keep the last incomplete line in buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            onChunk(json.message.content);
                        }
                        if (json.done) {
                            onComplete();
                            return;
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                onError(error);
            }
        }
    },

    getModels: async () => {
        const response = await apiClient.get(`${API_URL}/api/agent/models`, {
            headers: getAuthHeader(),
        });
        return response.data.models || [];
    },

    checkHealth: async () => {
        const response = await apiClient.get(`${API_URL}/api/agent/health`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },
};