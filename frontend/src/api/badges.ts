import { api } from './client.js';
import type { Badge } from '../types/index.js';

export const badgesApi = {
  getAll: async (): Promise<{ badges: Badge[] }> => {
    const res = await api.get('/badges');
    return res.data;
  },

  seed: async () => {
    const res = await api.post('/badges/seed');
    return res.data;
  },
};
