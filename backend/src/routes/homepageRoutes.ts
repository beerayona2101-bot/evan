import { Router } from 'express';
import {
  getHomepageCMS,
  updateHomepageCMS,
  updateHomepageSection,
  uploadCMSAsset,
} from '../controllers/homepageCMSController';

const router = Router();

// GET /api/homepage - Public / Customer endpoint
router.get('/', getHomepageCMS);

// POST/PUT /api/homepage - Admin update endpoints
router.post('/', updateHomepageCMS);
router.put('/', updateHomepageCMS);

// PATCH /api/homepage/section/:sectionKey - Update specific section
router.patch('/section/:sectionKey', updateHomepageSection);

// POST /api/homepage/upload - Upload Cloudinary asset
router.post('/upload', uploadCMSAsset);

export default router;
