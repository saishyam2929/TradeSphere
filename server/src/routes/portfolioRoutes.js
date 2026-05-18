import { Router } from 'express';
import { getUserPortfolio } from '../controllers/portfolioController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getUserPortfolio);

export default router;
