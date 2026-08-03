import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';
import { emitRealtimeEvent } from '../config/socket';
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendPaymentSuccessEmail,
  sendOrderShippedEmail,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from '../utils/sendEmail';
import mongoose from 'mongoose';

export const addOrderItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items provided' });
      return;
    }

    const order = new Order({
      user: req.user?._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Razorpay / Card',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      orderStatus: 'Pending',
    });

    const createdOrder = await order.save();

    // Auto-reduce product stock in MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      for (const item of orderItems) {
        if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          const qty = item.qty || item.quantity || 1;
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -qty } }).catch(() => {});
        }
      }
    }

    emitRealtimeEvent('orderCreated', createdOrder);

    // Send Nodemailer HTML Order Confirmation & Payment Receipts asynchronously
    const customerEmail = req.user?.email || req.body.email || 'customer@evancollections.com';
    sendOrderConfirmationEmail(createdOrder, customerEmail).catch(() => {});
    sendPaymentSuccessEmail(createdOrder, customerEmail).catch(() => {});

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      const newStatus = req.body.status || order.orderStatus;
      order.orderStatus = newStatus;
      if (req.body.trackingNumber) {
        order.trackingNumber = req.body.trackingNumber;
      }
      if (newStatus === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }
      const updatedOrder = await order.save();
      emitRealtimeEvent('orderUpdated', updatedOrder);

      // Trigger status-specific emails
      const customerEmail = (updatedOrder.user as any)?.email || req.body.email || 'customer@evancollections.com';
      if (newStatus === 'Shipped') {
        sendOrderShippedEmail(updatedOrder, customerEmail).catch(() => {});
      } else if (newStatus === 'Out For Delivery') {
        sendOutForDeliveryEmail(updatedOrder, customerEmail).catch(() => {});
      } else if (newStatus === 'Delivered') {
        sendOrderDeliveredEmail(updatedOrder, customerEmail).catch(() => {});
      } else if (newStatus === 'Cancelled') {
        sendOrderCancelledEmail(updatedOrder, customerEmail).catch(() => {});
      } else {
        sendOrderStatusUpdateEmail(updatedOrder, customerEmail).catch(() => {});
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user?._id });
    if (order) {
      if (order.orderStatus === 'Delivered') {
        res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
        return;
      }
      order.orderStatus = 'Cancelled';
      const updatedOrder = await order.save();
      emitRealtimeEvent('orderUpdated', updatedOrder);

      const customerEmail = req.user?.email || 'customer@evancollections.com';
      sendOrderCancelledEmail(updatedOrder, customerEmail).catch(() => {});

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const requestOrderReturn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user?._id });
    if (order) {
      order.orderStatus = 'Processing';
      const updatedOrder = await order.save();
      emitRealtimeEvent('orderUpdated', updatedOrder);
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateOrderToDelivered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.orderStatus = 'Delivered';
      const updatedOrder = await order.save();
      emitRealtimeEvent('orderUpdated', updatedOrder);
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
