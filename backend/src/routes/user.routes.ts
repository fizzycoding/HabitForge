import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, updateSubscriptionSchema } from '../schemas/user.schema.js';
import {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  updateSubscription,
} from '../controllers/user.controller.js';

const router = Router();

router.use(protect);

// My user profile endpoints
router.get('/me', getMyProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);
router.patch('/subscription', validate(updateSubscriptionSchema), updateSubscription);

// Public user profile lookup by 8-digit numerical UID
router.get('/:uid', getPublicProfile);

export default router;
