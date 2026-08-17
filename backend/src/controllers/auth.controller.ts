import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateSubscriptionInput,
} from '../schemas/auth.schema.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../utils/jwt.js';
import { generateUniqueUID } from '../utils/uid.js';
import { formatFullUser } from '../services/user.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

// -- Register Controller --

export const register = asyncHandler(async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  const { name, email, password, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const uid = await generateUniqueUID();

  // Generate 6-digit OTP & verification token
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = new User({
    uid,
    name,
    email,
    password: hashedPassword,
    avatar: avatar || 'avatar-01',
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  user.refreshToken = refreshToken;
  await user.save();

  // Send Email via Resend
  await sendVerificationEmail({
    to: email,
    name,
    token: verificationToken,
    otp: otpCode,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    message: 'Registration successful! Verification email sent.',
    user: formatFullUser(user),
    accessToken,
    verificationToken,
    otp: otpCode,
  });
});

// -- Verify Email Controller --

export const verifyEmail = asyncHandler(async (req: Request<{}, {}, VerifyEmailInput>, res: Response) => {
  const { token, code } = req.body;
  const matchToken = token || code;

  const user = await User.findOne({
    emailVerificationToken: matchToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw new AppError('Invalid or expired verification code/token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    message: 'Email verified successfully!',
    user: formatFullUser(user),
  });
});

// -- Resend Verification Email --

export const resendVerification = asyncHandler(async (req: Request<{}, {}, ResendVerificationInput>, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');
  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = verificationExpires;
  await user.save();

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token: verificationToken,
    otp: otpCode,
  });

  res.json({
    message: 'Verification email resent successfully.',
    verificationToken,
    otp: otpCode,
  });
});

// -- Forgot Password Controller --

export const forgotPassword = asyncHandler(async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) {
    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    token: resetToken,
  });

  res.json({
    message: 'Password reset link sent to your email.',
    resetToken,
  });
});

// -- Reset Password Controller --

export const resetPassword = asyncHandler(async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new AppError('Invalid or expired password reset token', 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    message: 'Password has been reset successfully. You can now log in.',
  });
});

// -- Login Controller --

export const login = asyncHandler(async (req: Request<{}, {}, LoginInput>, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.uid) {
    user.uid = await generateUniqueUID();
  }

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    message: 'Logged in successfully',
    user: formatFullUser(user),
    accessToken,
  });
});

// -- Refresh Token Controller --

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new AppError('Refresh token required', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (_err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token revoked or invalid', 401);
  }

  const userId = user._id.toString();
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  user.refreshToken = newRefreshToken;
  await user.save();

  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.json({
    message: 'Token refreshed successfully',
    accessToken: newAccessToken,
  });
});

// -- Logout Controller --

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } });
    } catch (_e) { }
  }
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// -- Change Password Controller --

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body as ChangePasswordInput;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({
    message: 'Password changed successfully',
  });
});

// -- Update Subscription Controller --

export const updateSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { plan } = req.body as UpdateSubscriptionInput;
  const userId = req.user!.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.subscription = {
    plan,
    status: 'active',
    startDate: new Date(),
    endDate: plan === 'free' ? undefined : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  };

  await user.save();

  res.json({
    message: `Subscription updated to ${plan} plan successfully`,
    user: formatFullUser(user),
  });
});
