import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} from '../services/watchlistService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const addWatchlist = asyncHandler(async (req, res) => {
  const item = await addToWatchlist(req.user.id, req.body.symbol);
  res.status(201).json({ success: true, data: item });
});

export const removeWatchlist = asyncHandler(async (req, res) => {
  const result = await removeFromWatchlist(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

export const listWatchlist = asyncHandler(async (req, res) => {
  const items = await getWatchlist(req.user.id);
  res.json({ success: true, data: items });
});

export default { addWatchlist, removeWatchlist, listWatchlist };
