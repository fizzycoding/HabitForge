import { api } from './client.js';
import type { Tag } from '../types/index.js';

export const tagsApi = {
  getAll: async (): Promise<{ tags: Tag[] }> => {
    const res = await api.get('/tags');
    return res.data;
  },

  create: async (data: { name: string; icon?: string; color?: string }): Promise<{ message: string; tag: Tag }> => {
    const res = await api.post('/tags', data);
    return res.data;
  },

  update: async (id: string, data: { name?: string; icon?: string; color?: string }): Promise<{ message: string; tag: Tag }> => {
    const res = await api.put(`/tags/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/tags/${id}`);
    return res.data;
  },
};
