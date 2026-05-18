import { Router } from 'express';
import { listLeaderboard } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listLeaderboard);

export default router;
