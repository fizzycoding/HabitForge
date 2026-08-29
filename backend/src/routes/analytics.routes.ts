import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getOverview,
  getHeatmap,
  getMonthlyChart,
  getMonthlyReport,
  getHistory,
  getHabitsStats,
} from '../controllers/analytics.controller.js';

const router = Router();

router.use(protect);

// Analytics Endpoints
router.get('/dashboard', getOverview);
router.get('/overview', getOverview);
router.get('/history', getHistory);
router.get('/heatmap', getHeatmap);
router.get('/monthly', getMonthlyChart);
router.get('/monthly-report', getMonthlyReport);
router.get('/habits', getHabitsStats);

export default router;
