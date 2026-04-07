import { prisma } from '../lib/prisma';
import { Todo as ITodo } from '../types';

export class TodoPrisma {
  static async create(todoData: { text: string; userId: string }): Promise<ITodo> {
    const todo = await prisma.todo.create({
      data: {
        text: todoData.text,
        userId: todoData.userId,
      },
    });

    return {
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }

  static async findById(id: number): Promise<ITodo | null> {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) return null;

    return {
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    };
  }

  static async findByUserId(userId: string): Promise<ITodo[]> {
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return todos.map((todo: any) => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    }));
  }

  static async update(id: number, userId: string, updates: Partial<Pick<ITodo, 'text' | 'completed'>>): Promise<ITodo | null> {
    const todo = await prisma.todo.updateMany({
      where: {
        id,
        userId,
      },
      data: updates,
    });

    if (todo.count === 0) return null;

    return this.findById(id);
  }

  static async delete(id: number, userId: string): Promise<boolean> {
    const result = await prisma.todo.deleteMany({
      where: {
        id,
        userId,
      },
    });

    return result.count > 0;
  }

  static async deleteAllByUserId(userId: string): Promise<boolean> {
    const result = await prisma.todo.deleteMany({
      where: { userId },
    });

    return result.count > 0;
  }

  static async countByUserId(userId: string): Promise<number> {
    return await prisma.todo.count({
      where: { userId },
    });
  }

  static async exists(id: number, userId: string): Promise<boolean> {
    const todo = await prisma.todo.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    return !!todo && todo.userId === userId;
  }
}
