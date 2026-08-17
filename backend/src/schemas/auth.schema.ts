import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .email()
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'), 
  avatar: z
    .enum(['avatar-01', 'avatar-02', 'avatar-03', 'avatar-04', 'avatar-05'])
    .default('avatar-01'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['free', 'monthly', 'yearly']),
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().default('avatar-01'),
  xp: z.number().default(0),
  level: z.number().default(1),
  subscription: z
    .object({
      plan: z.enum(['free', 'monthly', 'yearly']).default('free'),
      status: z.enum(['active', 'cancelled', 'expired']).default('active'),
      startDate: z.coerce.date().nullish(),
      endDate: z.coerce.date().nullish(),
    })
    .nullish(),
  badges: z
    .array(
      z.object({
        badgeId: z.string(),
        unlockedAt: z.coerce.date().nullish(),
      }),
    )
    .default([]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
