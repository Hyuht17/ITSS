import express from 'express';
import authRoutes from './auth.routes.js';
import teacherRoutes from './teacher.routes.js';
import availabilityRoutes from './availability.routes.js';
import recommendationsRoutes from './recommendations.routes.js';
import matchingRoutes from './matching.routes.js';
import messagesRoutes from './messages.routes.js';

const router = express.Router();

// Import route modules
// import userRoutes from './user.routes.js';

// Use route modules
router.use('/auth', authRoutes);
router.use('/recommendations', recommendationsRoutes); // Separate path to avoid conflict
router.use('/matching', matchingRoutes);
router.use('/messages', messagesRoutes);
router.use('/teachers', teacherRoutes);
router.use('/teachers', availabilityRoutes);
// router.use('/users', userRoutes);

// Example route
router.get('/', (req, res) => {
  res.json({
    message: 'API Routes',
    status: 'success',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      teachers: '/api/teachers',
      availability: '/api/teachers/availability',
      recommendations: '/api/recommendations',
      matching: '/api/matching',
      messages: '/api/messages'
    }
  });
});

export default router;
