import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../storage/memoryStore';
import { UserResponse } from '../types';

interface AuthRequest extends Request {
  user?: UserResponse;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: 'JWT secret not configured'
    });
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const user = memoryStore.getUserById(decoded.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from user object
    const { password, ...userResponse } = user;
    req.user = userResponse;
    next();
  });
};

export type { AuthRequest };
