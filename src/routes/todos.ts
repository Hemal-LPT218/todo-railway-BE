import { Router, Response } from 'express';
import { memoryStore } from '../storage/memoryStore';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Todo, ApiResponse } from '../types';

const router = Router();

// All todo routes require authentication
router.use(authenticateToken);

// Get all todos for the authenticated user
router.get('/', (req: AuthRequest, res: Response<ApiResponse<Todo[]>>) => {
  try {
    const userId = req.user!.id;
    const todos = memoryStore.getTodosByUserId(userId);

    res.json({
      success: true,
      data: todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create a new todo
router.post('/', (req: AuthRequest, res: Response<ApiResponse<Todo>>) => {
  try {
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Todo text is required'
      });
    }

    const todo = memoryStore.createTodo({
      text: text.trim(),
      completed: false,
      userId
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update a todo (toggle completion or update text)
router.put('/:id', (req: AuthRequest, res: Response<ApiResponse<Todo>>) => {
  try {
    const userId = req.user!.id;
    const todoId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { text, completed } = req.body;

    if (isNaN(todoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid todo ID'
      });
    }

    const existingTodo = memoryStore.getTodoById(todoId);
    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    if (existingTodo.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updates: Partial<Todo> = {};
    if (typeof text === 'string' && text.trim() !== '') {
      updates.text = text.trim();
    }
    if (typeof completed === 'boolean') {
      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid updates provided'
      });
    }

    const updatedTodo = memoryStore.updateTodo(todoId, updates);

    res.json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete a todo
router.delete('/:id', (req: AuthRequest, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const todoId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    if (isNaN(todoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid todo ID'
      });
    }

    const existingTodo = memoryStore.getTodoById(todoId);
    if (!existingTodo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    if (existingTodo.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const deleted = memoryStore.deleteTodo(todoId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Todo deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete todo'
      });
    }
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
