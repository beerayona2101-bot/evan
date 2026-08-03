import { Router } from 'express';
import { getRevenueAnalytics, exportRevenueReport } from '../controllers/revenueController';

const router = Router();

// GET /api/analytics/revenue - Fetch full aggregated financial analytics
router.get('/revenue', getRevenueAnalytics);

// GET /api/analytics/export - Export downloadable financial reports (CSV / Excel / PDF)
router.get('/export', exportRevenueReport);

export default router;
