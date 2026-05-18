import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { mapUser } from '../utils/mappers.js';

const SALT_ROUNDS = 12;
const INITIAL_WALLET = 100000;

export const registerUser = async ({ email, username, password }) => {
  if (!email || !username || !password) {
    throw new AppError('Email, username, and password are required.', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters.', 400);
  }

  const existing = await query(
    'SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
    [email, username]
  );

  if (existing.rows.length > 0) {
    throw new AppError('Email or username already in use.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (email, username, password, wallet_balance)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, wallet_balance, created_at`,
    [email, username, hashedPassword, INITIAL_WALLET]
  );

  const user = mapUser(result.rows[0]);
  const token = signToken({ id: user.id, email: user.email });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const result = await query(
    'SELECT id, email, username, password, wallet_balance, created_at FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password.', 401);
  }

  const row = result.rows[0];
  const isMatch = await bcrypt.compare(password, row.password);

  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const user = mapUser(row);
  const token = signToken({ id: user.id, email: user.email });

  return { user, token };
};

export const getUserProfile = async (userId) => {
  const result = await query(
    'SELECT id, email, username, wallet_balance, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  return mapUser(result.rows[0]);
};

export default { registerUser, loginUser, getUserProfile };
