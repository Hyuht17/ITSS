import Feedback from '../models/Feedback.model.js';
import MatchingRequest from '../models/MatchingRequest.model.js';
import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js';

/**
 * Create new feedback
 * POST /api/feedbacks
 */
export const createFeedback = async (req, res) => {
    try {
        const { matchingId, overallRating, ratings, comment, meetingPhoto } = req.body;
        const userId = req.user.userId;

        // Check if matching exists
        const matching = await MatchingRequest.findById(matchingId);
        if (!matching) {
            return res.status(404).json({
                success: false,
                message: 'マッチングが見つかりません'
            });
        }

        // Check if matching is finished
        if (matching.status !== 'finished') {
            return res.status(400).json({
                success: false,
                message: 'このマッチングはまだ終了していません'
            });
        }

        // Check if user is participant in the matching
        const isParticipant =
            matching.requesterId.toString() === userId ||
            matching.receiverId.toString() === userId;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'このマッチングの参加者ではありません'
            });
        }

        // Determine reviewee (the other person in the matching)
        const revieweeId = matching.requesterId.toString() === userId
            ? matching.receiverId
            : matching.requesterId;

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({
            matchingId,
            reviewerId: userId
        });

        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                message: 'このマッチングのフィードバックは既に送信されています'
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            matchingId,
            reviewerId: userId,
            revieweeId,
            overallRating,
            ratings,
            comment,
            meetingPhoto: meetingPhoto || ''
        });

        await feedback.populate([
            { path: 'reviewerId', select: 'name email' },
            { path: 'revieweeId', select: 'name email' }
        ]);

        res.status(201).json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(400).json({
            success: false,
            message: 'フィードバックの作成に失敗しました',
            error: error.message
        });
    }
};

/**
 * Get feedback by matching ID
 * GET /api/feedbacks/matching/:matchingId
 */
export const getFeedbackByMatching = async (req, res) => {
    try {
        const { matchingId } = req.params;
        const userId = req.user.userId;

        // Check if matching exists
        const matching = await MatchingRequest.findById(matchingId);
        if (!matching) {
            return res.status(404).json({
                success: false,
                message: 'マッチングが見つかりません'
            });
        }

        // Check if user is participant in the matching
        const isParticipant =
            matching.requesterId.toString() === userId ||
            matching.receiverId.toString() === userId;

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'このマッチングの参加者ではありません'
            });
        }

        // Get all feedback for this matching
        const feedbacks = await Feedback.find({ matchingId })
            .populate('reviewerId', 'name email')
            .populate('revieweeId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });

    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'フィードバックの取得に失敗しました',
            error: error.message
        });
    }
};

/**
 * Update feedback
 * PUT /api/feedbacks/:feedbackId
 */
export const updateFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { overallRating, ratings, comment } = req.body;
        const userId = req.user.userId;

        // Find feedback
        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'フィードバックが見つかりません'
            });
        }

        // Check if user is the reviewer
        if (feedback.reviewerId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: '自分のフィードバックのみ編集できます'
            });
        }

        // Check if matching is still finished
        const matching = await MatchingRequest.findById(feedback.matchingId);
        if (matching.status !== 'finished') {
            return res.status(400).json({
                success: false,
                message: 'このマッチングは終了していません'
            });
        }

        // Update feedback
        feedback.overallRating = overallRating;
        feedback.ratings = ratings;
        feedback.comment = comment;

        await feedback.save();
        await feedback.populate([
            { path: 'reviewerId', select: 'name email' },
            { path: 'revieweeId', select: 'name email' }
        ]);

        res.json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(400).json({
            success: false,
            message: 'フィードバックの更新に失敗しました',
            error: error.message
        });
    }
};

/**
 * Get feedbacks received by user
 * GET /api/feedbacks/received
 */
export const getReceivedFeedbacks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const feedbacks = await Feedback.find({ revieweeId: userId })
            .populate('reviewerId', 'name email')
            .populate('matchingId')
            .sort({ createdAt: -1 });

        // Add profilePhoto from Teacher model for each reviewer
        const feedbacksWithPhotos = await Promise.all(
            feedbacks.map(async (feedback) => {
                const feedbackObj = feedback.toObject();

                if (feedbackObj.reviewerId && feedbackObj.reviewerId._id) {
                    const teacherProfile = await Teacher.findOne({
                        userId: feedbackObj.reviewerId._id
                    });

                    if (teacherProfile) {
                        feedbackObj.reviewerId.profilePhoto = teacherProfile.getProfilePhotoUrl();
                    }
                }

                return feedbackObj;
            })
        );

        res.json({
            success: true,
            count: feedbacksWithPhotos.length,
            data: feedbacksWithPhotos
        });

    } catch (error) {
        console.error('Get received feedbacks error:', error);
        res.status(500).json({
            success: false,
            message: 'フィードバックの取得に失敗しました',
            error: error.message
        });
    }
};
