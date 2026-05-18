import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/db.js';
import { mapUser } from '../utils/mappers.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized. Please login.', 401);
    }

    const decoded = verifyToken(token);

    const result = await query(
      'SELECT id, email, username, wallet_balance, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User no longer exists.', 401);
    }

    req.user = mapUser(result.rows[0]);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token.', 401));
    }
    next(error);
  }
};

export default protect;
