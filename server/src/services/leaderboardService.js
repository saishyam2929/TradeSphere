import { query } from '../config/db.js';
import { getLatestPrice } from './stockService.js';

export const getLeaderboard = async ({ sortBy = 'portfolioValue', limit = 20 } = {}) => {
  const usersResult = await query(
    'SELECT id, username, wallet_balance FROM users'
  );

  const INITIAL_WALLET = 100000;

  const ranked = await Promise.all(
    usersResult.rows.map(async (user) => {
      const [portfolioResult, profitResult] = await Promise.all([
        query('SELECT symbol, quantity FROM portfolio WHERE user_id = $1', [user.id]),
        query(
          `SELECT COALESCE(SUM(profit_loss), 0) AS total_profit
           FROM transactions WHERE user_id = $1 AND type = 'SELL'`,
          [user.id]
        ),
      ]);

      let holdingsValue = 0;
      for (const holding of portfolioResult.rows) {
        const price = await getLatestPrice(holding.symbol);
        holdingsValue += price * parseFloat(holding.quantity);
      }

      const walletBalance = parseFloat(user.wallet_balance);
      const totalPortfolioValue = walletBalance + holdingsValue;
      const totalProfit = parseFloat(profitResult.rows[0].total_profit);
      const roi = ((totalPortfolioValue - INITIAL_WALLET) / INITIAL_WALLET) * 100;

      return {
        userId: user.id,
        username: user.username,
        walletBalance,
        holdingsValue,
        totalPortfolioValue,
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
      };
    })
  );

  const sortKey = {
    portfolioValue: 'totalPortfolioValue',
    profit: 'totalProfit',
    roi: 'roi',
  }[sortBy] || 'totalPortfolioValue';

  ranked.sort((a, b) => b[sortKey] - a[sortKey]);

  return ranked.slice(0, limit).map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
};

export default { getLeaderboard };
