import { ObjectId } from 'mongodb';

export interface ListItem {
    id: string;
    text: string;
    checked: boolean;
    isComplex: boolean;
    details?: string; // For complex items
    detailsExpanded?: boolean; // Client-side state
}

export interface List {
    _id?: ObjectId;
    userId: string;
    folderId: string | null;
    title: string;
    items: ListItem[];
    tags: string[];
    shareId?: string; // Unique share identifier
    shareMode?: 'none' | 'read-only' | 'read-write';
    createdAt: Date;
    updatedAt: Date;
}

export interface ListFolder {
    _id?: ObjectId;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateListInput {
    folderId?: string | null;
    title: string;
    items?: ListItem[];
    tags?: string[];
}

export interface UpdateListInput {
    folderId?: string | null;
    title?: string;
    items?: ListItem[];
    tags?: string[];
}

export interface ShareListInput {
    shareMode: 'read-only' | 'read-write';
}

export interface CreateListFolderInput {
    name: string;
}

export interface UpdateListFolderInput {
    name: string;
}