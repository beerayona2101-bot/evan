import { Response } from 'express';
import { User } from '../models/User';
import { Address } from '../models/Address';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
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
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUserAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ user: req.user?._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
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
    await Address.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
