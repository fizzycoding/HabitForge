import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.js';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await analyticsApi.getDashboard();
      return res;
    },
  });
}
