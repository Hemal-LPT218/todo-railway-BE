import { Router, Response } from 'express';
import { TodoPrisma } from '../models/Todo.prisma';
import { Todo as ITodo, ApiResponse, AuthRequest } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All todo routes require authentication
router.use(authenticateToken);

// Get all todos for the authenticated user
router.get('/', async (req: AuthRequest, res: Response<ApiResponse<ITodo[]>>) => {
  try {
    const userId = req.user!.id;
    const todos = await TodoPrisma.findByUserId(userId);

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
router.post('/', async (req: AuthRequest, res: Response<ApiResponse<ITodo>>) => {
  try {
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Todo text is required'
      });
    }

    const todo = await TodoPrisma.create({ text: text.trim(), userId });

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
router.put('/:id', async (req: AuthRequest, res: Response<ApiResponse<ITodo>>) => {
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

    // Check if todo exists and belongs to user
    const existingTodo = await TodoPrisma.findById(todoId);
    if (!existingTodo || existingTodo.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    const updateData: Partial<Pick<ITodo, 'text' | 'completed'>> = {};
    if (text !== undefined) updateData.text = text;
    if (completed !== undefined) updateData.completed = completed;

    const updatedTodo = await TodoPrisma.update(todoId, userId, updateData);

    if (!updatedTodo) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update todo'
      });
    }

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
router.delete('/:id', async (req: AuthRequest, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const todoId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

    if (isNaN(todoId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid todo ID'
      });
    }

    // Check if todo exists and belongs to user
    const existingTodo = await TodoPrisma.findById(todoId);
    if (!existingTodo || existingTodo.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    const deleted = await TodoPrisma.delete(todoId, userId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete todo'
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
