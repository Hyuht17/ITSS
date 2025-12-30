import express from 'express';
import {
    createRequest,
    getRequests,
    approveRequest,
    rejectRequest,
    cancelRequest,
    getAcceptedMatchings,
    getFinishedMatchings
} from '../controllers/matching.request.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// すべてのルートに認証を適用
router.use(authenticateToken);

// ルート定義
router.post('/requests', createRequest); // マッチング申請作成
router.get('/requests', getRequests); // マッチング申請一覧取得
router.patch('/requests/:id/approve', approveRequest); // マッチング申請承認
router.patch('/requests/:id/reject', rejectRequest); // マッチング申請拒否
router.delete('/requests/:id', cancelRequest); // マッチング申請キャンセル
router.get('/accepted', getAcceptedMatchings); // 承認済みマッチング一覧
router.get('/finished', getFinishedMatchings); // 終了したマッチング一覧

export default router;
