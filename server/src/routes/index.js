import { Router } from 'express';
import authRoutes from './authRoutes.js';
import stockRoutes from './stockRoutes.js';
import tradeRoutes from './tradeRoutes.js';
import portfolioRoutes from './portfolioRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';
import leaderboardRoutes from './leaderboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stocks', stockRoutes);
router.use('/trade', tradeRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/transactions', transactionRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
