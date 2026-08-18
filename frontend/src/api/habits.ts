import { api } from './client.js';
import type { Habit } from '../types/index.js';

export const habitsApi = {
  getAll: async (status: 'active' | 'archived' | 'all' = 'active'): Promise<{ habits: Habit[] }> => {
    const res = await api.get(`/habits?status=${status}`);
    return res.data;
  },

  getById: async (id: string): Promise<{ habit: Habit }> => {
    const res = await api.get(`/habits/${id}`);
    return res.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    frequency?: 'daily' | 'weekly';
    tags?: string[];
  }): Promise<{ message: string; habit: Habit }> => {
    const res = await api.post('/habits', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Habit>): Promise<{ message: string; habit: Habit }> => {
    const res = await api.put(`/habits/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/habits/${id}`);
    return res.data;
  },

  complete: async (id: string, dateKey?: string) => {
    const res = await api.post(`/habits/${id}/complete`, { dateKey });
    return res.data;
  },

  archive: async (id: string) => {
    const res = await api.patch(`/habits/${id}/archive`);
    return res.data;
  },

  unarchive: async (id: string) => {
    const res = await api.patch(`/habits/${id}/unarchive`);
    return res.data;
  },

  getLogs: async (id: string, page = 1, limit = 50) => {
    const res = await api.get(`/habits/${id}/logs?page=${page}&limit=${limit}`);
    return res.data;
  },
};
