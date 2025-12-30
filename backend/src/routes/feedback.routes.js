import express from 'express';
import {
    createFeedback,
    getFeedbackByMatching,
    updateFeedback,
    getReceivedFeedbacks
} from '../controllers/feedback.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create feedback
router.post('/', createFeedback);

// Get feedback by matching ID
router.get('/matching/:matchingId', getFeedbackByMatching);

// Get feedbacks received by current user
router.get('/received', getReceivedFeedbacks);

// Update feedback
router.put('/:feedbackId', updateFeedback);

export default router;
