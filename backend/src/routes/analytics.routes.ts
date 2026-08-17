import { Router } from 'express';
import { protect, requirePro } from '../middleware/auth.js';
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

// Free & Pro Features
router.get('/dashboard', getOverview);
router.get('/overview', getOverview);
router.get('/history', getHistory);

// Pro Features Only (Advanced Analytics, Heatmaps & Breakdown Charts)
router.get('/heatmap', requirePro, getHeatmap);
router.get('/monthly', requirePro, getMonthlyChart);
router.get('/monthly-report', requirePro, getMonthlyReport);
router.get('/habits', requirePro, getHabitsStats);

export default router;
