import { Router } from 'express';
import {
  getHomepageCMS,
  updateHomepageCMS,
  updateHomepageSection,
  uploadCMSAsset,
} from '../controllers/homepageCMSController';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware';

const router = Router();

const clearCMSCache = (req: any, res: any, next: any) => {
  invalidateCache('/api/homepage');
  next();
};

// GET /api/homepage - Public / Customer endpoint
router.get('/', cacheResponse(60), getHomepageCMS);

// POST/PUT /api/homepage - Admin update endpoints
router.post('/', clearCMSCache, updateHomepageCMS);
router.put('/', clearCMSCache, updateHomepageCMS);

// PATCH /api/homepage/section/:sectionKey - Update specific section
router.patch('/section/:sectionKey', clearCMSCache, updateHomepageSection);

// POST /api/homepage/upload - Upload Cloudinary asset
router.post('/upload', uploadCMSAsset);

export default router;
