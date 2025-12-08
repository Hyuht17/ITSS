import AvailabilityDB from '../models/AvailabilityDB.model.js';
import { Availability as AvailabilityValidator, STATUS } from '../models/Availability.model.js';

/**
 * 空き時間登録コントローラー (Mongoose版)
 */

/**
 * 空き時間を登録
 * POST /api/teachers/availability
 */
export const registerAvailability = async (req, res) => {
    try {
        const { availabilities } = req.body;
        const teacherId = req.user.userId;

        // バリデーション
        if (!availabilities) {
            return res.status(400).json({
                success: false,
                message: 'availabilitiesフィールドは必須です'
            });
        }

        // 一括バリデーション
        try {
            AvailabilityValidator.validateBatch(availabilities);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        // 既存の空き時間を削除（上書き登録）
        await AvailabilityDB.deleteMany({ teacherId });

        // 新しい空き時間を登録
        const savedAvailabilities = [];
        for (const availability of availabilities) {
            const savedData = await AvailabilityDB.create({
                teacherId,
                date: new Date(availability.date),
                timeSlots: availability.timeSlots,
                location: availability.location,
                status: STATUS.AVAILABLE
            });
            savedAvailabilities.push(savedData);
        }

        res.status(201).json({
            success: true,
            message: '空き時間を登録しました',
            data: savedAvailabilities
        });
    } catch (error) {
        console.error('空き時間登録エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 登録済み空き時間を取得
 * GET /api/teachers/availability
 */
export const getAvailabilities = async (req, res) => {
    try {
        const teacherId = req.user.userId;

        const availabilities = await AvailabilityDB.find({ teacherId }).sort({ date: 1 });

        res.json({
            success: true,
            data: availabilities
        });
    } catch (error) {
        console.error('空き時間取得エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 特定の空き時間を取得
 * GET /api/teachers/availability/:id
 */
export const getAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.userId;

        const availability = await AvailabilityDB.findById(id);

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: '空き時間が見つかりません'
            });
        }

        // 所有権チェック
        if (availability.teacherId.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'アクセス権限がありません'
            });
        }

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        console.error('空き時間取得エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 空き時間を更新
 * PUT /api/teachers/availability/:id
 */
export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, timeSlots, location, status } = req.body;
        const teacherId = req.user.userId;

        const availability = await AvailabilityDB.findById(id);

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: '空き時間が見つかりません'
            });
        }

        // 所有権チェック
        if (availability.teacherId.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'アクセス権限がありません'
            });
        }

        // バリデーション
        const updateData = {};
        if (date) {
            AvailabilityValidator.validateDate(date);
            updateData.date = new Date(date);
        }
        if (timeSlots) {
            AvailabilityValidator.validateTimeSlots(timeSlots);
            updateData.timeSlots = timeSlots;
        }
        if (location) {
            AvailabilityValidator.validateLocation(location);
            updateData.location = location;
        }
        if (status) {
            updateData.status = status;
        }

        const updatedAvailability = await AvailabilityDB.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: '空き時間を更新しました',
            data: updatedAvailability
        });
    } catch (error) {
        if (error.message && (error.message.includes('日付') || error.message.includes('時間帯') || error.message.includes('位置情報'))) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error('空き時間更新エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 空き時間を削除
 * DELETE /api/teachers/availability/:id
 */
export const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.userId;

        const availability = await AvailabilityDB.findById(id);

        if (!availability) {
            return res.status(404).json({
                success: false,
                message: '空き時間が見つかりません'
            });
        }

        // 所有権チェック
        if (availability.teacherId.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'アクセス権限がありません'
            });
        }

        await AvailabilityDB.findByIdAndDelete(id);

        res.json({
            success: true,
            message: '空き時間を削除しました'
        });
    } catch (error) {
        console.error('空き時間削除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 全ての空き時間を削除
 * DELETE /api/teachers/availability
 */
export const deleteAllAvailabilities = async (req, res) => {
    try {
        const teacherId = req.user.userId;

        const result = await AvailabilityDB.deleteMany({ teacherId });

        res.json({
            success: true,
            message: `${result.deletedCount}件の空き時間を削除しました`
        });
    } catch (error) {
        console.error('空き時間一括削除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};
