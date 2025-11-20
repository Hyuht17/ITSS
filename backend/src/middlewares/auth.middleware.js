import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: 'Access token required',
        status: 'error'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            message: 'Token expired',
            status: 'error'
          });
        }
        return res.status(403).json({
          message: 'Invalid token',
          status: 'error'
        });
      }

      // Get user from database
      const user = User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          status: 'error'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 'error'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        const user = User.findById(decoded.userId);
        req.user = user || null;
      }
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
};
