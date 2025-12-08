import express from 'express';
import {
    createRequest,
    getRequests,
    approveRequest,
    rejectRequest,
    cancelRequest
} from '../controllers/matching.request.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 全てのエンドポイントで認証が必要
router.use(authenticateToken);

router.post('/requests', createRequest);
router.get('/requests', getRequests);
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', rejectRequest);
router.delete('/requests/:id', cancelRequest);

export default router;
