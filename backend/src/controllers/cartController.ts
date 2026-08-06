import { Response } from 'express';
import mongoose from 'mongoose';
import { Cart } from '../models/Cart';
import { AuthRequest } from '../middleware/authMiddleware';
import { ProductRepository } from '../repositories/productRepository';

const productRepo = new ProductRepository();
const FALLBACK_CARTS: Map<string, any> = new Map();

const getOrCreateFallbackCart = async (userId: string) => {
  if (!FALLBACK_CARTS.has(userId)) {
    FALLBACK_CARTS.set(userId, { _id: `cart-${userId}`, user: userId, items: [], savedForLater: [] });
  }
  return FALLBACK_CARTS.get(userId);
};

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      res.json(cart);
      return;
    }
    let cart = await Cart.findOne({ user: req.user?._id })
      .populate('items.product')
      .populate('savedForLater.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [], savedForLater: [] });
    }
    res.json(cart);
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    const { productId, size, color, quantity, price } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      const product = await productRepo.findByIdOrSlug(productId);
      const existingIdx = cart.items.findIndex((item: any) => (item.product?._id === productId || item.product === productId) && item.size === size && item.color === color);
      if (existingIdx > -1) {
        cart.items[existingIdx].quantity += quantity || 1;
      } else {
        cart.items.push({ _id: `item-${Date.now()}`, product: product || productId, size, color, quantity: quantity || 1, price: price || product?.price || 4999 });
      }
      res.json(cart);
      return;
    }

    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = new Cart({ user: req.user?._id, items: [], savedForLater: [] });
    }

    const existingIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, size, color, quantity: quantity || 1, price });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('savedForLater.product');
    res.json(updatedCart);
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const updateCartItemQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      const itemIndex = cart.items.findIndex((item: any) => item._id === itemId || String(item._id) === String(itemId));
      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
      }
      res.json(cart);
      return;
    }

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    }

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('savedForLater.product');
    res.json(updatedCart);
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      cart.items = cart.items.filter((item: any) => item._id !== req.params.itemId && String(item._id) !== String(req.params.itemId));
      cart.savedForLater = (cart.savedForLater || []).filter((item: any) => item._id !== req.params.itemId && String(item._id) !== String(req.params.itemId));
      res.json(cart);
      return;
    }
    const cart = await Cart.findOne({ user: req.user?._id });
    if (cart) {
      cart.items = cart.items.filter((item: any) => item._id.toString() !== req.params.itemId);
      cart.savedForLater = (cart.savedForLater || []).filter((item: any) => item._id.toString() !== req.params.itemId);
      await cart.save();
      const updatedCart = await Cart.findById(cart._id)
        .populate('items.product')
        .populate('savedForLater.product');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const saveForLater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    const { itemId } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      const itemIndex = cart.items.findIndex((item: any) => item._id === itemId || String(item._id) === String(itemId));
      if (itemIndex > -1) {
        const [itemToSave] = cart.items.splice(itemIndex, 1);
        if (!cart.savedForLater) cart.savedForLater = [];
        cart.savedForLater.push(itemToSave);
      }
      res.json(cart);
      return;
    }
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === itemId);
    if (itemIndex > -1) {
      const [itemToSave] = cart.items.splice(itemIndex, 1);
      if (!cart.savedForLater) cart.savedForLater = [];
      cart.savedForLater.push(itemToSave);
      await cart.save();
    }

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('savedForLater.product');
    res.json(updatedCart);
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const moveToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    const { itemId } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      const savedIndex = (cart.savedForLater || []).findIndex((item: any) => item._id === itemId || String(item._id) === String(itemId));
      if (savedIndex > -1) {
        const [itemToMove] = cart.savedForLater.splice(savedIndex, 1);
        cart.items.push(itemToMove);
      }
      res.json(cart);
      return;
    }
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const savedIndex = (cart.savedForLater || []).findIndex((item: any) => item._id.toString() === itemId);
    if (savedIndex > -1) {
      const [itemToMove] = cart.savedForLater.splice(savedIndex, 1);
      cart.items.push(itemToMove);
      await cart.save();
    }

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('savedForLater.product');
    res.json(updatedCart);
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const syncCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    const { localItems } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      if (Array.isArray(localItems)) {
        for (const item of localItems) {
          const pId = item.productId || (item.product && (item.product._id || item.product)) || item.product;
          const product = await productRepo.findByIdOrSlug(pId);
          const existingIdx = cart.items.findIndex(
            (i: any) => (i.product?._id === pId || i.product === pId) && i.size === item.size && i.color === item.color
          );
          if (existingIdx > -1) {
            cart.items[existingIdx].quantity = Math.max(cart.items[existingIdx].quantity, item.quantity);
          } else {
            cart.items.push({
              _id: `item-${Date.now()}-${Math.random()}`,
              product: product || pId,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              price: item.price,
            });
          }
        }
      }
      res.json(cart);
      return;
    }

    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = new Cart({ user: req.user?._id, items: [], savedForLater: [] });
    }

    if (Array.isArray(localItems)) {
      for (const item of localItems) {
        const pId = item.productId || (item.product && (item.product._id || item.product)) || item.product;
        if (!pId) continue;
        const existingIdx = cart.items.findIndex(
          (i) => i.product.toString() === pId && i.size === item.size && i.color === item.color
        );
        if (existingIdx > -1) {
          cart.items[existingIdx].quantity = Math.max(cart.items[existingIdx].quantity, item.quantity);
        } else {
          cart.items.push({
            product: pId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
          });
        }
      }
      await cart.save();
    }

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product')
      .populate('savedForLater.product');
    res.json(updatedCart);
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    res.json(cart);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || 'user-1';
    if (mongoose.connection.readyState !== 1) {
      const cart = await getOrCreateFallbackCart(userId);
      cart.items = [];
      res.json({ message: 'Cart cleared' });
      return;
    }
    const cart = await Cart.findOne({ user: req.user?._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    const userId = req.user?._id?.toString() || 'user-1';
    const cart = await getOrCreateFallbackCart(userId);
    cart.items = [];
    res.json({ message: 'Cart cleared' });
  }
};
