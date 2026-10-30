import request from 'supertest';
import app from '../app';

describe('Backend API Scenarios Verification', () => {
  let adminToken: string;
  let customerToken: string;
  let createdProductId: string;

  it('1. Health Check Endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status.toLowerCase()).toBe('ok');
    expect(res.body.service).toBe('Aneera Silks API Service');
  });

  it('2. Auth Scenario - Customer Registration & Login', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Royal Saree Customer',
      email: 'customer@evan.com',
      password: 'Password123!',
      phone: '9876543210'
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body).toHaveProperty('token');
    customerToken = regRes.body.token;

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'customer@evan.com',
      password: 'Password123!'
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });

  it('3. Auth Scenario - Admin Authentication', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@aneerasilks.com',
      password: 'adminpassword123'
    });

    if (loginRes.status === 200) {
      adminToken = loginRes.body.token;
    } else {
      const regRes = await request(app).post('/api/auth/register').send({
        name: 'Aneera Silks Admin',
        email: 'admin@aneerasilks.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      adminToken = regRes.body.token;
    }

    expect(adminToken).toBeDefined();
  });

  it('4. Saree Product & Inventory Scenarios', async () => {
    const newProduct = {
      name: 'Kanchipuram Royal Crimson Gold Zari Saree',
      category: 'Kanchipuram',
      fabric: 'Pure Silk',
      price: 48000,
      originalPrice: 58000,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
      description: 'Handwoven pure silk Kanchipuram saree with real gold zari borders.',
      stock: 10,
      isSilkMarkCertified: true,
      colorVariants: [
        {
          colorName: 'Royal Crimson Red',
          colorHex: '#990000',
          images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
          inStock: true,
          stockCount: 5
        }
      ]
    };

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe(newProduct.name);
    createdProductId = createRes.body._id;

    const getRes = await request(app).get('/api/products');
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBeGreaterThan(0);
  });

  it('5. Cart & Order Pipeline Scenarios', async () => {
    // Authenticate customer
    const custLogin = await request(app).post('/api/auth/login').send({
      email: 'ananya@example.com',
      password: 'userpassword123'
    });
    const token = custLogin.body.token || customerToken;

    // Ensure a product exists
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Aneera Silks Royal Crimson Gold Zari Saree',
        category: 'Kanchipuram',
        fabric: 'Pure Silk',
        price: 48000,
        originalPrice: 58000,
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
        description: 'Handwoven pure silk Kanchipuram saree with real gold zari borders.',
        stock: 10,
        isSilkMarkCertified: true,
      });
    const prodId = prodRes.body?._id || createdProductId || 'prod-saree-001';

    const cartRes = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: prodId,
        quantity: 1,
        colorVariant: 'Royal Crimson Red'
      });

    expect([200, 201]).toContain(cartRes.status);

    const getCartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(getCartRes.status).toBe(200);

    const placeOrderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            product: createdProductId,
            name: 'Kanchipuram Royal Crimson Gold Zari Saree',
            quantity: 1,
            price: 48000,
            image: 'saree1.jpg',
            selectedColor: 'Royal Crimson Red'
          }
        ],
        shippingAddress: {
          fullName: 'Royal Saree Customer',
          street: '123 Atelier Street',
          city: 'Kanchipuram',
          state: 'Tamil Nadu',
          zipCode: '631501',
          country: 'India',
          phone: '9876543210'
        },
        paymentMethod: 'UPI',
        subtotal: 48000,
        gstAmount: 2400,
        shippingFee: 0,
        totalAmount: 50400
      });

    expect([200, 201]).toContain(placeOrderRes.status);
  });
});
