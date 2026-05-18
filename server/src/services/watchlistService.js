import { query } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { getStockQuote } from './stockService.js';
import { mapWatchlist } from '../utils/mappers.js';

export const addToWatchlist = async (userId, symbol) => {
  if (!symbol) throw new AppError('Symbol is required.', 400);

  const upperSymbol = symbol.toUpperCase();
  await getStockQuote(upperSymbol);

  const existing = await query(
    'SELECT id FROM watchlist WHERE user_id = $1 AND symbol = $2',
    [userId, upperSymbol]
  );

  if (existing.rows.length > 0) {
    throw new AppError(`${upperSymbol} is already in your watchlist.`, 409);
  }

  const result = await query(
    'INSERT INTO watchlist (user_id, symbol) VALUES ($1, $2) RETURNING *',
    [userId, upperSymbol]
  );

  return mapWatchlist(result.rows[0]);
};

export const removeFromWatchlist = async (userId, id) => {
  const result = await query(
    'DELETE FROM watchlist WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Watchlist item not found.', 404);
  }

  return { message: 'Removed from watchlist.' };
};

export const getWatchlist = async (userId) => {
  const result = await query(
    'SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  const items = result.rows.map(mapWatchlist);

  const enriched = await Promise.all(
    items.map(async (item) => {
      try {
        const stock = await getStockQuote(item.symbol);
        return { ...item, stock };
      } catch {
        return item;
      }
    })
  );

  return enriched;
};

export default { addToWatchlist, removeFromWatchlist, getWatchlist };
