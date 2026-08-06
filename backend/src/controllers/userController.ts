import { Response } from 'express';
<<<<<<< HEAD
import { User } from '../models/User';
import { Address } from '../models/Address';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
=======
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRepository } from '../repositories/userRepository';

const userRepo = new UserRepository();

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const user = await userRepo.findById(req.user?._id?.toString() || '');
      res.json(user || req.user);
      return;
    }
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      const fallback = await userRepo.findById(req.user?._id?.toString() || '');
      res.json(fallback || req.user);
>>>>>>> e82de53 (color and ui changed)
      return;
    }
    res.json(user);
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ message: (error as Error).message });
=======
    const fallback = await userRepo.findById(req.user?._id?.toString() || '');
    res.json(fallback || req.user);
>>>>>>> e82de53 (color and ui changed)
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
=======
    if (mongoose.connection.readyState !== 1) {
      const user = await userRepo.findById(req.user?._id?.toString() || '');
      if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
      }
      res.json(user || req.user);
      return;
    }
>>>>>>> e82de53 (color and ui changed)
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUserAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    const addresses = await Address.find({ user: req.user?._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
=======
    if (mongoose.connection.readyState !== 1) {
      res.json(req.user?.addresses || []);
      return;
    }
    const addresses = await Address.find({ user: req.user?._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.json(req.user?.addresses || []);
>>>>>>> e82de53 (color and ui changed)
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
<<<<<<< HEAD
=======
    if (mongoose.connection.readyState !== 1) {
      const newAddr: any = { _id: `addr-${Date.now()}`, fullName, phone, street, city, state, postalCode, country: country || 'India', isDefault: isDefault || false };
      if (!req.user?.addresses) (req.user as any).addresses = [];
      if (isDefault) {
        req.user?.addresses.forEach((a: any) => (a.isDefault = false));
      }
      req.user?.addresses.unshift(newAddr);
      res.status(201).json(newAddr);
      return;
    }
>>>>>>> e82de53 (color and ui changed)
    if (isDefault) {
      await Address.updateMany({ user: req.user?._id }, { isDefault: false });
    }

    const address = new Address({
      user: req.user?._id,
      fullName,
      phone,
      street,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false,
    });

    const saved = await address.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
<<<<<<< HEAD
=======
    if (mongoose.connection.readyState !== 1) {
      const newAddr: any = { _id: req.params.id, fullName, phone, street, city, state, postalCode, country: country || 'India', isDefault: isDefault || false };
      if (req.user?.addresses) {
        const idx = req.user.addresses.findIndex((a: any) => a._id === req.params.id);
        if (idx > -1) {
          req.user.addresses[idx] = newAddr;
        } else {
          req.user.addresses.push(newAddr);
        }
      }
      res.json(newAddr);
      return;
    }
>>>>>>> e82de53 (color and ui changed)
    if (isDefault) {
      await Address.updateMany({ user: req.user?._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      { fullName, phone, street, city, state, postalCode, country, isDefault },
      { new: true }
    );

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
=======
    if (mongoose.connection.readyState !== 1) {
      if (req.user?.addresses) {
        (req.user as any).addresses = req.user.addresses.filter((a: any) => a._id !== req.params.id);
      }
      res.json({ message: 'Address deleted successfully' });
      return;
    }
>>>>>>> e82de53 (color and ui changed)
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
=======
    if (mongoose.connection.readyState !== 1) {
      const admin = await userRepo.findByEmail('admin@evan.com');
      const customer = await userRepo.findByEmail('ananya@example.com');
      res.json([admin, customer].filter(Boolean));
      return;
    }
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    const admin = await userRepo.findByEmail('admin@evan.com');
    const customer = await userRepo.findByEmail('ananya@example.com');
    res.json([admin, customer].filter(Boolean));
>>>>>>> e82de53 (color and ui changed)
  }
};
