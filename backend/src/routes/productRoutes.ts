import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSearchSuggestions,
  getProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../controllers/productController';
import { protect, admin } from '../middleware/authMiddleware';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware';

const router = express.Router();

const clearProductCache = (req: any, res: any, next: any) => {
  invalidateCache('/api/products');
  invalidateCache('/api/homepage');
  next();
};

router.get('/', cacheResponse(60), getProducts);
router.get('/featured', cacheResponse(60), getFeaturedProducts);
router.get('/suggestions', cacheResponse(30), getSearchSuggestions);
router.get('/:id', cacheResponse(60), getProductById);
router.post('/', protect, admin, clearProductCache, createProduct);
router.put('/:id', protect, admin, clearProductCache, updateProduct);
router.delete('/:id', protect, admin, clearProductCache, deleteProduct);

/* Variant Routes */
router.get('/:id/variants', cacheResponse(60), getProductVariants);
router.post('/:id/variants', protect, admin, clearProductCache, addProductVariant);
router.put('/:id/variants/:variantId', protect, admin, clearProductCache, updateProductVariant);
router.delete('/:id/variants/:variantId', protect, admin, clearProductCache, deleteProductVariant);

export default router;
