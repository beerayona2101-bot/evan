import express from 'express';
import { validateCoupon, getCoupons, createCoupon, deleteCoupon } from '../controllers/couponController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

export default router;
