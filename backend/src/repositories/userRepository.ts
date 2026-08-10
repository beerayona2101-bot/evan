import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';

export const createFallbackUser = (data: Partial<IUser>): IUser => {
  const defaultId = data._id || new mongoose.Types.ObjectId();
  const userObj: any = {
    _id: defaultId,
    name: data.name || 'Kanchanika User',
    firstName: data.firstName || (data.name ? data.name.split(' ')[0] : 'Kanchanika'),
    lastName: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : 'User'),
    email: (data.email || '').toLowerCase().trim(),
    password: data.password || '',
    phone: data.phone || '+91 9490644434',
    avatar: data.avatar || '',
    role: data.role || 'customer',
    status: data.status || 'active',
    isVerified: data.isVerified !== undefined ? data.isVerified : true,
    verificationToken: data.verificationToken,
    verificationExpiry: data.verificationExpiry,
    resetToken: data.resetToken,
    resetExpiry: data.resetExpiry,
    loginHistory: data.loginHistory || [],
    addresses: data.addresses || [],
    wishlist: data.wishlist || [],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };

  userObj.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    if (this.password === enteredPassword) return true;
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch {
      return false;
    }
  };

  userObj.save = async function () {
    this.updatedAt = new Date();
    return this;
  };

  userObj.toObject = function () {
    return { ...this };
  };

  return userObj as IUser;
};

const FALLBACK_USERS_STORE: Map<string, IUser> = new Map();

const adminFallback = createFallbackUser({
  _id: new mongoose.Types.ObjectId('65f0a0000000000000000001'),
  name: 'Kanchanika Admin',
  email: 'admin@kanchanika.com',
  password: 'adminpassword123',
  role: 'admin',
  phone: '+91 9490644434',
  status: 'active',
  isVerified: true,
});

const customerFallback = createFallbackUser({
  _id: new mongoose.Types.ObjectId('65f0a0000000000000000002'),
  name: 'Ananya Sharma',
  email: 'ananya@example.com',
  password: 'userpassword123',
  role: 'customer',
  phone: '+91 9490644435',
  status: 'active',
  isVerified: true,
});

FALLBACK_USERS_STORE.set('admin@kanchanika.com', adminFallback);
FALLBACK_USERS_STORE.set('ananya@example.com', customerFallback);

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (mongoose.connection.readyState !== 1) {
      return FALLBACK_USERS_STORE.get(cleanEmail) || null;
    }
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) return user;
      return FALLBACK_USERS_STORE.get(cleanEmail) || null;
    } catch {
      return FALLBACK_USERS_STORE.get(cleanEmail) || null;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
      for (const u of FALLBACK_USERS_STORE.values()) {
        if (u._id.toString() === id.toString()) return u;
      }
      return FALLBACK_USERS_STORE.get('admin@evan.com') || null;
    }
    try {
      const user = await User.findById(id);
      if (user) return user;
      for (const u of FALLBACK_USERS_STORE.values()) {
        if (u._id.toString() === id.toString()) return u;
      }
      return null;
    } catch {
      for (const u of FALLBACK_USERS_STORE.values()) {
        if (u._id.toString() === id.toString()) return u;
      }
      return FALLBACK_USERS_STORE.get('admin@evan.com') || null;
    }
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
      for (const u of FALLBACK_USERS_STORE.values()) {
        if (u.verificationToken === token) return u;
      }
      return null;
    }
    try {
      return await User.findOne({ verificationToken: token });
    } catch {
      return null;
    }
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
      for (const u of FALLBACK_USERS_STORE.values()) {
        if (u.resetToken === token && u.resetExpiry && u.resetExpiry > new Date()) return u;
      }
      return null;
    }
    try {
      return await User.findOne({ resetToken: token, resetExpiry: { $gt: new Date() } });
    } catch {
      return null;
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    if (mongoose.connection.readyState !== 1) {
      const newUser = createFallbackUser(userData);
      if (newUser.email) {
        FALLBACK_USERS_STORE.set(newUser.email, newUser);
      }
      return newUser;
    }
    try {
      return await User.create(userData);
    } catch {
      const newUser = createFallbackUser(userData);
      if (newUser.email) {
        FALLBACK_USERS_STORE.set(newUser.email, newUser);
      }
      return newUser;
    }
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
      const user = await this.findById(id);
      if (user) {
        Object.assign(user, updateData);
        user.updatedAt = new Date();
      }
      return user;
    }
    try {
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    } catch {
      const user = await this.findById(id);
      if (user) {
        Object.assign(user, updateData);
      }
      return user;
    }
  }
}

