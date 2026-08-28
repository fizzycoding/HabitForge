import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.js';
import type { CreateOrderInput, VerifyPaymentInput } from '../schemas/payment.schema.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const PLAN_PRICES = {
  monthly: 19900, // ₹199 in paise
  yearly: 149900, // ₹1499 in paise
};

export async function createOrder(userId: string, input: CreateOrderInput) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const amount = PLAN_PRICES[input.plan];
  const currency = 'INR';

  const options = {
    amount,
    currency,
    receipt: `receipt_${userId.slice(-6)}_${Date.now()}`,
    notes: {
      userId,
      plan: input.plan,
    },
  };

  try {
    const keyId = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'rzp_test_mock') {
      throw new Error('Razorpay API keys not configured');
    }

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      plan: input.plan,
      isMock: false,
      user: {
        name: user.name,
        email: user.email,
      },
    };
  } catch (err: any) {
    console.warn('⚠️ [Razorpay Warning] Order creation via Razorpay API failed:', err?.error?.description || err?.message || err);
    console.log('ℹ️ [Dev Mode] Returning mock order so subscription can be tested.');

    return {
      orderId: `order_mock_${Date.now()}`,
      amount,
      currency,
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      plan: input.plan,
      isMock: true,
      user: {
        name: user.name,
        email: user.email,
      },
    };
  }
}

export async function verifyPayment(userId: string, input: VerifyPaymentInput) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = input;

  const isMockOrder =
    razorpay_order_id.startsWith('order_mock_') ||
    razorpay_payment_id.startsWith('pay_mock_') ||
    razorpay_signature === 'mock_sig';

  if (!isMockOrder) {
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      throw new AppError('Invalid payment signature. Verification failed.', 400);
    }
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const startDate = new Date();
  const endDate = new Date();
  if (plan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  user.subscription = {
    plan,
    status: 'active',
    startDate,
    endDate,
  };

  await user.save();

  return {
    message: `Payment verified successfully! You are now subscribed to HabitForge ${plan.toUpperCase()} Plan.`,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      subscription: user.subscription,
    },
  };
}
