import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  syncCart,
  clearCart,
  saveForLater,
  moveToCart,
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.post('/add', protect, addToCart);
router.put('/:itemId', protect, updateCartItemQuantity);
router.put('/update/:itemId', protect, updateCartItemQuantity);
router.patch('/quantity', protect, updateCartItemQuantity);
router.delete('/clear', protect, clearCart);
router.delete('/:itemId', protect, removeFromCart);
router.delete('/remove/:itemId', protect, removeFromCart);
router.post('/save-for-later', protect, saveForLater);
router.post('/move-to-cart', protect, moveToCart);
router.post('/sync', protect, syncCart);

export default router;
