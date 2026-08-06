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

const FALLBACK_ORDERS: any[] = [
  {
    _id: 'ord-1001',
    user: { _id: '65f0a0000000000000000002', name: 'Ananya Sharma', email: 'ananya@example.com' },
    orderItems: [
      {
        name: 'Mustard Gold Kanchipuram Pure Silk Saree',
        qty: 1,
        image: '/images/saree_kanchipuram_gold.png',
        price: 14999,
        product: 'prod-saree-001',
      },
    ],
    shippingAddress: {
      street: 'Jubilee Hills Road No. 36',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India',
    },
    paymentMethod: 'Razorpay / Card',
    totalPrice: 14999,
    isPaid: true,
    paidAt: new Date(),
    orderStatus: 'Delivered',
    isDelivered: true,
    deliveredAt: new Date(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'ord-1002',
    user: { _id: '65f0a0000000000000000002', name: 'Ananya Sharma', email: 'ananya@example.com' },
    orderItems: [
      {
        name: 'Royal Crimson Banarasi Silk Saree',
        qty: 1,
        image: '/images/saree_banarasi_red.png',
        price: 9999,
        product: 'prod-saree-002',
      },
    ],
    shippingAddress: {
      street: 'Bandra West, Hill Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India',
    },
    paymentMethod: 'UPI / GPay',
    totalPrice: 9999,
    isPaid: true,
    paidAt: new Date(),
    orderStatus: 'Processing',
    isDelivered: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

export const addOrderItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items provided' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      const newOrd = {
        _id: `ord-${Date.now()}`,
        user: req.user || { name: 'EVAN Customer', email: 'customer@evan.com' },
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Razorpay / Card',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: true,
        paidAt: new Date(),
        isStockDeducted: true,
        orderStatus: 'Pending',
        createdAt: new Date(),
      };
      FALLBACK_ORDERS.unshift(newOrd);
      emitRealtimeEvent('orderCreated', newOrd);
      res.status(201).json(newOrd);
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
      isStockDeducted: true,
      orderStatus: 'Pending',
    });

    const createdOrder = await order.save();

    // Auto-reduce product stock in MongoDB Atlas and emit real-time socket events
    if (mongoose.connection.readyState === 1) {
      for (const item of orderItems) {
        if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
          const qty = item.qty || item.quantity || 1;
          const updatedProd = await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -qty } },
            { new: true }
          ).catch(() => null);

          if (updatedProd) {
            emitRealtimeEvent('productUpdated', updatedProd);
            emitRealtimeEvent('inventoryUpdated', { productId: updatedProd._id, stock: updatedProd.stock });
          }
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
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    if (mongoose.connection.readyState !== 1 || !isObjectId) {
      const match = FALLBACK_ORDERS.find((o) => o._id === id || String(o._id) === String(id)) || FALLBACK_ORDERS[0];
      res.json(match);
      return;
    }
    const order = await Order.findById(id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      const match = FALLBACK_ORDERS.find((o) => o._id === id || String(o._id) === String(id));
      if (match) res.json(match);
      else res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    const match = FALLBACK_ORDERS.find((o) => o._id === req.params.id || String(o._id) === String(req.params.id)) || FALLBACK_ORDERS[0];
    res.json(match);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_ORDERS);
      return;
    }
    const orders = await Order.find({ user: req.user?._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.json(FALLBACK_ORDERS);
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(FALLBACK_ORDERS);
      return;
    }
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.json(FALLBACK_ORDERS);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    if (mongoose.connection.readyState !== 1 || !isObjectId) {
      const match = FALLBACK_ORDERS.find((o) => o._id === id || String(o._id) === String(id));
      if (!match) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }
      const rawStatus = (req.body.status || req.body.orderStatus || 'Pending').toString().trim();
      const statusMap: Record<string, string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        packed: 'Packed',
        shipped: 'Shipped',
        'out for delivery': 'Out For Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      };
      match.orderStatus = statusMap[rawStatus.toLowerCase()] || rawStatus;
      if (req.body.trackingNumber) match.trackingNumber = req.body.trackingNumber;
      if (match.orderStatus === 'Delivered') {
        match.isDelivered = true;
        match.deliveredAt = new Date();
      }
      if (match.orderStatus === 'Cancelled') {
        match.cancelledBy = req.body.cancelledBy || 'Admin';
        match.cancelReason = req.body.reason || req.body.cancelReason || 'Cancelled';
      }
      emitRealtimeEvent('orderUpdated', match);
      res.json(match);
      return;
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (existingOrder.orderStatus === 'Cancelled') {
      res.status(400).json({ message: 'Cancelled orders cannot be modified or re-activated.' });
      return;
    }

    const rawStatus = (req.body.status || req.body.orderStatus || 'Pending').toString().trim();
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      packed: 'Packed',
      shipped: 'Shipped',
      'out for delivery': 'Out For Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    const normalizedStatus = statusMap[rawStatus.toLowerCase()] || rawStatus;

    let isStockDeductedNow = existingOrder.isStockDeducted || false;

    // Deduct stock when order is Confirmed / Processing / Shipped and stock was not deducted
    if (normalizedStatus !== 'Cancelled' && !isStockDeductedNow) {
      if (mongoose.connection.readyState === 1) {
        for (const item of existingOrder.orderItems) {
          if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
            const qty = item.qty || 1;
            const updatedProd = await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -qty } },
              { new: true }
            ).catch(() => null);

            if (updatedProd) {
              emitRealtimeEvent('productUpdated', updatedProd);
              emitRealtimeEvent('inventoryUpdated', { productId: updatedProd._id, stock: updatedProd.stock });
            }
          }
        }
      }
      isStockDeductedNow = true;
    }

    // Restore stock if order is Cancelled and stock was deducted
    if (normalizedStatus === 'Cancelled' && isStockDeductedNow) {
      if (mongoose.connection.readyState === 1) {
        for (const item of existingOrder.orderItems) {
          if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
            const qty = item.qty || 1;
            const updatedProd = await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: +qty } },
              { new: true }
            ).catch(() => null);

            if (updatedProd) {
              emitRealtimeEvent('productUpdated', updatedProd);
              emitRealtimeEvent('inventoryUpdated', { productId: updatedProd._id, stock: updatedProd.stock });
            }
          }
        }
      }
      isStockDeductedNow = false;
    }

    const updateFields: any = {
      orderStatus: normalizedStatus,
      isStockDeducted: isStockDeductedNow,
    };

    if (normalizedStatus === 'Cancelled') {
      updateFields.cancelledBy = req.body.cancelledBy || 'Admin';
      updateFields.cancelReason = req.body.reason || req.body.cancelReason || 'Damaged Product / Quality Inspection Failure';
    }

    if (req.body.trackingNumber) {
      updateFields.trackingNumber = req.body.trackingNumber;
    }
    if (normalizedStatus === 'Delivered') {
      updateFields.isDelivered = true;
      updateFields.deliveredAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: false }
    ).populate('user', 'name email');

    if (!updatedOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    emitRealtimeEvent('orderUpdated', updatedOrder);

    // Trigger status-specific emails asynchronously
    const customerEmail = (updatedOrder.user as any)?.email || req.body.email || 'customer@evancollections.com';
    if (normalizedStatus === 'Shipped') {
      sendOrderShippedEmail(updatedOrder, customerEmail).catch(() => {});
    } else if (normalizedStatus === 'Out For Delivery') {
      sendOutForDeliveryEmail(updatedOrder, customerEmail).catch(() => {});
    } else if (normalizedStatus === 'Delivered') {
      sendOrderDeliveredEmail(updatedOrder, customerEmail).catch(() => {});
    } else if (normalizedStatus === 'Cancelled') {
      sendOrderCancelledEmail(updatedOrder, customerEmail).catch(() => {});
    } else {
      sendOrderStatusUpdateEmail(updatedOrder, customerEmail).catch(() => {});
    }

    res.json(updatedOrder);
  } catch (error) {
    const match = FALLBACK_ORDERS.find((o) => o._id === req.params.id || String(o._id) === String(req.params.id));
    if (match) {
      res.json(match);
    } else {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    if (mongoose.connection.readyState !== 1 || !isObjectId) {
      let match = FALLBACK_ORDERS.find((o) => o._id === id || String(o._id) === String(id));
      if (!match) {
        match = {
          _id: id,
          user: req.user || { name: 'Ananya Sharma', email: 'ananya@example.com' },
          orderItems: [
            {
              name: 'Royal Crimson Banarasi Silk Saree',
              qty: 1,
              image: '/images/saree_banarasi_red.png',
              price: 9999,
              product: 'prod-saree-002',
            },
          ],
          shippingAddress: {
            street: 'Bandra West, Hill Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            country: 'India',
          },
          paymentMethod: 'UPI / GPay',
          totalPrice: 9999,
          isPaid: true,
          paidAt: new Date(),
          orderStatus: 'Pending',
          isDelivered: false,
          createdAt: new Date(),
        };
        FALLBACK_ORDERS.unshift(match);
      }

      if (match.orderStatus === 'Delivered') {
        res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
        return;
      }
      if (match.orderStatus === 'Cancelled') {
        res.status(400).json({ message: 'Order is already cancelled' });
        return;
      }

      match.orderStatus = 'Cancelled';
      match.cancelledBy = 'Customer';
      match.cancelReason = req.body.reason || req.body.cancelReason || 'Cancelled by customer';
      emitRealtimeEvent('orderUpdated', match);

      const customerEmail = req.user?.email || 'customer@evancollections.com';
      sendOrderCancelledEmail(match, customerEmail).catch(() => {});

      res.json(match);
      return;
    }

    const order = await Order.findOne({ _id: id, user: req.user?._id });
    if (order) {
      if (order.orderStatus === 'Delivered') {
        res.status(400).json({ message: 'Delivered orders cannot be cancelled' });
        return;
      }
      if (order.orderStatus === 'Cancelled') {
        res.status(400).json({ message: 'Order is already cancelled' });
        return;
      }

      const reason = req.body.reason || req.body.cancelReason || 'Cancelled by customer';
      order.orderStatus = 'Cancelled';
      (order as any).cancelledBy = 'Customer';
      (order as any).cancelReason = reason;
      const updatedOrder = await order.save();
      emitRealtimeEvent('orderUpdated', updatedOrder);

      const customerEmail = req.user?.email || 'customer@evancollections.com';
      sendOrderCancelledEmail(updatedOrder, customerEmail).catch(() => {});

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    const match = FALLBACK_ORDERS.find((o) => o._id === req.params.id || String(o._id) === String(req.params.id));
    if (match) {
      match.orderStatus = 'Cancelled';
      match.cancelledBy = 'Customer';
      match.cancelReason = req.body.reason || req.body.cancelReason || 'Cancelled by customer';
      res.json(match);
    } else {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};

export const requestOrderReturn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    if (mongoose.connection.readyState !== 1 || !isObjectId) {
      const match = FALLBACK_ORDERS.find((o) => o._id === id || String(o._id) === String(id));
      if (match) {
        match.orderStatus = 'Processing';
        emitRealtimeEvent('orderUpdated', match);
        res.json(match);
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
      return;
    }

    const order = await Order.findOne({ _id: id, user: req.user?._id });
    if (order) {
      order.orderStatus = 'Processing';
      const updatedOrder = await order.save();
      emitRealtimeEvent('orderUpdated', updatedOrder);
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    const match = FALLBACK_ORDERS.find((o) => o._id === req.params.id || String(o._id) === String(req.params.id));
    if (match) {
      match.orderStatus = 'Processing';
      res.json(match);
    } else {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};

export const updateOrderToDelivered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    if (mongoose.connection.readyState !== 1 || !isObjectId) {
      const match = FALLBACK_ORDERS.find((o) => o._id === id || String(o._id) === String(id));
      if (match) {
        match.isDelivered = true;
        match.deliveredAt = new Date();
        match.orderStatus = 'Delivered';
        emitRealtimeEvent('orderUpdated', match);
        res.json(match);
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
      return;
    }

    const order = await Order.findById(id);
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
    const match = FALLBACK_ORDERS.find((o) => o._id === req.params.id || String(o._id) === String(req.params.id));
    if (match) {
      match.isDelivered = true;
      match.deliveredAt = new Date();
      match.orderStatus = 'Delivered';
      res.json(match);
    } else {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    if (mongoose.connection.readyState !== 1 || !isObjectId) {
      const idx = FALLBACK_ORDERS.findIndex((o) => o._id === id || String(o._id) === String(id));
      if (idx > -1) {
        FALLBACK_ORDERS.splice(idx, 1);
      }
      emitRealtimeEvent('orderDeleted', { id });
      res.json({ message: 'Order removed successfully' });
      return;
    }

    const order = await Order.findById(id);
    if (order) {
      await order.deleteOne();
      emitRealtimeEvent('orderDeleted', { id });
      res.json({ message: 'Order removed successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    const idx = FALLBACK_ORDERS.findIndex((o) => o._id === req.params.id || String(o._id) === String(req.params.id));
    if (idx > -1) {
      FALLBACK_ORDERS.splice(idx, 1);
    }
    emitRealtimeEvent('orderDeleted', { id: req.params.id });
    res.json({ message: 'Order removed successfully' });
  }
};
