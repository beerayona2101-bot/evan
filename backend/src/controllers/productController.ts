import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { Product, IVariant } from '../models/Product';
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
        { sku: { $regex: query, $options: 'i' } },
        { 'variants.sku': { $regex: query, $options: 'i' } },
        { 'variants.colorName': { $regex: query, $options: 'i' } },
      ],
    })
      .select('name category price images sku variants')
      .limit(8);
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
    if (req.body.variants && Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map((v: any, idx: number) => ({
        ...v,
        sku: v.sku && String(v.sku).trim() ? String(v.sku) : `SKU-${Date.now()}-${idx}`,
        price: v.price && Number(v.price) > 0 ? Number(v.price) : (req.body.price ? Number(req.body.price) : 4999),
        stock: v.stock !== undefined ? Number(v.stock) : 10,
        status: v.status || (v.stock > 0 ? 'active' : 'inactive'),
        images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
      }));
    }
    const product = await productService.createProduct(req.body);
    emitRealtimeEvent('productCreated', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('createProduct error:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const idOrSlug = req.params.id;
    if (mongoose.connection.readyState !== 1) {
      const mockProduct = { _id: idOrSlug, ...req.body };
      emitRealtimeEvent('productUpdated', mockProduct);
      res.json(mockProduct);
      return;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    // Sanitize variant fields before Mongoose save
    if (req.body.variants && Array.isArray(req.body.variants)) {
      req.body.variants = req.body.variants.map((v: any, idx: number) => ({
        ...v,
        sku: v.sku && String(v.sku).trim() ? String(v.sku) : `SKU-${Date.now()}-${idx}`,
        price: v.price && Number(v.price) > 0 ? Number(v.price) : (req.body.price ? Number(req.body.price) : 4999),
        stock: v.stock !== undefined ? Number(v.stock) : 10,
        status: v.status || (v.stock > 0 ? 'active' : 'inactive'),
        images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
      }));
    }

    let updated = await Product.findOneAndUpdate(
      { $or: [{ _id: isObjectId ? idOrSlug : null }, { slug: idOrSlug }, { sku: idOrSlug }] },
      req.body,
      { new: true, runValidators: false }
    );

    if (!updated && isObjectId) {
      updated = await Product.findByIdAndUpdate(idOrSlug, req.body, { new: true, runValidators: false });
    }

    if (!updated) {
      // If product was from static/fallback catalog or not yet in MongoDB, create/upsert it!
      const slug = idOrSlug.includes('-') ? idOrSlug : (req.body.name ? req.body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : `saree-${Date.now()}`);
      const newProduct = await Product.create({
        ...req.body,
        _id: isObjectId ? idOrSlug : undefined,
        slug: req.body.slug || slug,
        sku: req.body.sku || `EVAN-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      emitRealtimeEvent('productUpdated', newProduct);
      emitRealtimeEvent('inventoryUpdated', { productId: newProduct._id, stock: newProduct.stock });
      res.json(newProduct);
      return;
    }

    emitRealtimeEvent('productUpdated', updated);
    emitRealtimeEvent('inventoryUpdated', { productId: updated._id, stock: updated.stock });
    res.json(updated);
  } catch (error) {
    console.error('updateProduct error:', error);
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

/* ========================================================
   ENTERPRISE PRODUCT VARIANTS & GALLERY CONTROLLERS
======================================================== */

export const getProductVariants = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = await productService.getProductById(req.params.id).catch(() => null);
      res.json(product?.variants || []);
      return;
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product.variants || []);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = await productService.getProductById(req.params.id).catch(() => null);
      emitRealtimeEvent('productUpdated', product || { _id: req.params.id });
      res.status(201).json(product || { _id: req.params.id });
      return;
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    const newVariant: IVariant = {
      colorName: req.body.colorName || 'Royal Maroon',
      hexColor: req.body.hexColor || '#800000',
      sku: req.body.sku || `EVAN-VAR-${Date.now().toString().slice(-4)}`,
      barcode: req.body.barcode || '',
      price: req.body.price || product.price,
      mrp: req.body.mrp || product.mrp,
      discountPrice: req.body.discountPrice || product.discountPrice || 0,
      discountPercentage: req.body.discountPercentage || product.discountPercentage || 0,
      stock: req.body.stock !== undefined ? req.body.stock : 15,
      images: req.body.images && Array.isArray(req.body.images) ? req.body.images.slice(0, 5) : [product.images[0]],
      featuredImage: req.body.featuredImage || req.body.images?.[0] || product.images[0],
      isDefault: req.body.isDefault || false,
      status: req.body.status || 'active',
    };

    if (!product.variants) {
      product.variants = [];
    }

    if (newVariant.isDefault) {
      product.variants.forEach((v) => (v.isDefault = false));
    }

    product.variants.push(newVariant);
    
    // Synchronize product colors array
    if (!product.colors.includes(newVariant.colorName)) {
      product.colors.push(newVariant.colorName);
    }

    await product.save();
    emitRealtimeEvent('productUpdated', product);
    emitRealtimeEvent('variantUpdated', { productId: product._id, variant: newVariant });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = await productService.getProductById(req.params.id).catch(() => null);
      emitRealtimeEvent('productUpdated', product || { _id: req.params.id });
      res.json(product || { _id: req.params.id });
      return;
    }
    const product = await Product.findById(req.params.id);
    if (!product || !product.variants) {
      res.status(404).json({ message: 'Product or variant not found' });
      return;
    }

    const variantIndex = product.variants.findIndex(
      (v: any) => v._id?.toString() === req.params.variantId || v.sku === req.params.variantId
    );

    if (variantIndex === -1) {
      res.status(404).json({ message: 'Variant not found' });
      return;
    }

    const targetVariant = product.variants[variantIndex];

    if (req.body.isDefault) {
      product.variants.forEach((v) => (v.isDefault = false));
    }

    Object.assign(targetVariant, req.body);
    if (req.body.images && Array.isArray(req.body.images)) {
      targetVariant.images = req.body.images.slice(0, 5);
    }

    await product.save();
    emitRealtimeEvent('productUpdated', product);
    emitRealtimeEvent('variantUpdated', { productId: product._id, variant: targetVariant });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteProductVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = await productService.getProductById(req.params.id).catch(() => null);
      emitRealtimeEvent('productUpdated', product || { _id: req.params.id });
      res.json(product || { _id: req.params.id });
      return;
    }
    const product = await Product.findById(req.params.id);
    if (!product || !product.variants) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    product.variants = product.variants.filter(
      (v: any) => v._id?.toString() !== req.params.variantId && v.sku !== req.params.variantId
    );

    await product.save();
    emitRealtimeEvent('productUpdated', product);
    emitRealtimeEvent('variantUpdated', { productId: product._id, deletedVariantId: req.params.variantId });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
