import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, verifyPaymentSchema } from '../schemas/payment.schema.js';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/payment.controller.js';

const router = Router();

router.use(protect);

router.get('/key', getRazorpayKey);
router.post('/create-order', validate(createOrderSchema), createRazorpayOrder);
router.post('/verify', validate(verifyPaymentSchema), verifyRazorpayPayment);

export default router;
