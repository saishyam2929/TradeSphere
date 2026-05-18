import { query } from '../config/db.js';
import { getLatestPrice } from './stockService.js';
import { mapPortfolio } from '../utils/mappers.js';

export const getPortfolio = async (userId) => {
  const [holdingsResult, userResult] = await Promise.all([
    query(
      'SELECT * FROM portfolio WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    ),
    query('SELECT wallet_balance FROM users WHERE id = $1', [userId]),
  ]);

  const holdings = holdingsResult.rows.map(mapPortfolio);
  const walletBalance = parseFloat(userResult.rows[0]?.wallet_balance || 0);

  let totalInvested = 0;
  let totalCurrentValue = 0;

  const enrichedHoldings = await Promise.all(
    holdings.map(async (holding) => {
      const currentPrice = await getLatestPrice(holding.symbol);
      const invested = holding.averageBuyPrice * holding.quantity;
      const currentValue = currentPrice * holding.quantity;
      const profitLoss = currentValue - invested;
      const profitLossPercent = invested > 0 ? (profitLoss / invested) * 100 : 0;

      totalInvested += invested;
      totalCurrentValue += currentValue;

      return {
        ...holding,
        currentPrice,
        invested,
        currentValue,
        profitLoss,
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      };
    })
  );

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent =
    totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    holdings: enrichedHoldings,
    summary: {
      walletBalance,
      totalInvested,
      totalCurrentValue,
      totalPortfolioValue: walletBalance + totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercent: parseFloat(totalProfitLossPercent.toFixed(2)),
    },
  };
};

export default { getPortfolio };
