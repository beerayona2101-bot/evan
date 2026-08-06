import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

import mongoose from 'mongoose';
import { UserRepository, createFallbackUser } from '../repositories/userRepository';

const userRepo = new UserRepository();

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'evan_luxury_men_fashion_jwt_secret_key_2026';
      const decoded = jwt.verify(token, secret) as { id: string; role: string };

      if (mongoose.connection.readyState !== 1) {
        const user = await userRepo.findById(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
        req.user = createFallbackUser({
          _id: new mongoose.Types.ObjectId(mongoose.Types.ObjectId.isValid(decoded.id) ? decoded.id : '65f0a0000000000000000001'),
          role: (decoded.role as any) || 'admin',
          email: decoded.role === 'admin' ? 'admin@evan.com' : 'ananya@example.com',
          name: decoded.role === 'admin' ? 'EVAN COLLECTIONS Admin' : 'Ananya Sharma',
        });
        return next();
      }

      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      } else {
        const fallbackUser = await userRepo.findById(decoded.id);
        if (fallbackUser) {
          req.user = fallbackUser;
          return next();
        }
      }
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token validation failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

export const admin = adminOnly;
