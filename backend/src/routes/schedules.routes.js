import express from 'express';
import { authenticateToken as protect } from '../middlewares/auth.middleware.js';
import {
    getSchedules,
    getScheduleById,
    createSchedule,
    getScheduleTemplates
} from '../controllers/schedules.controller.js';

const router = express.Router();

// Template routes (public)
router.get('/templates', getScheduleTemplates);

// Schedule routes (protected)
router.route('/')
    .get(protect, getSchedules)
    .post(protect, createSchedule);

router.get('/:id', protect, getScheduleById);

export default router;

