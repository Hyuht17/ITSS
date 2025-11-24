import express from 'express';
import {
    getTeacherProfile,
    getAllTeachers,
    updateTeacherProfile,
    createTeacherProfile,
    getMyTeacherProfile,
    uploadAvatar
} from '../controllers/teacher.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import upload, { handleMulterError } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * 教師プロフィールルート
 * すべてのルートは認証が必要
 */

// 現在のユーザーの教師プロフィールを取得
router.get('/me', authenticateToken, getMyTeacherProfile);

// すべての教師プロフィールを取得
router.get('/', authenticateToken, getAllTeachers);

// 教師プロフィールを作成
router.post('/', authenticateToken, createTeacherProfile);

// 特定の教師プロフィールを取得
router.get('/:id', authenticateToken, getTeacherProfile);

// 教師プロフィールを更新（本人のみ）
router.put('/:id', authenticateToken, updateTeacherProfile);

// アバター画像をアップロード（本人のみ）
router.post('/:id/upload-avatar', authenticateToken, upload.single('avatar'), handleMulterError, uploadAvatar);

export default router;

