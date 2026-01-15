import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface Chat {
    _id: string;
    userId: string;
    title: string;
    systemPrompt?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatWithMessages {
    chat: Chat;
    messages: Message[];
}

export interface ChatRequest {
    model?: string;
    messages: Message[];
    stream?: boolean;
    chatId?: string;
    contextLimit?: number;
}

export interface AgentSettings {
    _id?: string;
    userId: string;
    defaultSystemPrompt: string;
    updatedAt: Date;
}

export interface GenerateNoteRequest {
    transcription: string;
    model?: string;
}

export interface GenerateNoteResponse {
    title: string;
    content: string;
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
    // Settings
    getSettings: async (): Promise<AgentSettings> => {
        const response = await apiClient.get(`${API_URL}/api/agent/settings`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    updateSettings: async (settings: Partial<AgentSettings>): Promise<AgentSettings> => {
        const response = await apiClient.put(
            `${API_URL}/api/agent/settings`,
            settings,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Active sessions
    getActiveSessions: async (): Promise<{ count: number; hasSessions: boolean }> => {
        const response = await apiClient.get(`${API_URL}/api/agent/active-sessions`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // Generate note from transcription
    generateNote: async (request: GenerateNoteRequest): Promise<GenerateNoteResponse> => {
        const response = await apiClient.post(
            `${API_URL}/api/agent/generate-note`,
            request,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    // Chat streaming
    streamChat: async (
        request: ChatRequest,
        onChunk: (chunk: string, chatId?: string) => void,
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

            const chatId = response.headers.get('X-Chat-Id');

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
                
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            onChunk(json.message.content, json.chatId || chatId || undefined);
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

    stopStream: async (streamId: string) => {
        const response = await apiClient.post(
            `${API_URL}/api/agent/chat/stop`,
            { streamId },
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    getAllChats: async (): Promise<Chat[]> => {
        const response = await apiClient.get(`${API_URL}/api/agent/chats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    getChat: async (chatId: string): Promise<ChatWithMessages> => {
        const response = await apiClient.get(`${API_URL}/api/agent/chats/${chatId}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    createChat: async (): Promise<Chat> => {
        const response = await apiClient.post(
            `${API_URL}/api/agent/chats`,
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    updateChat: async (chatId: string, updates: { title?: string; systemPrompt?: string }): Promise<Chat> => {
        const response = await apiClient.patch(
            `${API_URL}/api/agent/chats/${chatId}`,
            updates,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    updateChatTitle: async (chatId: string, title: string): Promise<Chat> => {
        return agentApi.updateChat(chatId, { title });
    },

    deleteChat: async (chatId: string) => {
        const response = await apiClient.delete(`${API_URL}/api/agent/chats/${chatId}`, {
            headers: getAuthHeader(),
        });
        return response.data;
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