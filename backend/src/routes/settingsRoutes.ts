import express from 'express';
import { getWhatsAppSettings, updateWhatsAppSettings } from '../controllers/settingsController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/whatsapp', getWhatsAppSettings);
router.put('/whatsapp', protect, admin, updateWhatsAppSettings);

export default router;
