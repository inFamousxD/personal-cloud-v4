import { Router } from 'express';
// import authRoutes from './auth.routes';
// import todoRoutes from './todo.routes';
// import noteRoutes from './note.routes';
// import diaryRoutes from './diary.routes';
// import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
// router.use('/auth', authRoutes);

// Protected routes
// router.use('/todos', authenticate, todoRoutes);
// router.use('/notes', authenticate, noteRoutes);
// router.use('/diary', authenticate, diaryRoutes);

// API version and status
router.get('/status', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

// Type definitions for route parameters
export interface AuthRouteParams {
  userId: string;
}

export interface TodoRouteParams {
  todoId: string;
}

export interface NoteRouteParams {
  noteId: string;
}

export interface DiaryRouteParams {
  entryId: string;
}

// Request body type definitions
export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface CreateTodoRequestBody {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateNoteRequestBody {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface CreateDiaryEntryRequestBody {
  content: string;
  mood?: string;
  tags?: string[];
  isPrivate?: boolean;
}