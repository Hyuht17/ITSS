import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: 'Too many requests from this IP, please try again later',
    status: 'error'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for login attempts - 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    message: 'Too many login attempts, please try again after 15 minutes',
    status: 'error'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiter - 3 attempts per hour per IP
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message: 'Too many password reset requests, please try again later',
    status: 'error'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
