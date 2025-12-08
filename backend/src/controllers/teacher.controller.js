import Teacher from '../models/Teacher.model.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../utils/upload.util.js';

/**
 * 教師プロフィールコントローラー
 * Mongoose版
 */

/**
 * 教師プロフィールを取得
 * GET /api/teachers/:id
 */
export const getTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findById(id).populate('userId', 'email name');

        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        res.json({
            message: 'Teacher profile retrieved successfully',
            status: 'success',
            data: teacher
        });
    } catch (error) {
        console.error('Get teacher profile error:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 'error'
        });
    }
};

/**
 * 現在のユーザーの教師プロフィールを取得
 * GET /api/teachers/me
 */
export const getMyTeacherProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const teacher = await Teacher.findOne({ userId }).populate('userId', 'email name');

        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        res.json({
            message: 'My teacher profile retrieved successfully',
            status: 'success',
            data: teacher
        });
    } catch (error) {
        console.error('Get my teacher profile error:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 'error'
        });
    }
};


/**
 * すべての教師プロフィールを取得
 * GET /api/teachers
 */
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('userId', 'email name');

        res.json({
            message: 'Teachers retrieved successfully',
            status: 'success',
            data: teachers,
            count: teachers.length
        });
    } catch (error) {
        console.error('Get all teachers error:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 'error'
        });
    }
};

/**
 * 教師プロフィールを更新
 * PUT /api/teachers/:id
 */
export const updateTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        // 本人確認
        const userTeacher = await Teacher.findOne({ userId: req.user.userId });
        if (!userTeacher || userTeacher._id.toString() !== id) {
            return res.status(403).json({
                message: '他の教師のプロフィールは更新できません',
                status: 'error'
            });
        }

        // プロフィールを更新
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Profile updated successfully',
            status: 'success',
            data: updatedTeacher
        });
    } catch (error) {
        console.error('Update teacher profile error:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 'error'
        });
    }
};

/**
 * 教師プロフィールを作成
 * POST /api/teachers
 */
export const createTeacherProfile = async (req, res) => {
    try {
        const teacherData = {
            ...req.body,
            userId: req.user.userId
        };

        // すでにプロフィールが存在するか確認
        const existingTeacher = await Teacher.findOne({ userId: req.user.userId });
        if (existingTeacher) {
            return res.status(409).json({
                message: 'すでに教師プロフィールが存在します',
                status: 'error'
            });
        }

        // プロフィールを作成
        const newTeacher = await Teacher.create(teacherData);

        res.status(201).json({
            message: 'Teacher profile created successfully',
            status: 'success',
            data: newTeacher
        });
    } catch (error) {
        console.error('Create teacher profile error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'バリデーションエラー',
                status: 'error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            message: 'Internal server error',
            status: 'error'
        });
    }
};



/**
 * アバター画像をアップロード
 * POST /api/teachers/:id/upload-avatar
 */
export const uploadAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                message: 'ファイルが選択されていません',
                status: 'error'
            });
        }

        const teacher = await Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        // 本人確認
        const userTeacher = await Teacher.findOne({ userId: req.user.userId });
        if (!userTeacher || userTeacher._id.toString() !== id) {
            return res.status(403).json({
                message: '他の教師のプロフィールは更新できません',
                status: 'error'
            });
        }

        // 古い画像を削除
        if (teacher.profilePhoto && teacher.profilePhoto.includes('cloudinary.com')) {
            const oldPublicId = extractPublicId(teacher.profilePhoto);
            if (oldPublicId) {
                try {
                    await deleteFromCloudinary(oldPublicId);
                    console.log('Old avatar deleted:', oldPublicId);
                } catch (deleteError) {
                    console.warn('Failed to delete old avatar:', deleteError.message);
                }
            }
        }

        // Cloudinaryにアップロード
        const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            'teacher-avatars',
            `teacher_${id}_${Date.now()}`
        );

        // プロフィールを更新
        teacher.profilePhoto = uploadResult.secure_url;
        await teacher.save();

        res.json({
            message: 'Avatar uploaded successfully',
            status: 'success',
            data: {
                avatarUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id
            }
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            message: error.message || 'アバターのアップロードに失敗しました',
            status: 'error'
        });
    }
};
