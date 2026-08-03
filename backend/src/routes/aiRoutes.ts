import { Router } from 'express';
import { getStylistAdvice, getSizeRecommendation } from '../controllers/aiController';

const router = Router();

router.post('/stylist', getStylistAdvice);
router.post('/size-recommendation', getSizeRecommendation);

export default router;
