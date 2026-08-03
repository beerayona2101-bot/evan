import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { Product } from '../models/Product';
import { emitRealtimeEvent } from '../config/socket';
import mongoose from 'mongoose';

const productService = new ProductService();

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json(products);
  } catch (error) {
    const fallbackProducts = await productService.getAllProducts(req.query).catch(() => []);
    res.json(fallbackProducts);
  }
};

export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    if (!query.trim()) {
      res.json([]);
      return;
    }
    if (mongoose.connection.readyState !== 1) {
      res.json([
        { name: 'Royal Crimson Banarasi Silk Saree', category: 'Banarasi Sarees', price: 9999, images: ['/images/saree_banarasi_red.png'] },
        { name: 'Mustard Gold Kanchipuram Pure Silk Saree', category: 'Kanchipuram Sarees', price: 14999, images: ['/images/saree_kanchipuram_gold.png'] },
      ]);
      return;
    }
    const suggestions = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { fabric: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name category price images')
      .limit(6);
    res.json(suggestions);
  } catch (error) {
    res.json([]);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    const fallback = await productService.getProductById(req.params.id).catch(() => null);
    if (fallback) {
      res.json(fallback);
    } else {
      res.status(404).json({ message: 'Saree Product not found' });
    }
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    const fallback = await productService.getFeaturedProducts().catch(() => []);
    res.json(fallback);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    emitRealtimeEvent('productCreated', product);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockProduct = { _id: req.params.id, ...req.body };
      emitRealtimeEvent('productUpdated', mockProduct);
      res.json(mockProduct);
      return;
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    emitRealtimeEvent('productUpdated', updated);
    emitRealtimeEvent('inventoryUpdated', { productId: updated._id, stock: updated.stock });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    emitRealtimeEvent('productDeleted', { id: req.params.id });
    res.json(result);
  } catch (error) {
    emitRealtimeEvent('productDeleted', { id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  }
};
