import { ObjectId } from 'mongodb';

// ===== AGENT CHAT INTERFACES =====

export interface AgentChat {
    _id?: ObjectId;
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentMessage {
    _id?: ObjectId;
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

// Input types for creating/updating
export interface CreateChatInput {
    title?: string;
}

export interface UpdateChatInput {
    title: string;
}

export interface CreateMessageInput {
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}