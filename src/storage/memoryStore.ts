import { User, Todo } from '../types';

export class MemoryStore {
  private users: Map<string, User> = new Map();
  private todos: Map<number, Todo> = new Map();
  private nextUserId = 1;
  private nextTodoId = 1;

  // User operations
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: this.nextUserId.toString(),
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    this.nextUserId++;
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  // Todo operations
  createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    const todo: Todo = {
      ...todoData,
      id: this.nextTodoId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  getTodoById(id: number): Todo | undefined {
    return this.todos.get(id);
  }

  getTodosByUserId(userId: string): Todo[] {
    return Array.from(this.todos.values()).filter(todo => todo.userId === userId);
  }

  updateTodo(id: number, updates: Partial<Todo>): Todo | undefined {
    const todo = this.todos.get(id);
    if (!todo) return undefined;

    const updatedTodo = {
      ...todo,
      ...updates,
      updatedAt: new Date()
    };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  deleteTodo(id: number): boolean {
    return this.todos.delete(id);
  }

  deleteTodosByUserId(userId: string): number {
    let deletedCount = 0;
    for (const [id, todo] of this.todos.entries()) {
      if (todo.userId === userId) {
        this.todos.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  }
}

export const memoryStore = new MemoryStore();
