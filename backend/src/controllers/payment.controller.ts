import type { Response } from 'express';
import {
  createOrder as createOrderService,
  verifyPayment as verifyPaymentService,
} from '../services/payment.service.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { CreateOrderInput, VerifyPaymentInput } from '../schemas/payment.schema.js';

export const getRazorpayKey = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json({ keyId: env.RAZORPAY_KEY_ID });
});

export const createRazorpayOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const order = await createOrderService(userId, req.body as CreateOrderInput);
  res.status(201).json(order);
});

export const verifyRazorpayPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const result = await verifyPaymentService(userId, req.body as VerifyPaymentInput);
  res.json(result);
});
