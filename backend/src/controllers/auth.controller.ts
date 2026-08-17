import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type {
  RegisterInput,
  LoginInput,
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

// -- Register Controller --

export const register = asyncHandler(async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  const { name, email, password, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const uid = await generateUniqueUID();

  const user = new User({
    uid,
    name,
    email,
    password: hashedPassword,
    avatar: avatar || 'avatar-01',
  });

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    message: 'User registered successfully',
    user: formatFullUser(user),
    accessToken,
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
    } catch (_e) {}
  }
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
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
