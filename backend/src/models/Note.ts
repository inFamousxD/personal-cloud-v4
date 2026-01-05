import { ObjectId } from 'mongodb';

export interface Note {
    _id?: ObjectId;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNoteInput {
    title: string;
    content?: string;
    tags?: string[];
}

export interface UpdateNoteInput {
    title?: string;
    content?: string;
    tags?: string[];
}