import { ObjectId } from 'mongodb';

export interface Note {
    _id?: ObjectId;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNoteInput {
    title: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
}

export interface UpdateNoteInput {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
}