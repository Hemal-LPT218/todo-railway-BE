import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config: mysql.PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo_app',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  connectionLimit: 10
};

class Database {
  private static instance: Database;
  private pool: mysql.Pool;
  private isConnected: boolean = false;

  private constructor() {
    this.pool = mysql.createPool(config);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async getConnection(): Promise<mysql.PoolConnection> {
    try {
      const connection = await this.pool.getConnection();
      if (!this.isConnected) {
        console.log('✅ Database connected successfully');
        this.isConnected = true;
      }
      return connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    const connection = await this.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  public async initialize(): Promise<void> {
    try {
      const connection = await this.getConnection();

      // Create users table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create todos table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          user_id VARCHAR(36) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id)
        )
      `);

      console.log('✅ Database tables initialized successfully');
      connection.release();
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    console.log('Database connection closed');
  }
}

export const database = Database.getInstance();
