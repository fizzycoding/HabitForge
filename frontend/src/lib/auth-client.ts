import { createAuthClient } from 'better-auth/react';

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://habitforge-ldjc.onrender.com';

export const authClient = createAuthClient({
  baseURL: SERVER_URL,
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem('better-auth.session_token') || undefined,
    },
  },
});
