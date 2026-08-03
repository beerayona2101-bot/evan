import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/authMiddleware';

const userService = new UserService();

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, firstName, lastName } = req.body;
    const result = await userService.registerUser(name, email, password, phone, firstName, lastName);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const reqIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await userService.loginUser(email, password, reqIp, userAgent);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
};

export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      req.user.lastLogout = new Date();
      await req.user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.query.token as string || req.body.token;
    const result = await userService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const result = await userService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const { oldPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user._id.toString(), oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const user = await userService.getUserProfile(req.user._id.toString());
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const updatedUser = await userService.updateProfile(req.user._id.toString(), req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
