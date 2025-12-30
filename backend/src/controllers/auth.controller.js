import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import RefreshToken from '../models/RefreshToken.model.js';

// In-memory storage for login attempts and locks (temporary solution)
const loginAttempts = new Map();
const accountLocks = new Map();

// Generate access token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Helper functions for rate limiting
const getLoginAttempts = (identifier) => {
  const attempts = loginAttempts.get(identifier) || [];
  const recent = attempts.filter(time => Date.now() - time < 15 * 60 * 1000); // Last 15 minutes
  return recent.length;
};

const recordLoginAttempt = (identifier) => {
  const attempts = loginAttempts.get(identifier) || [];
  attempts.push(Date.now());
  loginAttempts.set(identifier, attempts);
};

const resetLoginAttempts = (identifier) => {
  loginAttempts.delete(identifier);
};

const isAccountLocked = (identifier) => {
  const lockTime = accountLocks.get(identifier);
  if (!lockTime) return false;
  if (Date.now() > lockTime) {
    accountLocks.delete(identifier);
    return false;
  }
  return true;
};

const lockAccount = (identifier, minutes) => {
  const unlockTime = Date.now() + minutes * 60 * 1000;
  accountLocks.set(identifier, unlockTime);
};

const getAccountLockTime = (identifier) => {
  return accountLocks.get(identifier);
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip;

    // Check if IP is rate limited
    const ipAttempts = getLoginAttempts(clientIp);
    if (ipAttempts >= 10) {
      return res.status(429).json({
        message: 'Too many failed login attempts. Please try again later.',
        status: 'error'
      });
    }

    // Check if account exists (Mongoose)
    const user = await User.findOne({ email }).select('+password');

    // Check if account is locked
    if (user && isAccountLocked(email)) {
      const lockTime = getAccountLockTime(email);
      const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60);

      return res.status(423).json({
        message: `Account temporarily locked. Please try again in ${remainingTime} minutes.`,
        status: 'error'
      });
    }

    // Generic error message to prevent account enumeration
    const genericError = 'Invalid email or password';

    if (!user) {
      // Record failed attempt even if user doesn't exist
      recordLoginAttempt(clientIp);
      return res.status(401).json({
        message: genericError,
        status: 'error'
      });
    }

    // Compare passwords using Mongoose method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Record failed attempt
      recordLoginAttempt(clientIp);
      recordLoginAttempt(email);

      // Check if should lock account
      const accountAttempts = getLoginAttempts(email);
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;

      if (accountAttempts >= maxAttempts) {
        const lockTime = parseInt(process.env.LOCK_TIME) || 15;
        lockAccount(email, lockTime);

        return res.status(423).json({
          message: `Too many failed attempts. Account locked for ${lockTime} minutes.`,
          status: 'error'
        });
      }

      return res.status(401).json({
        message: genericError,
        status: 'error'
      });
    }

    // Successful login - reset attempts
    resetLoginAttempts(clientIp);
    resetLoginAttempts(email);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt
    });

    // Return user without password
    const userResponse = user.toJSON();

    res.json({
      message: 'Login successful',
      status: 'success',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};

// Register controller
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered',
        status: 'error'
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      email,
      password,
      name,
      role: 'teacher'
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt
    });

    // Return user without password
    const userResponse = user.toJSON();

    res.status(201).json({
      message: 'Registration successful',
      status: 'success',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Refresh token is required',
        status: 'error'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Check if token exists in database
    const storedToken = await RefreshToken.findOne({
      userId: decoded.userId,
      token
    });

    if (!storedToken) {
      return res.status(401).json({
        message: 'Invalid refresh token',
        status: 'error'
      });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(401).json({
        message: 'Refresh token expired',
        status: 'error'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      message: 'Token refreshed successfully',
      status: 'success',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      message: 'Invalid refresh token',
      status: 'error'
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      // Remove refresh token from database
      await RefreshToken.deleteOne({ token });
    }

    res.json({
      message: 'Logout successful',
      status: 'success'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error'
      });
    }

    res.json({
      message: 'User retrieved successfully',
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};
