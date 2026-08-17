import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Habit name is required')
    .max(100, 'Name must not exceed 100 characters'),
  description: z.string().trim().max(500).optional().default(''),
  icon: z.string().trim().optional().default('target'),
  color: z.string().trim().optional().default('#3B82F6'),
  frequency: z.enum(['daily', 'weekly']).optional().default('daily'),
  tags: z.array(z.string()).optional().default([]),
});

export const updateHabitSchema = createHabitSchema.partial();

export const completeHabitSchema = z.object({
  dateKey: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dateKey must be in YYYY-MM-DD format')
    .optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>;
