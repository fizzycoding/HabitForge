import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../schemas/auth.schema.js';
import {
  getMyProfile,
  getPublicProfile,
  updateProfile,
} from '../controllers/user.controller.js';

const router = Router();

router.use(protect);

// My user profile endpoints
router.get('/me', getMyProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);

// Public user profile lookup by 8-digit numerical UID
router.get('/:uid', getPublicProfile);

export default router;
