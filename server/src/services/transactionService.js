import { query } from '../config/db.js';
import { mapTransaction } from '../utils/mappers.js';

export const getTransactions = async (userId, { page = 1, limit = 10, type, symbol } = {}) => {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
    conditions.push(`type = $${paramIndex++}`);
    params.push(type.toUpperCase());
  }

  if (symbol) {
    conditions.push(`symbol = $${paramIndex++}`);
    params.push(symbol.toUpperCase());
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM transactions WHERE ${whereClause}
       ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) FROM transactions WHERE ${whereClause}`, params),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    transactions: dataResult.rows.map(mapTransaction),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export default { getTransactions };
