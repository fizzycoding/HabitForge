import type { Response } from 'express';
import {
  getUserTags as getUserTagsService,
  createTag as createTagService,
  updateTag as updateTagService,
  deleteTag as deleteTagService,
} from '../services/tag.service.js';
import { asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { CreateTagInput, UpdateTagInput } from '../schemas/tag.schema.js';

export const getUserTags = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const tags = await getUserTagsService(userId);
  res.json({ tags });
});

export const createTag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const tag = await createTagService(userId, req.body as CreateTagInput);
  res.status(201).json({ message: 'Tag created successfully', tag });
});

export const updateTag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const tagId = req.params.id as string;
  const tag = await updateTagService(userId, tagId, req.body as UpdateTagInput);
  res.json({ message: 'Tag updated successfully', tag });
});

export const deleteTag = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const tagId = req.params.id as string;
  const result = await deleteTagService(userId, tagId);
  res.json(result);
});
