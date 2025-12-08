import express from 'express';
import multer from 'multer';
import {
    getMessageList,
    getConversation,
    sendMessage,
    markAsRead
} from '../controllers/messages.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// All endpoints require authentication
router.use(authenticateToken);

// Get list of conversations
router.get('/list', getMessageList);

// Get conversation with specific user
router.get('/conversation/:userId', getConversation);

// Send a message (with optional file attachment)
router.post('/send', upload.single('file'), sendMessage);

// Mark messages as read
router.patch('/read/:userId', markAsRead);

export default router;
