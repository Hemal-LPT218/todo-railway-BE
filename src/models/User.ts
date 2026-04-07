import { database } from '../config/database';
import { User as IUser, UserResponse } from '../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class User {
  static async create(userData: { username: string; email: string; password: string }): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const id = uuidv4();

    const sql = `
      INSERT INTO users (id, username, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;

    await database.query(sql, [id, userData.username, userData.email, hashedPassword]);

    const user = await this.findById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  static async findById(id: string): Promise<UserResponse | null> {
    const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    const rows = await database.query(sql, [id]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at
    };
  }

  static async findByUsername(username: string): Promise<UserResponse | null> {
    const sql = 'SELECT id, username, email, created_at FROM users WHERE username = ?';
    const rows = await database.query(sql, [username]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at
    };
  }

  static async findByEmail(email: string): Promise<UserResponse | null> {
    const sql = 'SELECT id, username, email, created_at FROM users WHERE email = ?';
    const rows = await database.query(sql, [email]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at
    };
  }

  static async validatePassword(username: string, password: string): Promise<UserResponse | null> {
    const sql = 'SELECT id, username, email, password_hash, created_at FROM users WHERE username = ?';
    const rows = await database.query(sql, [username]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    const isValidPassword = await bcrypt.compare(password, row.password_hash);

    if (!isValidPassword) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at
    };
  }

  static async existsByUsername(username: string): Promise<boolean> {
    const sql = 'SELECT id FROM users WHERE username = ?';
    const rows = await database.query(sql, [username]);
    return rows.length > 0;
  }

  static async existsByEmail(email: string): Promise<boolean> {
    const sql = 'SELECT id FROM users WHERE email = ?';
    const rows = await database.query(sql, [email]);
    return rows.length > 0;
  }
}
