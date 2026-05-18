/** Map PostgreSQL snake_case rows to camelCase API objects */

export const mapUser = (row) =>
  row
    ? {
        id: row.id,
        email: row.email,
        username: row.username,
        walletBalance: parseFloat(row.wallet_balance),
        createdAt: row.created_at,
      }
    : null;

export const mapStock = (row) =>
  row
    ? {
        id: row.id,
        symbol: row.symbol,
        companyName: row.company_name,
        currentPrice: parseFloat(row.current_price),
        dailyChange: parseFloat(row.daily_change),
        volume: parseFloat(row.volume),
        updatedAt: row.updated_at,
      }
    : null;

export const mapPortfolio = (row) =>
  row
    ? {
        id: row.id,
        userId: row.user_id,
        symbol: row.symbol,
        quantity: parseFloat(row.quantity),
        averageBuyPrice: parseFloat(row.average_buy_price),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

export const mapTransaction = (row) =>
  row
    ? {
        id: row.id,
        userId: row.user_id,
        symbol: row.symbol,
        type: row.type,
        quantity: parseFloat(row.quantity),
        price: parseFloat(row.price),
        total: parseFloat(row.total),
        profitLoss: row.profit_loss != null ? parseFloat(row.profit_loss) : null,
        createdAt: row.created_at,
      }
    : null;

export const mapWatchlist = (row) =>
  row
    ? {
        id: row.id,
        userId: row.user_id,
        symbol: row.symbol,
        createdAt: row.created_at,
      }
    : null;
