import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.js';

export function useAnalyticsData(days: number = 30, isPro: boolean = false) {
  const dashboardQuery = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
    staleTime: 1000 * 60 * 5,
  });

  const historyQuery = useQuery({
    queryKey: ['analytics', 'history', days],
    queryFn: () => analyticsApi.getHistory(days),
    staleTime: 1000 * 60 * 5,
  });

  const heatmapQuery = useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: () => analyticsApi.getHeatmap().catch(() => ({ totalCompletions: 0, heatmap: [] })),
    enabled: isPro,
    staleTime: 1000 * 60 * 5,
  });

  const monthlyChartQuery = useQuery({
    queryKey: ['analytics', 'monthlyChart'],
    queryFn: () => analyticsApi.getMonthlyChart().catch(() => ({ monthlyData: [] })),
    enabled: isPro,
    staleTime: 1000 * 60 * 5,
  });

  const habitsAnalyticsQuery = useQuery({
    queryKey: ['analytics', 'habitsStats'],
    queryFn: () => analyticsApi.getHabitsAnalytics().catch(() => ({ habits: [] })),
    staleTime: 1000 * 60 * 5,
  });

  return {
    metrics: dashboardQuery.data?.metrics || null,
    history: historyQuery.data?.history || [],
    heatmap: heatmapQuery.data?.heatmap || [],
    monthlyChart: monthlyChartQuery.data?.monthlyData || [],
    habitsAnalytics: habitsAnalyticsQuery.data?.habits || [],
    isLoading:
      dashboardQuery.isLoading ||
      historyQuery.isLoading ||
      (isPro && heatmapQuery.isLoading) ||
      (isPro && monthlyChartQuery.isLoading) ||
      habitsAnalyticsQuery.isLoading,
  };
}
