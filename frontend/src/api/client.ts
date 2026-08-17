import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
