import { Router } from 'express';
import {
  addWatchlist,
  removeWatchlist,
  listWatchlist,
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listWatchlist);
router.post('/', protect, addWatchlist);
router.delete('/:id', protect, removeWatchlist);

export default router;
