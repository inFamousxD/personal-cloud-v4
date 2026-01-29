// backend/src/models/Agent.ts
import { ObjectId } from 'mongodb';

// ===== AGENT CHAT INTERFACES =====

export interface AgentChat {
    _id?: ObjectId;
    userId: string;
    title: string;
    systemPrompt?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentMessage {
    _id?: ObjectId;
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    thinking?: string; // NEW: Optional thinking content
    timestamp: Date;
}

// Input types for creating/updating
export interface CreateChatInput {
    title?: string;
    systemPrompt?: string;
}

export interface UpdateChatInput {
    title?: string;
    systemPrompt?: string;
}

export interface CreateMessageInput {
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// System settings
export interface AgentSettings {
    _id?: ObjectId;
    userId: string;
    defaultSystemPrompt: string;
    updatedAt: Date;
}

// Active session tracking
export interface ActiveSession {
    userId: string;
    chatId: string;
    startTime: Date;
}