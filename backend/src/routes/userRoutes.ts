import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
} from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.get('/addresses', protect, getUserAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

router.get('/', protect, admin, getAllUsers);

export default router;
