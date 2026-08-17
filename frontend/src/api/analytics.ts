import { api } from './client.js';
import type { DashboardMetrics, HeatmapDay } from '../types/index.js';

export const analyticsApi = {
  getDashboard: async (): Promise<{ user: any; metrics: DashboardMetrics }> => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },

  getHistory: async (days = 30) => {
    const res = await api.get(`/analytics/history?days=${days}`);
    return res.data;
  },

  getHeatmap: async (): Promise<{ totalCompletions: number; heatmap: HeatmapDay[] }> => {
    const res = await api.get('/analytics/heatmap');
    return res.data;
  },

  getMonthlyReport: async (month?: string) => {
    const query = month ? `?month=${month}` : '';
    const res = await api.get(`/analytics/monthly-report${query}`);
    return res.data;
  },

  getMonthlyChart: async () => {
    const res = await api.get('/analytics/monthly');
    return res.data;
  },

  getHabitsAnalytics: async () => {
    const res = await api.get('/analytics/habits');
    return res.data;
  },
};
