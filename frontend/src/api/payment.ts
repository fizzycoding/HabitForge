import { api } from './client.js';

export const paymentApi = {
  getKey: async (): Promise<{ keyId: string }> => {
    const res = await api.get('/payment/key');
    return res.data;
  },

  createOrder: async (plan: 'monthly' | 'yearly') => {
    const res = await api.post('/payment/create-order', { plan });
    return res.data;
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: 'monthly' | 'yearly';
  }) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },
};
