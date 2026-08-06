import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/authMiddleware';
import { emitRealtimeEvent } from '../config/socket';

const FALLBACK_COUPONS = [
  {
    _id: 'c-1',
    code: 'ROYAL10',
    discountType: 'percentage',
    discountAmount: 10,
    minPurchase: 1999,
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    _id: 'c-2',
    code: 'BRIDAL20',
    discountType: 'percentage',
    discountAmount: 20,
    minPurchase: 4999,
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    _id: 'c-3',
    code: 'EVAN1000',
    discountType: 'fixed',
    discountAmount: 1000,
    minPurchase: 7999,
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      res.status(400).json({ message: 'Coupon code is required' });
      return;
    }

    const uppercaseCode = code.toUpperCase();

    if (mongoose.connection.readyState !== 1) {
      const match = FALLBACK_COUPONS.find((c) => c.code === uppercaseCode && c.isActive);
      if (!match) {
        res.status(404).json({ message: 'Invalid or expired coupon code' });
        return;
      }
      let discount = match.discountType === 'percentage' ? Math.round(((cartTotal || 0) * match.discountAmount) / 100) : match.discountAmount;
      res.json({
        valid: true,
        code: match.code,
        discountType: match.discountType,
        discountValue: match.discountAmount,
        discountAmount: discount,
      });
      return;
    }

    const coupon = await Coupon.findOne({ code: uppercaseCode, isActive: true });
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
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_COUPONS);
      return;
    }
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.json(FALLBACK_COUPONS);
  }
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountAmount, minPurchase, expirationDate } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const newC = {
        _id: `c-${Date.now()}`,
        code: code.toUpperCase(),
        discountType,
        discountAmount,
        minPurchase: minPurchase || 0,
        expirationDate: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      };
      FALLBACK_COUPONS.unshift(newC);
      emitRealtimeEvent('couponUpdated', newC);
      res.status(201).json(newC);
      return;
    }
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
    if (mongoose.connection.readyState !== 1) {
      const idx = FALLBACK_COUPONS.findIndex((c) => c._id === req.params.id);
      if (idx > -1) FALLBACK_COUPONS.splice(idx, 1);
      emitRealtimeEvent('couponUpdated', { id: req.params.id, deleted: true });
      res.json({ message: 'Coupon removed successfully' });
      return;
    }
    await Coupon.findByIdAndDelete(req.params.id);
    emitRealtimeEvent('couponUpdated', { id: req.params.id, deleted: true });
    res.json({ message: 'Coupon removed successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
