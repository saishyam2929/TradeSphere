import { getClient } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { getLatestPrice } from './stockService.js';
import { mapTransaction } from '../utils/mappers.js';

/**
 * Buy stock flow:
 * 1. Validate wallet balance
 * 2. Fetch latest price
 * 3. Deduct balance, update portfolio, record transaction
 */
export const buyStock = async (userId, { symbol, quantity }) => {
  if (!symbol || !quantity || quantity <= 0) {
    throw new AppError('Valid symbol and quantity are required.', 400);
  }

  const upperSymbol = symbol.toUpperCase();
  const price = await getLatestPrice(upperSymbol);
  const totalCost = price * quantity;

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found.', 404);
    }

    const walletBalance = parseFloat(userResult.rows[0].wallet_balance);

    if (walletBalance < totalCost) {
      throw new AppError(
        `Insufficient balance. Need $${totalCost.toFixed(2)}, have $${walletBalance.toFixed(2)}.`,
        400
      );
    }

    await client.query(
      'UPDATE users SET wallet_balance = $1 WHERE id = $2',
      [walletBalance - totalCost, userId]
    );

    const holdingResult = await client.query(
      'SELECT id, quantity, average_buy_price FROM portfolio WHERE user_id = $1 AND symbol = $2',
      [userId, upperSymbol]
    );

    if (holdingResult.rows.length > 0) {
      const existing = holdingResult.rows[0];
      const existingQty = parseFloat(existing.quantity);
      const newQty = existingQty + quantity;
      const newAvg =
        (parseFloat(existing.average_buy_price) * existingQty + price * quantity) / newQty;

      await client.query(
        'UPDATE portfolio SET quantity = $1, average_buy_price = $2 WHERE id = $3',
        [newQty, newAvg, existing.id]
      );
    } else {
      await client.query(
        `INSERT INTO portfolio (user_id, symbol, quantity, average_buy_price)
         VALUES ($1, $2, $3, $4)`,
        [userId, upperSymbol, quantity, price]
      );
    }

    const txResult = await client.query(
      `INSERT INTO transactions (user_id, symbol, type, quantity, price, total)
       VALUES ($1, $2, 'BUY', $3, $4, $5)
       RETURNING *`,
      [userId, upperSymbol, quantity, price, totalCost]
    );

    const updatedUser = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1',
      [userId]
    );

    await client.query('COMMIT');

    return {
      transaction: mapTransaction(txResult.rows[0]),
      walletBalance: parseFloat(updatedUser.rows[0].wallet_balance),
      message: `Bought ${quantity} shares of ${upperSymbol} at $${price.toFixed(2)}`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Sell stock flow:
 * 1. Validate owned quantity
 * 2. Fetch latest price
 * 3. Credit wallet, update portfolio, record transaction with P/L
 */
export const sellStock = async (userId, { symbol, quantity }) => {
  if (!symbol || !quantity || quantity <= 0) {
    throw new AppError('Valid symbol and quantity are required.', 400);
  }

  const upperSymbol = symbol.toUpperCase();
  const price = await getLatestPrice(upperSymbol);

  const client = await getClient();

  try {
    await client.query('BEGIN');

    const holdingResult = await client.query(
      'SELECT id, quantity, average_buy_price FROM portfolio WHERE user_id = $1 AND symbol = $2 FOR UPDATE',
      [userId, upperSymbol]
    );

    if (holdingResult.rows.length === 0) {
      throw new AppError(`Insufficient shares. You own 0 shares of ${upperSymbol}.`, 400);
    }

    const holding = holdingResult.rows[0];
    const ownedQty = parseFloat(holding.quantity);

    if (ownedQty < quantity) {
      throw new AppError(
        `Insufficient shares. You own ${ownedQty} shares of ${upperSymbol}.`,
        400
      );
    }

    const totalProceeds = price * quantity;
    const avgPrice = parseFloat(holding.average_buy_price);
    const profitLoss = (price - avgPrice) * quantity;

    const userResult = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    const walletBalance = parseFloat(userResult.rows[0].wallet_balance);

    await client.query(
      'UPDATE users SET wallet_balance = $1 WHERE id = $2',
      [walletBalance + totalProceeds, userId]
    );

    const remainingQty = ownedQty - quantity;
    if (remainingQty === 0) {
      await client.query('DELETE FROM portfolio WHERE id = $1', [holding.id]);
    } else {
      await client.query('UPDATE portfolio SET quantity = $1 WHERE id = $2', [
        remainingQty,
        holding.id,
      ]);
    }

    const txResult = await client.query(
      `INSERT INTO transactions (user_id, symbol, type, quantity, price, total, profit_loss)
       VALUES ($1, $2, 'SELL', $3, $4, $5, $6)
       RETURNING *`,
      [userId, upperSymbol, quantity, price, totalProceeds, profitLoss]
    );

    const updatedUser = await client.query(
      'SELECT wallet_balance FROM users WHERE id = $1',
      [userId]
    );

    await client.query('COMMIT');

    return {
      transaction: mapTransaction(txResult.rows[0]),
      walletBalance: parseFloat(updatedUser.rows[0].wallet_balance),
      profitLoss,
      message: `Sold ${quantity} shares of ${upperSymbol} at $${price.toFixed(2)}`,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default { buyStock, sellStock };
