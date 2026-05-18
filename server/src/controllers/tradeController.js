import { buyStock, sellStock } from '../services/tradeService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { emitPortfolioUpdate } from '../sockets/stockSocket.js';

export const buy = asyncHandler(async (req, res) => {
  const result = await buyStock(req.user.id, req.body);
  const io = req.app.get('io');
  if (io) await emitPortfolioUpdate(io, req.user.id);
  res.json({ success: true, data: result });
});

export const sell = asyncHandler(async (req, res) => {
  const result = await sellStock(req.user.id, req.body);
  const io = req.app.get('io');
  if (io) await emitPortfolioUpdate(io, req.user.id);
  res.json({ success: true, data: result });
});

export default { buy, sell };
