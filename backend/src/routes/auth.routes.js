import express from 'express';
import {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  register
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  loginValidation,
  registerValidation,
  validate
} from '../middlewares/validator.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
