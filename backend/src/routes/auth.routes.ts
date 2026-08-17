import { Router } from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  login,
  refreshToken,
  logout,
  changePassword,
  updateSubscription,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema,
  changePasswordSchema,
  updateSubscriptionSchema,
} from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), resendVerification);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.patch('/subscription', protect, validate(updateSubscriptionSchema), updateSubscription);

export default router;
