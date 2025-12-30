import express from 'express';
import { getRecommendations } from '../controllers/recommendations.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 教師おすすめ一覧取得
 * GET /api/teachers/recommendations
 */
router.get('/', authenticateToken, getRecommendations);

export default router;
