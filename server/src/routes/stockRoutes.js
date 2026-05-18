import { Router } from 'express';
import { listStocks, getStock } from '../controllers/stockController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listStocks);
router.get('/:symbol', protect, getStock);

export default router;
