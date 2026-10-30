import { Router } from 'express';
import { getFabrics, getFabricById, createFabric, updateFabric, deleteFabric } from '../controllers/fabricController';
import { cacheResponse, invalidateCache } from '../middleware/cacheMiddleware';

const router = Router();

const clearFabricCache = (req: any, res: any, next: any) => {
  invalidateCache('/api/fabrics');
  next();
};

router.get('/', cacheResponse(60), getFabrics);
router.get('/:id', cacheResponse(60), getFabricById);
router.post('/', clearFabricCache, createFabric);
router.put('/:id', clearFabricCache, updateFabric);
router.delete('/:id', clearFabricCache, deleteFabric);

export default router;
