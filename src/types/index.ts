import { Request } from 'express';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthRequest extends Request {
  user?: UserResponse;
}
