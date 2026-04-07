import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import type { User as IUser, UserResponse } from '../types';

interface AuthRequest extends Request {
  user?: UserResponse;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

  jwt.verify(token, jwtSecret, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    next();
  });
};

export type { AuthRequest };
