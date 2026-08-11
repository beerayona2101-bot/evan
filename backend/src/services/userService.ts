import crypto from 'crypto';
import { UserRepository } from '../repositories/userRepository';
import { generateToken } from '../utils/generateToken';
import {
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendForgotPasswordEmail,
  sendPasswordChangedEmail,
} from '../utils/sendEmail';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async registerUser(name: string, email: string, password: string, phone?: string, firstName?: string, lastName?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const userExists = await this.userRepo.findByEmail(cleanEmail);
    if (userExists) {
      throw new Error('User with this email address already exists');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Kanchanika Customer';

    const user = await this.userRepo.create({
      name: fullName,
      firstName: firstName || fullName.split(' ')[0],
      lastName: lastName || fullName.split(' ').slice(1).join(' '),
      email: cleanEmail,
      password,
      phone: phone || '',
      role: 'customer',
      status: 'active',
      isVerified: false,
      verificationToken,
      verificationExpiry,
    });

    // Dispatch Verification Email
    await sendEmailVerificationEmail(cleanEmail, user.name, verificationToken);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
      isVerified: user.isVerified,
    };
  }

  async loginUser(email: string, password: string, reqIp?: string, userAgent?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email address or password');
    }

    if (user.status === 'suspended' || user.status === 'inactive') {
      throw new Error('Your account is currently inactive or suspended. Please contact customer support.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid email address or password');
    }

    // Record login audit log
    const now = new Date();
    user.lastLogin = now;
    if (!user.loginHistory) user.loginHistory = [];
    user.loginHistory.push({
      timestamp: now,
      ip: reqIp || '',
      userAgent: userAgent || '',
    });
    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token: generateToken(user._id.toString(), user.role),
    };
  }

  async verifyEmail(token: string) {
    if (!token) throw new Error('Verification token is required');
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    return { message: 'Email verified successfully! You can now access all EVAN privileges.' };
  }

  async forgotPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      // Return success to prevent email enumeration attack
      return { message: 'If an account exists with this email, a reset link has been dispatched.', emailSent: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const emailSent = await sendForgotPasswordEmail(cleanEmail, user.name, resetToken);

    if (!emailSent) {
      console.warn(`[Nodemailer] Failed to deliver email to ${cleanEmail}. Gmail SMTP credentials (MAIL_USER/MAIL_PASS) in backend/.env may need a valid App Password.`);
      return {
        message: 'Password reset token generated! (Note: Live email delivery failed because Gmail SMTP requires a valid 16-character App Password in backend/.env).',
        emailSent: false,
        devResetUrl: resetUrl,
      };
    }

    return { message: 'Password reset link has been dispatched to your email address.', emailSent: true };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new Error('Reset token and new password are required');
    const user = await this.userRepo.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetExpiry = undefined;
    await user.save();

    sendPasswordChangedEmail(user.email, user.name).catch((err) => console.error('[Nodemailer] Password changed email error:', err));

    return { message: 'Password reset successfully. You may now log in with your new password.' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) throw new Error('Current password is incorrect');

    user.password = newPassword;
    await user.save();

    sendPasswordChangedEmail(user.email, user.name).catch((err) => console.error('[Nodemailer] Password changed email error:', err));

    return { message: 'Password changed successfully.' };
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    if (data.avatar) user.avatar = data.avatar;

    await user.save();
    return user;
  }
}
