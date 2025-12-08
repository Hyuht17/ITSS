import express from 'express';
import * as availabilityController from '../controllers/availability.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.post(
    '/availability',
    authenticateToken,
    availabilityController.registerAvailability
);


router.get(
    '/availability',
    authenticateToken,
    availabilityController.getAvailabilities
);

router.get(
    '/availability/:id',
    authenticateToken,
    availabilityController.getAvailabilityById
);

router.put(
    '/availability/:id',
    authenticateToken,
    availabilityController.updateAvailability
);

router.delete(
    '/availability/:id',
    authenticateToken,
    availabilityController.deleteAvailability
);

// 全ての空き時間を削除
router.delete(
    '/availability',
    authenticateToken,
    availabilityController.deleteAllAvailabilities
);

export default router;
