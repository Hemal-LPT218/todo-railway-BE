import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { UserResponse } from '../types';

export class UserPrisma {
  static async create(userData: { username: string; email: string; password: string }): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async findById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async findByUsername(username: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async findByEmail(email: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async validatePassword(username: string, password: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
    
    if (!user) return null;
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async existsByUsername(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    
    return !!user;
  }

  static async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    
    return !!user;
  }
}
