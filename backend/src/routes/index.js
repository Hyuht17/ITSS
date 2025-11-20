import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Import route modules
// import userRoutes from './user.routes.js';

// Use route modules
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

// Example route
router.get('/', (req, res) => {
  res.json({
    message: 'API Routes',
    status: 'success',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth'
    }
  });
});

export default router;
