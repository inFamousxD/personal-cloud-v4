// backend/src/models/Agent.ts
import { ObjectId } from 'mongodb';

// ===== AGENT CHAT INTERFACES =====

export interface AgentChat {
    _id?: ObjectId;
    userId: string;
    title: string;
    agentId: string; // Model/agent locked to this chat
    systemPrompt?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentMessage {
    _id?: ObjectId;
    chatId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    thinking?: string;
    timestamp: Date;
}

// Input types for creating/updating
export interface CreateChatInput {
    title?: string;
    agentId: string; // Required when creating
    systemPrompt?: string;
}

export interface UpdateChatInput {
    title?: string;
    systemPrompt?: string;
    // agentId is NOT updatable - locked after creation
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
    defaultAgentId?: string; // NEW: Default agent for new chats
    updatedAt: Date;
}

// Active session tracking
export interface ActiveSession {
    userId: string;
    chatId: string;
    startTime: Date;
}