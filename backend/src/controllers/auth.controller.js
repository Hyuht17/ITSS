import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import db from '../config/database.js';

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
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip;

    // Check if IP is rate limited
    const ipAttempts = db.getLoginAttempts(clientIp);
    if (ipAttempts >= 10) {
      return res.status(429).json({
        message: 'Too many failed login attempts. Please try again later.',
        status: 'error'
      });
    }

    // Check if account exists
    const user = User.findByEmail(email);
    
    // Check if account is locked
    if (user && db.isAccountLocked(email)) {
      const lockTime = db.getAccountLockTime(email);
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
      db.recordLoginAttempt(clientIp);
      return res.status(401).json({
        message: genericError,
        status: 'error'
      });
    }

    // Get actual user with password for comparison
    const userWithPassword = db.findUserByEmail(email);
    
    // Compare passwords using timing-safe method
    const isPasswordValid = await User.comparePassword(password, userWithPassword.password);

    if (!isPasswordValid) {
      // Record failed attempt
      db.recordLoginAttempt(clientIp);
      db.recordLoginAttempt(email);

      // Check if should lock account
      const accountAttempts = db.getLoginAttempts(email);
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
      
      if (accountAttempts >= maxAttempts) {
        const lockTime = parseInt(process.env.LOCK_TIME) || 15;
        db.lockAccount(email, lockTime);
        
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
    db.resetLoginAttempts(clientIp);
    db.resetLoginAttempts(email);

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    db.saveRefreshToken(user.id, refreshToken);

    res.json({
      message: 'Login successful',
      status: 'success',
      data: {
        user,
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

// Logout controller
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.id;

    if (refreshToken) {
      // Remove specific refresh token
      db.removeRefreshToken(userId, refreshToken);
    } else {
      // Remove all refresh tokens for this user
      db.removeAllRefreshTokens(userId);
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

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token required',
        status: 'error'
      });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: 'Invalid or expired refresh token',
          status: 'error'
        });
      }

      // Check if refresh token exists in database
      const tokenExists = db.findRefreshToken(decoded.userId, refreshToken);
      if (!tokenExists) {
        return res.status(403).json({
          message: 'Refresh token not found',
          status: 'error'
        });
      }

      // Get user
      const user = User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          status: 'error'
        });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user.id);

      res.json({
        message: 'Token refreshed successfully',
        status: 'success',
        data: {
          accessToken: newAccessToken
        }
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};

// Get current user (me) controller
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.json({
      message: 'User retrieved successfully',
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};

// Register controller (bonus)
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered',
        status: 'error'
      });
    }

    // Create new user
    const user = await User.create({ email, password, name });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    db.saveRefreshToken(user.id, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      status: 'success',
      data: {
        user,
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
