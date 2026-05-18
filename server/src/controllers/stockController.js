import { getAllStocks, getStockDetails, searchStocks } from '../services/stockService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const listStocks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  const result = search
    ? await searchStocks(search, page, limit)
    : await getAllStocks(page, limit);

  res.json({ success: true, data: result });
});

export const getStock = asyncHandler(async (req, res) => {
  const details = await getStockDetails(req.params.symbol);
  res.json({ success: true, data: details });
});

export default { listStocks, getStock };
