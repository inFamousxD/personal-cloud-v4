import { ObjectId } from 'mongodb';

export interface DrawingImage {
    id: string;
    created: number;
    dataURL?: string;      // Small inline images (<100KB)
    storedPath?: string;   // Large images in secure storage
    mimeType: string;
}

export interface DrawingSceneData {
    elements: any[];
    appState: any;
    files?: {
        [fileId: string]: DrawingImage;
    };
}

export interface Drawing {
    _id?: ObjectId;
    userId: string;
    title: string;
    sceneData: DrawingSceneData;
    folderId?: string | null;
    thumbnail?: string;     // Base64 preview for sidebar
    collaborators?: string[]; // For future collab support
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

export interface CreateDrawingInput {
    title: string;
    sceneData?: DrawingSceneData;
    folderId?: string | null;
}

export interface UpdateDrawingInput {
    title?: string;
    sceneData?: DrawingSceneData;
    folderId?: string | null;
    thumbnail?: string;
}

export interface CreateFolderInput {
    name: string;
}