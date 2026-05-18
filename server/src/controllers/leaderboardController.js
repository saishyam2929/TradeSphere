import { getLeaderboard } from '../services/leaderboardService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listLeaderboard = asyncHandler(async (req, res) => {
  const { sortBy, limit } = req.query;
  const data = await getLeaderboard({
    sortBy: sortBy || 'portfolioValue',
    limit: parseInt(limit) || 20,
  });
  res.json({ success: true, data });
});

export default { listLeaderboard };
