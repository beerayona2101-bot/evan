import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  patchCategoryStatus,
  deleteCategory,
  restoreCategory,
  permanentDeleteCategory,
  uploadCategoryImage,
  bulkCategoryAction,
} from '../controllers/categoryController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware';

const router = express.Router();

const clearCategoryCache = (req: any, res: any, next: any) => {
  invalidateCache('/api/categories');
  invalidateCache('/api/homepage');
  next();
};

router.get('/', cacheResponse(60), getCategories);
router.post('/upload-image', protect, adminOnly, uploadCategoryImage);
router.post('/bulk-action', protect, adminOnly, clearCategoryCache, bulkCategoryAction);
router.get('/:id', cacheResponse(60), getCategoryById);
router.post('/', protect, adminOnly, clearCategoryCache, createCategory);
router.put('/:id', protect, adminOnly, clearCategoryCache, updateCategory);
router.patch('/:id/status', protect, adminOnly, clearCategoryCache, patchCategoryStatus);
router.delete('/:id', protect, adminOnly, clearCategoryCache, deleteCategory);
router.post('/:id/restore', protect, adminOnly, clearCategoryCache, restoreCategory);
router.delete('/:id/permanent', protect, adminOnly, clearCategoryCache, permanentDeleteCategory);

export default router;
