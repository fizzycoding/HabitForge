import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTagSchema, updateTagSchema } from '../schemas/tag.schema.js';
import {
  getUserTags,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tag.controller.js';

const router = Router();

router.use(protect);

router.get('/', getUserTags);
router.post('/', validate(createTagSchema), createTag);
router.put('/:id', validate(updateTagSchema), updateTag);
router.delete('/:id', deleteTag);

export default router;
