import Teacher from '../models/Teacher.model.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../utils/upload.util.js';

/**
 * 教師プロフィールコントローラー
 * 教師プロフィールに関するAPIエンドポイントのロジックを処理
 * auth.controller.jsのパターンに従って実装
 */

/**
 * 教師プロフィールを取得
 * GET /api/teachers/:id
 */
export const getTeacherProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // 教師プロフィールを取得
        const teacher = Teacher.findById(id);

        // 教師が見つからない場合
        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        // フォーマットしてレスポンス（User.findByIdと同じパターン）
        const formattedTeacher = Teacher.formatForResponse(teacher);

        res.json({
            message: 'Teacher profile retrieved successfully',
            status: 'success',
            data: formattedTeacher
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
 * すべての教師プロフィールを取得
 * GET /api/teachers
 */
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = Teacher.findAll();

        // すべての教師データをフォーマット
        const formattedTeachers = teachers.map(teacher =>
            Teacher.formatForResponse(teacher)
        );

        res.json({
            message: 'Teachers retrieved successfully',
            status: 'success',
            data: formattedTeachers,
            count: formattedTeachers.length
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

        // 教師プロフィールを取得
        const teacher = Teacher.findById(id);

        // 教師が見つからない場合
        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        // 本人確認（自分のプロフィールのみ更新可能）
        // req.user は認証ミドルウェアで設定される
        const userTeacher = Teacher.findByUserId(req.user.id);
        if (!userTeacher || userTeacher.id !== id) {
            return res.status(403).json({
                message: '他の教師のプロフィールは更新できません',
                status: 'error'
            });
        }

        // プロフィールを更新
        const updatedTeacher = Teacher.update(id, updateData);

        if (!updatedTeacher) {
            return res.status(500).json({
                message: 'プロフィールの更新に失敗しました',
                status: 'error'
            });
        }

        // フォーマットしてレスポンス
        const formattedTeacher = Teacher.formatForResponse(updatedTeacher);

        res.json({
            message: 'Profile updated successfully',
            status: 'success',
            data: formattedTeacher
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
            userId: req.user.id // 認証済みユーザーのIDを設定
        };

        // すでにプロフィールが存在するか確認（register controllerと同じパターン）
        const existingTeacher = Teacher.findByUserId(req.user.id);
        if (existingTeacher) {
            return res.status(409).json({
                message: 'すでに教師プロフィールが存在します',
                status: 'error'
            });
        }

        // 必須フィールドのバリデーション
        const requiredFields = ['name', 'jobTitle', 'gender', 'location', 'workplace', 'yearsOfExperience', 'nationality'];
        const missingFields = requiredFields.filter(field => !teacherData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `必須フィールドが不足しています: ${missingFields.join(', ')}`,
                status: 'error'
            });
        }

        // プロフィールを作成
        const newTeacher = Teacher.create(teacherData);

        // フォーマットしてレスポンス
        const formattedTeacher = Teacher.formatForResponse(newTeacher);

        res.status(201).json({
            message: 'Teacher profile created successfully',
            status: 'success',
            data: formattedTeacher
        });
    } catch (error) {
        console.error('Create teacher profile error:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 'error'
        });
    }
};

/**
 * 現在のユーザーの教師プロフィールを取得
 * GET /api/teachers/me
 * getCurrentUserと同じパターン
 */
export const getMyTeacherProfile = async (req, res) => {
    try {
        // 認証済みユーザーIDで教師プロフィールを取得
        const teacher = Teacher.findByUserId(req.user.id);

        // 教師プロフィールが見つからない場合
        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        // フォーマットしてレスポンス
        const formattedTeacher = Teacher.formatForResponse(teacher);

        res.json({
            message: 'Teacher profile retrieved successfully',
            status: 'success',
            data: formattedTeacher
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
 * アバター画像をアップロード
 * POST /api/teachers/:id/upload-avatar
 */
export const uploadAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        // ファイルが存在するか確認
        if (!req.file) {
            return res.status(400).json({
                message: 'ファイルが選択されていません',
                status: 'error'
            });
        }

        // 教師プロフィールを取得
        const teacher = Teacher.findById(id);

        if (!teacher) {
            return res.status(404).json({
                message: '教師プロフィールが見つかりません',
                status: 'error'
            });
        }

        // 本人確認
        const userTeacher = Teacher.findByUserId(req.user.id);
        if (!userTeacher || userTeacher.id !== id) {
            return res.status(403).json({
                message: '他の教師のプロフィールは更新できません',
                status: 'error'
            });
        }

        // 古い画像を削除（Cloudinary上の画像の場合）
        if (teacher.profilePhoto && teacher.profilePhoto.includes('cloudinary.com')) {
            const oldPublicId = extractPublicId(teacher.profilePhoto);
            if (oldPublicId) {
                try {
                    await deleteFromCloudinary(oldPublicId);
                    console.log('Old avatar deleted:', oldPublicId);
                } catch (deleteError) {
                    console.warn('Failed to delete old avatar:', deleteError.message);
                    // 削除に失敗しても処理を続行
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
        const updatedTeacher = Teacher.update(id, {
            profilePhoto: uploadResult.secure_url
        });

        if (!updatedTeacher) {
            return res.status(500).json({
                message: 'プロフィールの更新に失敗しました',
                status: 'error'
            });
        }

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
