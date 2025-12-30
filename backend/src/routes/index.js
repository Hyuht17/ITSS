import express from 'express';
import authRoutes from './auth.routes.js';
import teacherRoutes from './teacher.routes.js';
import availabilityRoutes from './availability.routes.js';
import recommendationsRoutes from './recommendations.routes.js';
import matchingRoutes from './matching.routes.js';
import messagesRoutes from './messages.routes.js';
import schedulesRoutes from './schedules.routes.js';
import feedbackRoutes from './feedback.routes.js';
import uploadRoutes from './upload.routes.js';

const router = express.Router();

// Use route modules
router.use('/auth', authRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/teachers', teacherRoutes);
router.use('/teachers', availabilityRoutes); // Availability under /teachers prefix
router.use('/matching', matchingRoutes);
router.use('/messages', messagesRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/upload', uploadRoutes);

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
      messages: '/api/messages',
      schedules: '/api/schedules',
      feedbacks: '/api/feedbacks',
      upload: '/api/upload'
    }
  });
});

export default router;
