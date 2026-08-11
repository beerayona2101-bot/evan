import request from 'supertest';
import app from '../app';
import { ProductService } from '../services/productService';
import { Product } from '../models/Product';

describe('Product Catalog & Service', () => {
  const productService = new ProductService();

  beforeEach(async () => {
    await Product.create({
      name: 'Royal Crimson Banarasi Silk Saree',
      slug: 'royal-crimson-banarasi-silk-saree',
      description: 'Handwoven pure Banarasi silk saree with gold zari work.',
      price: 24500,
      mrp: 29500,
      category: 'Banarasi Sarees',
      fabric: 'Pure Banarasi Silk',
      occasion: 'Bridal & Wedding',
      stock: 15,
      sku: 'KANCHANIKA-SAREE-100001',
      isFeatured: true,
      images: ['/images/saree1.png'],
    });

    await Product.create({
      name: 'Emerald Green Kanjivaram Silk Saree',
      slug: 'emerald-green-kanjivaram-silk-saree',
      description: 'Traditional Kanjivaram silk saree with zari border.',
      price: 18900,
      mrp: 22000,
      category: 'Kanjivaram Sarees',
      fabric: 'Kanjivaram Silk',
      occasion: 'Festive & Ceremonial',
      stock: 10,
      sku: 'KANCHANIKA-SAREE-100002',
      isFeatured: false,
      images: ['/images/saree2.png'],
    });
  });

  it('should fetch all products via GET /api/products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('should filter products by category', async () => {
    const res = await request(app).get('/api/products?category=Banarasi');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toContain('Banarasi');
  });

  it('should search products by search keyword', async () => {
    const res = await request(app).get('/api/products?search=Emerald');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toContain('Emerald');
  });

  it('should fetch featured products via service', async () => {
    const featured = await productService.getFeaturedProducts();
    expect(featured.length).toBe(1);
    expect(featured[0].name).toContain('Banarasi');
  });

  it('should fetch product by slug/id', async () => {
    const res = await request(app).get('/api/products/royal-crimson-banarasi-silk-saree');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Royal Crimson Banarasi Silk Saree');
  });

  it('should return 404 for non-existent product ID or slug', async () => {
    const res = await request(app).get('/api/products/non-existent-saree-slug');
    expect(res.status).toBe(404);
  });

  it('should create product with formatted SKU and slug', async () => {
    const newProductData = {
      name: 'Chanderi Zari Silk Saree',
      description: 'Lightweight handloom Chanderi saree.',
      price: 12500,
      category: 'Chanderi Sarees',
      fabric: 'Chanderi Silk',
      occasion: 'Partywear',
    };

    const created = await productService.createProduct(newProductData);
    expect(created.slug).toBe('chanderi-zari-silk-saree');
    expect(created.sku).toMatch(/^KANCHANIKA-SAREE-\d{6}$/);
    expect(created.price).toBe(12500);
  });
});
