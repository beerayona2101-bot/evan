import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variantId?: string;
  size: string;
  color: string;
  hexColor?: string;
  sku?: string;
  variantImage?: string;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  savedForLater: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: String, default: '' },
        size: { type: String, required: true },
        color: { type: String, required: true },
        hexColor: { type: String, default: '#800000' },
        sku: { type: String, default: '' },
        variantImage: { type: String, default: '' },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    savedForLater: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: String, default: '' },
        size: { type: String, required: true },
        color: { type: String, required: true },
        hexColor: { type: String, default: '#800000' },
        sku: { type: String, default: '' },
        variantImage: { type: String, default: '' },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
