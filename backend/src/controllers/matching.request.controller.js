import MatchingRequest from '../models/MatchingRequest.model.js';
import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js'; // Teacherモデルをインポート

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

        res.json({
            success: true,
            data: {
                sent: sentRequests.map(r => attachTeacherInfo(r, true)),
                received: receivedRequests.map(r => attachTeacherInfo(r, false))
            }
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
