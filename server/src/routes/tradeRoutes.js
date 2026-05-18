import { Router } from 'express';
import { buy, sell } from '../controllers/tradeController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/buy', protect, buy);
router.post('/sell', protect, sell);

export default router;
