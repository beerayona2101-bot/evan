import { Response } from 'express';
import { Cart } from '../models/Cart';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id })
      .populate('items.product')
      .populate('savedForLater.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [], savedForLater: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, size, color, quantity, price } = req.body;
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
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateCartItemQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

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
    res.status(500).json({ message: (error as Error).message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
    res.status(500).json({ message: (error as Error).message });
  }
};

export const saveForLater = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.body;
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
    res.status(500).json({ message: (error as Error).message });
  }
};

export const moveToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId } = req.body;
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
    res.status(500).json({ message: (error as Error).message });
  }
};

export const syncCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { localItems } = req.body;
    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = new Cart({ user: req.user?._id, items: [], savedForLater: [] });
    }

    if (Array.isArray(localItems)) {
      for (const item of localItems) {
        const pId = item.product._id || item.product;
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
    res.status(500).json({ message: (error as Error).message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
