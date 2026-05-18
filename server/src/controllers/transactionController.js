import { getTransactions } from '../services/transactionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, type, symbol } = req.query;
  const result = await getTransactions(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    type,
    symbol,
  });
  res.json({ success: true, data: result });
});

export default { listTransactions };
