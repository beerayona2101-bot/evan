import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  size: string;
  color: string;
  variantId?: string;
  hexColor?: string;
  sku?: string;
  variantImage?: string;
  product: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  trackingNumber?: string;
  isStockDeducted?: boolean;
  cancelledBy?: 'Customer' | 'Admin';
  cancelReason?: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        variantId: { type: String, default: '' },
        hexColor: { type: String, default: '#800000' },
        sku: { type: String, default: '' },
        variantImage: { type: String, default: '' },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'Razorpay / Credit Card' },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    trackingNumber: { type: String, default: '' },
    isStockDeducted: { type: Boolean, default: false },
    cancelledBy: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
    orderStatus: {
      type: String,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
