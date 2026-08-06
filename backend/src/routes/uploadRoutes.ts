import express from 'express';
import { uploadImage } from '../controllers/uploadController';
<<<<<<< HEAD
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, adminOnly, uploadImage);
=======
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, uploadImage);
>>>>>>> e82de53 (color and ui changed)

export default router;
