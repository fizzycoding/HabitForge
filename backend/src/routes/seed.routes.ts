import { Router, Request, Response } from 'express';
import { seedDemoUser } from '../services/seed.service.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

router.all('/demo-user', asyncHandler(async (_req: Request, res: Response) => {
  const result = await seedDemoUser();
  res.json({
    message: 'Demo User seeded successfully with 3 months of history',
    data: result,
  });
}));

export default router;
