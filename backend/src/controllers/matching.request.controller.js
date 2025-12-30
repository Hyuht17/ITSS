import MatchingRequest from '../models/MatchingRequest.model.js';
import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js';
import { updateFinishedMatchings } from '../services/matchingStatus.service.js'; // Teacherモデルをインポート

// マッチング申請を送信
export const createRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const requesterId = req.user.userId; // auth middlewareからのユーザーID

        // 自分自身への申請不可
        if (requesterId === receiverId) {
            return res.status(400).json({
                success: false,
                message: '自分自身に申請を送ることはできません'
            });
        }

        // 受信者の存在確認
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: '指定されたユーザーが見つかりません'
            });
        }

        // 既存の申請チェック (pendingのもの)
        const existingRequest = await MatchingRequest.findOne({
            requesterId,
            receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: '既に申請済みです'
            });
        }

        // 申請作成
        const newRequest = new MatchingRequest({
            requesterId,
            receiverId,
            status: 'pending'
        });

        await newRequest.save();

        res.status(201).json({
            success: true,
            message: 'マッチング申請を送信しました',
            data: newRequest
        });

    } catch (error) {
        console.error('Create matching request error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

// 申請一覧を取得 (送信・受信) - Teacher情報も結合
export const getRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 送信した申請
        const sentRequests = await MatchingRequest.find({ requesterId: userId })
            .populate('receiverId', 'name email')
            .sort({ createdAt: -1 });

        // 受信した申請
        const receivedRequests = await MatchingRequest.find({ receiverId: userId })
            .populate('requesterId', 'name email')
            .sort({ createdAt: -1 });

        // User IDのリストを作成してTeacher情報を一括取得
        const userIds = [
            ...sentRequests.map(r => r.receiverId._id),
            ...receivedRequests.map(r => r.requesterId._id)
        ];

        const teachers = await Teacher.find({ userId: { $in: userIds } });
        const teacherMap = teachers.reduce((acc, t) => {
            acc[t.userId.toString()] = t;
            return acc;
        }, {});

        // Teacher情報を結合するヘルパー関数
        const attachTeacherInfo = (request, isSent) => {
            const requestObj = request.toObject();
            const targetUser = isSent ? requestObj.receiverId : requestObj.requesterId;
            const teacher = teacherMap[targetUser._id.toString()];

            if (teacher) {
                targetUser.teacherProfile = {
                    workplace: teacher.workplace,
                    profilePhoto: teacher.getProfilePhotoUrl ? teacher.getProfilePhotoUrl() : teacher.profilePhoto,
                    id: teacher._id
                };
            }
            return requestObj;
        };

        const allRequests = [
            ...sentRequests.map(r => attachTeacherInfo(r, true)),
            ...receivedRequests.map(r => attachTeacherInfo(r, false))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 最新のものが上に来るようにソート

        // すべての結果を返す
        res.json({
            success: true,
            data: allRequests
        });
    } catch (error) {
        console.error('Get matching requests error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 申請承認
export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const request = await MatchingRequest.findOne({
            _id: id,
            receiverId: userId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: '申請が見つからないか、既に処理されています'
            });
        }

        request.status = 'approved';
        await request.save();

        res.json({
            success: true,
            message: '申請を承認しました',
            data: request
        });

    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 申請拒否
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const request = await MatchingRequest.findOne({
            _id: id,
            receiverId: userId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: '申請が見つからないか、既に処理されています'
            });
        }

        request.status = 'rejected';
        await request.save();

        res.json({
            success: true,
            message: '申請を拒否しました',
            data: request
        });

    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 申請キャンセル（送信者が取り消し）
export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const request = await MatchingRequest.findOneAndDelete({
            _id: id,
            requesterId: userId,
            status: 'pending'
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: '申請が見つからないか、キャンセルできません（既に承認/拒否されている可能性があります）'
            });
        }

        res.json({
            success: true,
            message: '申請をキャンセルしました'
        });

    } catch (error) {
        console.error('Cancel request error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * Get accepted/approved matchings for schedule creation
 */
export const getAcceptedMatchings = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Auto-update finished matchings based on schedule end time
        try {
            await updateFinishedMatchings();
        } catch (err) {
            console.error('Error updating finished matchings:', err);
            // Continue even if update fails
        }

        // Get all approved matchings where user is either requester or receiver
        const matchings = await MatchingRequest.find({
            $or: [
                { requesterId: userId },
                { receiverId: userId }
            ],
            status: 'approved'
        })
            .populate('requesterId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ updatedAt: -1 });

        // Get teacher profiles for all matched users
        const userIds = [
            ...matchings.map(m => m.requesterId._id),
            ...matchings.map(m => m.receiverId._id)
        ].filter(id => id.toString() !== userId);

        const teachers = await Teacher.find({ userId: { $in: userIds } });
        const teacherMap = teachers.reduce((acc, t) => {
            acc[t.userId.toString()] = t;
            return acc;
        }, {});

        // Format response
        const formattedMatchings = matchings.map(matching => {
            const matchingObj = matching.toObject();
            const partnerId = matchingObj.requesterId._id.toString() === userId
                ? matchingObj.receiverId
                : matchingObj.requesterId;

            const teacher = teacherMap[partnerId._id.toString()];

            return {
                matchingId: matchingObj._id,
                partner: {
                    _id: partnerId._id,
                    name: partnerId.name,
                    email: partnerId.email,
                    teacherProfile: teacher ? {
                        workplace: teacher.workplace,
                        profilePhoto: teacher.getProfilePhotoUrl ? teacher.getProfilePhotoUrl() : teacher.profilePhoto
                    } : null
                },
                approvedAt: matchingObj.updatedAt
            };
        });

        res.json({
            success: true,
            count: formattedMatchings.length,
            data: formattedMatchings
        });

    } catch (error) {
        console.error('Get accepted matchings error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

/**
 * Get finished matchings for the authenticated user
 * For Home page recent interactions display
 */
export const getFinishedMatchings = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Update finished matchings status first
        try {
            await updateFinishedMatchings();
        } catch (updateError) {
            console.error('Error updating finished matchings:', updateError);
            // Continue even if update fails
        }

        // Get finished matchings with full user and teacher profile data
        const finishedMatchings = await MatchingRequest.find({
            $or: [
                { requesterId: userId },
                { receiverId: userId }
            ],
            status: 'finished'
        })
            .populate('requesterId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ updatedAt: -1 }) // Most recent first
            .limit(10); // Limit to 10 most recent

        // Get teacher profiles for all matched users (with null safety)
        const userIds = finishedMatchings
            .flatMap(m => [
                m.requesterId?._id,
                m.receiverId?._id
            ])
            .filter(id => id && id.toString() !== userId);

        const teachers = await Teacher.find({ userId: { $in: userIds } });
        const teacherMap = teachers.reduce((acc, t) => {
            acc[t.userId.toString()] = t;
            return acc;
        }, {});

        // Attach teacher profile to each matching
        const formattedMatchings = finishedMatchings.map(matching => {
            const matchingObj = matching.toObject();

            // Attach teacher profile to requester (with null safety)
            if (matchingObj.requesterId && matchingObj.requesterId._id) {
                const requesterTeacher = teacherMap[matchingObj.requesterId._id.toString()];
                if (requesterTeacher) {
                    matchingObj.requesterId.teacherProfile = {
                        profilePhoto: requesterTeacher.getProfilePhotoUrl ? requesterTeacher.getProfilePhotoUrl() : requesterTeacher.profilePhoto,
                        specialties: requesterTeacher.specialties,
                        location: requesterTeacher.location,
                        jobTitle: requesterTeacher.jobTitle,
                        yearsOfExperience: requesterTeacher.yearsOfExperience,
                        workplace: requesterTeacher.workplace
                    };
                }
            }

            // Attach teacher profile to receiver (with null safety)
            if (matchingObj.receiverId && matchingObj.receiverId._id) {
                const receiverTeacher = teacherMap[matchingObj.receiverId._id.toString()];
                if (receiverTeacher) {
                    matchingObj.receiverId.teacherProfile = {
                        profilePhoto: receiverTeacher.getProfilePhotoUrl ? receiverTeacher.getProfilePhotoUrl() : receiverTeacher.profilePhoto,
                        specialties: receiverTeacher.specialties,
                        location: receiverTeacher.location,
                        jobTitle: receiverTeacher.jobTitle,
                        yearsOfExperience: receiverTeacher.yearsOfExperience,
                        workplace: receiverTeacher.workplace
                    };
                }
            }

            return matchingObj;
        });

        res.status(200).json({
            success: true,
            data: formattedMatchings
        });
    } catch (error) {
        console.error('Get finished matchings error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

