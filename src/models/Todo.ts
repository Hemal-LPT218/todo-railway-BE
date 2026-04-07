import { database } from '../config/database';
import { Todo as ITodo } from '../types';

export class Todo {
  static async create(todoData: { text: string; userId: string }): Promise<ITodo> {
    const sql = `
      INSERT INTO todos (text, user_id)
      VALUES (?, ?)
    `;

    const result = await database.query(sql, [todoData.text, todoData.userId]);
    const insertId = result.insertId;

    const todo = await this.findById(insertId);
    if (!todo) {
      throw new Error('Failed to create todo');
    }

    return todo;
  }

  static async findById(id: number): Promise<ITodo | null> {
    const sql = `
      SELECT id, text, completed, user_id, created_at, updated_at
      FROM todos WHERE id = ?
    `;
    const rows = await database.query(sql, [id]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return {
      id: row.id,
      text: row.text,
      completed: row.completed,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findByUserId(userId: string): Promise<ITodo[]> {
    const sql = `
      SELECT id, text, completed, user_id, created_at, updated_at
      FROM todos WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const rows = await database.query(sql, [userId]) as any[];

    return rows.map(row => ({
      id: row.id,
      text: row.text,
      completed: row.completed,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async update(id: number, userId: string, updates: Partial<Pick<ITodo, 'text' | 'completed'>>): Promise<ITodo | null> {
    const setClause: string[] = [];
    const values: any[] = [];

    if (updates.text !== undefined) {
      setClause.push('text = ?');
      values.push(updates.text);
    }

    if (updates.completed !== undefined) {
      setClause.push('completed = ?');
      values.push(updates.completed);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const sql = `
      UPDATE todos 
      SET ${setClause.join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    await database.query(sql, values);

    return this.findById(id);
  }

  static async delete(id: number, userId: string): Promise<boolean> {
    const sql = 'DELETE FROM todos WHERE id = ? AND user_id = ?';
    const result = await database.query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  static async deleteAllByUserId(userId: string): Promise<boolean> {
    const sql = 'DELETE FROM todos WHERE user_id = ?';
    const result = await database.query(sql, [userId]);
    return result.affectedRows > 0;
  }

  static async countByUserId(userId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM todos WHERE user_id = ?';
    const rows = await database.query(sql, [userId]) as any[];
    return rows[0].count;
  }

  static async exists(id: number, userId: string): Promise<boolean> {
    const sql = 'SELECT id FROM todos WHERE id = ? AND user_id = ?';
    const rows = await database.query(sql, [id, userId]);
    return rows.length > 0;
  }
}
