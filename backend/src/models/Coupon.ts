import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minPurchase: number;
  expirationDate: Date;
  isActive: boolean;
  createdAt: Date;
}

const couponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountAmount: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    expirationDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
