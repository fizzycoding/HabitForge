import { api } from './client.js';
import type { User } from '../types/index.js';

export const authApi = {
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
    }
    return res.data;
  },

  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    if (res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
    }
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; avatar?: string }): Promise<{ message: string; user: User }> => {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  },

  getPublicProfile: async (uid: string) => {
    const res = await api.get(`/users/${uid}`);
    return res.data;
  },

  updateSubscription: async (plan: 'free' | 'monthly' | 'yearly') => {
    const res = await api.patch('/auth/subscription', { plan });
    return res.data;
  },
};
