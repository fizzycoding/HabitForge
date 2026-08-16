import type { Response } from 'express';
import {
  createHabit as createHabitService,
  getUserHabits,
  getArchivedHabits as getArchivedHabitsService,
  getHabitById as getHabitByIdService,
  updateHabit as updateHabitService,
  deleteHabit as deleteHabitService,
  archiveHabit as archiveHabitService,
  unarchiveHabit as unarchiveHabitService,
  markComplete as markCompleteService,
  undoComplete as undoCompleteService,
} from '../services/habit.service.js';

import { asyncHandler } from '../middleware/error.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { CreateHabitInput, UpdateHabitInput, CompleteHabitInput } from '../schemas/habit.schema.js';

export const createHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habit = await createHabitService(userId, req.body as CreateHabitInput);
  res.status(201).json({ message: 'Habit created successfully', habit });
});

export const getAllHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const status = req.query.status as 'active' | 'archived' | 'all' | undefined;
  const includeArchived = req.query.includeArchived === 'true';
  const habits = await getUserHabits(userId, { status, includeArchived });
  res.json({ habits });
});

export const getArchivedHabits = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habits = await getArchivedHabitsService(userId);
  res.json({ habits });
});

export const getHabitById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const habit = await getHabitByIdService(userId, habitId);
  res.json({ habit });
});

export const updateHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const habit = await updateHabitService(userId, habitId, req.body as UpdateHabitInput);
  res.json({ message: 'Habit updated successfully', habit });
});

export const deleteHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const result = await deleteHabitService(userId, habitId);
  res.json(result);
});

export const archiveHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const habit = await archiveHabitService(userId, habitId);
  res.json({ message: 'Habit archived successfully', habit });
});

export const unarchiveHabit = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const habit = await unarchiveHabitService(userId, habitId);
  res.json({ message: 'Habit unarchived successfully', habit });
});

export const markComplete = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const { dateKey } = (req.body || {}) as CompleteHabitInput;
  const result = await markCompleteService(userId, habitId, dateKey);
  res.status(201).json(result);
});

export const undoComplete = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const habitId = req.params.id as string;
  const dateKey = (req.body?.dateKey || req.query.dateKey) as string | undefined;
  const result = await undoCompleteService(userId, habitId, dateKey);
  res.json(result);
});
