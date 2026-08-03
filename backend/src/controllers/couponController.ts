import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/authMiddleware';
import { emitRealtimeEvent } from '../config/socket';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      res.status(400).json({ message: 'Coupon code is required' });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      res.status(404).json({ message: 'Invalid or expired coupon code' });
      return;
    }

    if (new Date() > new Date(coupon.expirationDate)) {
      res.status(400).json({ message: 'Coupon has expired' });
      return;
    }

    if (cartTotal && cartTotal < coupon.minPurchase) {
      res.status(400).json({ message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon` });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountAmount) / 100);
    } else {
      discountAmount = coupon.discountAmount;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountAmount,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountAmount, minPurchase, expirationDate } = req.body;
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountAmount,
      minPurchase: minPurchase || 0,
      expirationDate: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    const saved = await coupon.save();
    emitRealtimeEvent('couponUpdated', saved);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    emitRealtimeEvent('couponUpdated', { id: req.params.id, deleted: true });
    res.json({ message: 'Coupon removed successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
