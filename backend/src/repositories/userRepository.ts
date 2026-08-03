import { User, IUser } from '../models/User';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return await User.findOne({ verificationToken: token });
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return await User.findOne({ resetToken: token, resetExpiry: { $gt: new Date() } });
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return await User.create(userData);
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }
}
