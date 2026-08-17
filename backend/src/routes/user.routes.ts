import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../schemas/auth.schema.js';
import {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  changePassword,
} from '../controllers/user.controller.js';

const router = Router();

router.use(protect);

// Current user profile endpoints
router.get('/me', getMyProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);

// Public user profile lookup by 8-digit numerical UID
router.get('/:uid', getPublicProfile);

export default router;
