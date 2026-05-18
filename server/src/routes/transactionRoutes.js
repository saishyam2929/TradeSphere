import { Router } from 'express';
import { listTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listTransactions);

export default router;
