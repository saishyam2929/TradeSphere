import { getPortfolio } from '../services/portfolioService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getUserPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await getPortfolio(req.user.id);
  res.json({ success: true, data: portfolio });
});

export default { getUserPortfolio };
