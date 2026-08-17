import { z } from 'zod';

export const createBadgeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Badge name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Badge description is required')
    .max(300, 'Description must not exceed 300 characters'),
  icon: z
    .string()
    .trim()
    .min(1, 'Badge icon is required'),
  requirementType: z.enum(['streak', 'total_completions', 'level', 'habits_created']),
  requirementValue: z
    .number()
    .min(1, 'requirementValue must be at least 1'),
});

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
