import { Response } from 'express';
<<<<<<< HEAD
import { AuthRequest } from '../middleware/authMiddleware';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
=======
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { ProductRepository } from '../repositories/productRepository';

const productRepo = new ProductRepository();
const FALLBACK_WISHLISTS: Map<string, any[]> = new Map();
>>>>>>> e82de53 (color and ui changed)

// @desc    Get logged in user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
=======
    const userId = req.user?._id?.toString() || 'user-1';
    if (mongoose.connection.readyState !== 1) {
      const items = FALLBACK_WISHLISTS.get(userId) || [];
      res.status(200).json(items);
>>>>>>> e82de53 (color and ui changed)
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    res.status(200).json(wishlist.products || []);
  } catch (error) {
<<<<<<< HEAD
    res.status(500).json({ message: (error as Error).message });
=======
    const userId = req.user?._id?.toString() || 'user-1';
    const items = FALLBACK_WISHLISTS.get(userId) || [];
    res.status(200).json(items);
>>>>>>> e82de53 (color and ui changed)
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlistItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
<<<<<<< HEAD
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId || !productId) {
=======
    const userId = req.user?._id?.toString() || 'user-1';
    const { productId } = req.body;

    if (!productId) {
>>>>>>> e82de53 (color and ui changed)
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

<<<<<<< HEAD
=======
    if (mongoose.connection.readyState !== 1) {
      let items = FALLBACK_WISHLISTS.get(userId) || [];
      const existsIndex = items.findIndex((p: any) => p._id === productId || p.id === productId);
      if (existsIndex > -1) {
        items.splice(existsIndex, 1);
      } else {
        const prod = await productRepo.findByIdOrSlug(productId);
        if (prod) items.push(prod);
      }
      FALLBACK_WISHLISTS.set(userId, items);
      res.status(200).json(items);
      return;
    }

>>>>>>> e82de53 (color and ui changed)
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
<<<<<<< HEAD
    const userId = req.user?._id;
    const { productId } = req.params;

=======
    const userId = req.user?._id?.toString() || 'user-1';
    const { productId } = req.params;

    if (mongoose.connection.readyState !== 1) {
      let items = FALLBACK_WISHLISTS.get(userId) || [];
      items = items.filter((p: any) => p._id !== productId && p.id !== productId);
      FALLBACK_WISHLISTS.set(userId, items);
      res.status(200).json(items);
      return;
    }

>>>>>>> e82de53 (color and ui changed)
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
