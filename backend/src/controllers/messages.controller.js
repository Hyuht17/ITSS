import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js';
import { uploadToCloudinary } from '../utils/upload.util.js';

/**
 * Get list of conversations with latest messages
 * GET /api/messages/list
 */
export const getMessageList = async (req, res) => {
    try {
        const currentUserId = req.user.userId;

        // Get all messages involving the current user
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId },
                { receiverId: currentUserId }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .lean();

        // Group messages by conversation partner
        const conversationsMap = {};

        for (const message of messages) {
            // Determine the other user (conversation partner)
            const otherUserId = message.senderId._id.toString() === currentUserId
                ? message.receiverId._id.toString()
                : message.senderId._id.toString();

            // Only keep the latest message for each conversation
            if (!conversationsMap[otherUserId]) {
                const otherUser = message.senderId._id.toString() === currentUserId
                    ? message.receiverId
                    : message.senderId;

                // Get unread count for this conversation
                const unreadCount = await Message.countDocuments({
                    senderId: otherUserId,
                    receiverId: currentUserId,
                    read: false
                });

                // Get teacher profile for profile photo
                const teacherProfile = await Teacher.findOne({ userId: otherUserId });

                conversationsMap[otherUserId] = {
                    user: {
                        _id: otherUser._id,
                        name: otherUser.name,
                        email: otherUser.email,
                        profilePhoto: teacherProfile?.profilePhoto || null
                    },
                    latestMessage: {
                        content: message.content,
                        attachment: message.attachment,
                        timestamp: message.createdAt,
                        isRead: message.read
                    },
                    unreadCount
                };
            }
        }

        // Convert map to array and sort by latest message timestamp
        const conversations = Object.values(conversationsMap);

        res.json({
            success: true,
            data: conversations
        });

    } catch (error) {
        console.error('Get message list error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * Get conversation history with a specific user
 * GET /api/messages/conversation/:userId
 */
export const getConversation = async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const otherUserId = req.params.userId;

        // Get all messages between these two users
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        })
            .sort({ createdAt: 1 }) // Oldest first for conversation view
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .lean();

        // Format messages with isSentByMe flag
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            ...(msg.attachment && { attachment: msg.attachment }),
            sender: msg.senderId,
            receiver: msg.receiverId,
            isSentByMe: msg.senderId._id.toString() === currentUserId,
            createdAt: msg.createdAt,
            read: msg.read
        }));

        // Get other user info
        const otherUser = await User.findById(otherUserId, 'name email');
        const teacherProfile = await Teacher.findOne({ userId: otherUserId });

        // Mark received messages as read
        await Message.updateMany(
            {
                senderId: otherUserId,
                receiverId: currentUserId,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        res.json({
            success: true,
            data: {
                messages: formattedMessages,
                otherUser: {
                    _id: otherUser._id,
                    name: otherUser.name,
                    email: otherUser.email,
                    profilePhoto: teacherProfile?.profilePhoto || null
                }
            }
        });

    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * Send a new message
 * POST /api/messages/send
 */
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.userId;
        const file = req.file; // From multer middleware

        // Debug logging
        console.log('📨 Send message request:', {
            receiverId,
            content,
            hasFile: !!file,
            body: req.body
        });

        // Validation - require either content or file
        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: '受信者は必須です'
            });
        }

        // Check if we have either content or file
        const hasContent = content && content.trim().length > 0;
        if (!hasContent && !file) {
            return res.status(400).json({
                success: false,
                message: 'メッセージ内容またはファイルは必須です'
            });
        }

        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        if (file && file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'ファイルサイズは5MB以下にしてください'
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: '受信者が見つかりません'
            });
        }

        // Prepare message data
        const messageData = {
            senderId,
            receiverId,
            content: content ? content.trim() : '',
            read: false
        };

        // Handle file upload if present
        if (file) {
            try {
                const uploadResult = await uploadToCloudinary(
                    file.buffer,
                    'message-attachments',
                    `message_${senderId}_${Date.now()}`,
                    true // skipTransformations - don't apply image transformations to attachments
                );

                messageData.attachment = {
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType: file.mimetype
                };
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({
                    success: false,
                    message: 'ファイルのアップロードに失敗しました'
                });
            }
        }

        // Create new message
        const newMessage = new Message(messageData);
        await newMessage.save();

        // Populate sender info for response
        await newMessage.populate('senderId', 'name email');
        await newMessage.populate('receiverId', 'name email');

        res.status(201).json({
            success: true,
            data: {
                _id: newMessage._id,
                senderId: newMessage.senderId,
                receiverId: newMessage.receiverId,
                content: newMessage.content,
                ...(newMessage.attachment && { attachment: newMessage.attachment }),
                createdAt: newMessage.createdAt,
                isSentByMe: true
            }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * Mark messages from a user as read
 * PATCH /api/messages/read/:userId
 */
export const markAsRead = async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const otherUserId = req.params.userId;

        await Message.updateMany(
            {
                senderId: otherUserId,
                receiverId: currentUserId,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        res.json({
            success: true,
            message: 'メッセージを既読にしました'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};
