import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createHabitSchema, updateHabitSchema, completeHabitSchema } from '../schemas/habit.schema.js';
import {
  createHabit,
  getAllHabits,
  getArchivedHabits,
  getHabitById,
  getHabitLogs,
  updateHabit,
  deleteHabit,
  archiveHabit,
  unarchiveHabit,
  markComplete,
  undoComplete,
} from '../controllers/habit.controller.js';

const router = Router();
router.use(protect);

// CRUD & List routes
router.post('/', validate(createHabitSchema), createHabit);
router.get('/', getAllHabits);
router.get('/archived', getArchivedHabits);
router.get('/:id', getHabitById);
router.get('/:id/logs', getHabitLogs);
router.put('/:id', validate(updateHabitSchema), updateHabit);
router.delete('/:id', deleteHabit);

// Archive / Unarchive
router.patch('/:id/archive', archiveHabit);
router.patch('/:id/unarchive', unarchiveHabit);

// Completion actions
router.post('/:id/complete', validate(completeHabitSchema), markComplete);
router.post('/:id/uncomplete', validate(completeHabitSchema), undoComplete);
router.delete('/:id/complete', undoComplete);

export default router;
