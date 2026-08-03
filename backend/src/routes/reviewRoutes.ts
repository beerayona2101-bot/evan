import express from 'express';
import { createProductReview, getProductReviews } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createProductReview);

export default router;
