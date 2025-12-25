import { ObjectId } from 'mongodb';

export interface Journal {
    _id?: ObjectId;
    userId: string;
    folderId: string | null; // null for root level journals
    title: string;
    subtitle: string;
    content: string; // Markdown content
    createdAt: Date;
    updatedAt: Date;
}

export interface Folder {
    _id?: ObjectId;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateJournalInput {
    folderId?: string | null;
    title: string;
    subtitle?: string;
    content: string;
}

export interface UpdateJournalInput {
    folderId?: string | null;
    title?: string;
    subtitle?: string;
    content?: string;
}

export interface CreateFolderInput {
    name: string;
}

export interface UpdateFolderInput {
    name: string;
}