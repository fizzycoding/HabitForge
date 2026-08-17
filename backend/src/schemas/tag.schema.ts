import { z } from 'zod';

export const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name cannot exceed 50 characters'),
  icon: z.string().trim().default('tag'),
  color: z.string().trim().default('#6B7280'),
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tag name cannot be empty')
    .max(50, 'Tag name cannot exceed 50 characters')
    .optional(),
  icon: z.string().trim().optional(),
  color: z.string().trim().optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
