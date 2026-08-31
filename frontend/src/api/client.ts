import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://habitforge-ldjc.onrender.com';

export const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('better-auth.session_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
