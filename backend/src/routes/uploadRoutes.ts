import express from 'express';
import { uploadImage } from '../controllers/uploadController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, adminOnly, uploadImage);

export default router;
