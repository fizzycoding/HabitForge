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

function formatUserResponse(user: InstanceType<typeof User>) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    subscription: user.subscription,
    badges:
      user.badges?.map((b) => ({
        badgeId: b.badgeId.toString(),
        unlockedAt: b.unlockedAt,
      })) || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// -- Register Controller --

export const register = asyncHandler(async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  const { name, email, password, avatar } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
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
    user: formatUserResponse(user),
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

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  user.refreshToken = refreshToken;
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    message: 'Logged in successfully',
    user: formatUserResponse(user),
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

// -- Me Controller --

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    user: formatUserResponse(user),
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
    user: formatUserResponse(user),
  });
});
