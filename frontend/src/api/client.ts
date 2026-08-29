import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://habitforge-ldjc.onrender.com';

export const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
