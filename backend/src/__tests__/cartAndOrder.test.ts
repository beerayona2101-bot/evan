import request from 'supertest';
import app from '../app';
import { Coupon } from '../models/Coupon';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';

describe('Coupons & Orders API', () => {
  beforeEach(async () => {
    await Coupon.create({
      code: 'SILK20',
      discountType: 'percentage',
      discountAmount: 20,
      minPurchase: 5000,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    await Coupon.create({
      code: 'WELCOME1000',
      discountType: 'fixed',
      discountAmount: 1000,
      minPurchase: 3000,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
  });

  describe('POST /api/coupons/validate', () => {
    it('should calculate percentage discount correctly', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'SILK20', cartTotal: 10000 });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.discountAmount).toBe(2000);
    });

    it('should calculate fixed discount correctly', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'WELCOME1000', cartTotal: 4500 });

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.discountAmount).toBe(1000);
    });

    it('should reject coupon if minimum purchase threshold is not met', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'SILK20', cartTotal: 2500 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Minimum purchase/i);
    });

    it('should return 404 for non-existent coupon code', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'INVALIDCODE', cartTotal: 10000 });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Invalid or expired/i);
    });
  });

  describe('Order Processing', () => {
    it('should create an order successfully with shipping address and items when authenticated', async () => {
      const user = await User.create({
        name: 'Aarti Sharma',
        email: 'aarti.order@example.com',
        password: 'Password123!',
        role: 'customer',
      });

      const authToken = generateToken(user._id.toString(), 'customer');

      const sampleProduct = await Product.create({
        name: 'Kanjivaram Gold Brocade Saree',
        slug: 'kanjivaram-gold-brocade-saree',
        description: 'Heavy gold brocade work saree.',
        price: 15000,
        mrp: 18000,
        category: 'Kanjivaram Sarees',
        fabric: 'Pure Silk',
        occasion: 'Wedding',
        stock: 5,
        sku: 'KANCHANIKA-SAREE-999001',
      });

      const orderPayload = {
        orderItems: [
          {
            product: sampleProduct._id.toString(),
            name: sampleProduct.name,
            qty: 1,
            price: sampleProduct.price,
            image: sampleProduct.images[0] || '/images/saree1.png',
            size: 'Free Size',
            color: 'Gold',
          },
        ],
        shippingAddress: {
          street: 'Flat 402, Royal Palms',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
        },
        paymentMethod: 'COD',
        itemsPrice: 15000,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: 15000,
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.totalPrice).toBe(15000);

      const createdOrder = await Order.findById(res.body._id);
      expect(createdOrder).not.toBeNull();
      expect(createdOrder?.shippingAddress.street).toBe('Flat 402, Royal Palms');
      expect(createdOrder?.shippingAddress.city).toBe('Mumbai');
    });
  });
});
