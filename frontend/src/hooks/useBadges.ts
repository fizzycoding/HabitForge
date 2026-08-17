import { useQuery } from '@tanstack/react-query';
import { badgesApi } from '../api/badges.js';

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await badgesApi.getAll();
      return res.badges;
    },
  });
}
