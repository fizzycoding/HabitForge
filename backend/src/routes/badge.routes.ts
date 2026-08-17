import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getUserBadges, seedBadges } from '../controllers/badge.controller.js';

const router = Router();

router.use(protect);

router.get('/', getUserBadges);
router.post('/seed', seedBadges);

export default router;
