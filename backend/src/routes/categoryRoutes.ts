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

const router = express.Router();

router.get('/', getCategories);
router.post('/upload-image', protect, adminOnly, uploadCategoryImage);
router.post('/bulk-action', protect, adminOnly, bulkCategoryAction);
router.get('/:id', getCategoryById);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.patch('/:id/status', protect, adminOnly, patchCategoryStatus);
router.delete('/:id', protect, adminOnly, deleteCategory);
router.post('/:id/restore', protect, adminOnly, restoreCategory);
router.delete('/:id/permanent', protect, adminOnly, permanentDeleteCategory);

export default router;
