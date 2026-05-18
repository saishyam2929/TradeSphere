import { registerUser, loginUser, getUserProfile } from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import env from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await registerUser(req.body);

  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Welcome to TradeSphere!',
    data: { user, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);

  res.cookie('token', token, cookieOptions);

  res.json({
    success: true,
    message: 'Login successful.',
    data: { user, token },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.json({ success: true, message: 'Logged out successfully.' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  res.json({ success: true, data: user });
});

export default { register, login, logout, getProfile };
