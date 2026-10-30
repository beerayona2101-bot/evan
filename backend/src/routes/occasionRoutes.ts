import { Router } from 'express';
import { getOccasions, getOccasionById, createOccasion, updateOccasion, deleteOccasion } from '../controllers/occasionController';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware';

const router = Router();

const clearOccasionCache = (req: any, res: any, next: any) => {
  invalidateCache('/api/occasions');
  next();
};

router.get('/', cacheResponse(60), getOccasions);
router.get('/:id', cacheResponse(60), getOccasionById);
router.post('/', clearOccasionCache, createOccasion);
router.put('/:id', clearOccasionCache, updateOccasion);
router.delete('/:id', clearOccasionCache, deleteOccasion);

export default router;
