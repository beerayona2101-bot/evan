import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';

// @desc    Get logged in user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    res.status(200).json(wishlist.products || []);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId || !productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [productId] });
    } else {
      const existsIndex = wishlist.products.findIndex(
        (id) => id.toString() === productId
      );

      if (existsIndex > -1) {
        wishlist.products.splice(existsIndex, 1);
      } else {
        wishlist.products.push(productId);
      }
      await wishlist.save();
    }

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(updatedWishlist?.products || []);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      res.status(200).json([]);
      return;
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(updatedWishlist?.products || []);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
