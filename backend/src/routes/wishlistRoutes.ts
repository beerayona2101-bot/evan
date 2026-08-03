import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getWishlist,
  toggleWishlistItem,
  removeFromWishlist,
} from '../controllers/wishlistController';

const router = Router();

router.route('/')
  .get(protect, getWishlist);

router.route('/toggle')
  .post(protect, toggleWishlistItem);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

export default router;
