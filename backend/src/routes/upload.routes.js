import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import upload, { handleMulterError } from '../middlewares/upload.middleware.js';
import { uploadMeetingPhoto } from '../controllers/upload.controller.js';

const router = express.Router();

// すべてのルートに認証を適用
router.use(authenticateToken);

// Meeting photo upload
router.post('/meeting-photo', upload.single('photo'), handleMulterError, uploadMeetingPhoto);

export default router;
