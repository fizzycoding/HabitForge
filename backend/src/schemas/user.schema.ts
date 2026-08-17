import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  avatar: z
    .enum(['avatar-01', 'avatar-02', 'avatar-03', 'avatar-04', 'avatar-05'])
    .optional(),
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['free', 'monthly', 'yearly']),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

export interface AuthUser {
  id: string;
  uid?: string;
  email: string;
  name: string;
  avatar: string;
  isEmailVerified: boolean;
  xp: number;
  level: number;
  subscription?: {
    plan: 'free' | 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date | null;
    endDate?: Date | null;
  } | null;
  badges?: Array<{
    badgeId: string;
    unlockedAt?: Date | null;
  }>;
}
