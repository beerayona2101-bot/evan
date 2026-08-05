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

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

/* Variant Routes */
router.get('/:id/variants', getProductVariants);
router.post('/:id/variants', protect, admin, addProductVariant);
router.put('/:id/variants/:variantId', protect, admin, updateProductVariant);
router.delete('/:id/variants/:variantId', protect, admin, deleteProductVariant);

export default router;
