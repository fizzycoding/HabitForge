import type { Response } from 'express';
import {
  getDashboardOverview,
  getYearlyHeatmap,
  getMonthlyChartAnalysis,
  getMonthlyDailyReport,
  getCompletionHistory,
  getHabitsAnalytics,
} from '../services/analytics.service.js';
import { asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const overview = await getDashboardOverview(userId);
  res.json(overview);
});

export const getHeatmap = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const heatmapData = await getYearlyHeatmap(userId);
  res.json(heatmapData);
});

export const getMonthlyChart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const monthlyData = await getMonthlyChartAnalysis(userId);
  res.json({ monthlyData });
});

export const getMonthlyReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const monthStr = (req.query.month || req.query.date) as string | undefined;
  const report = await getMonthlyDailyReport(userId, monthStr);
  res.json(report);
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const history = await getCompletionHistory(userId, days);
  res.json({ days, history });
});

export const getHabitsStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habits = await getHabitsAnalytics(userId);
  res.json({ habits });
});
