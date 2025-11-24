import db from '../config/database.js';

/**
 * 教師モデル
 * 教師プロフィール情報の管理を担当
 */
class Teacher {
    /**
     * 教師IDでプロフィール情報を取得
     * @param {string} id - 教師ID
     * @returns {object|null} 教師プロフィール情報
     */
    static findById(id) {
        return db.findTeacherById(id);
    }

    /**
     * すべての教師プロフィールを取得
     * @returns {array} 教師プロフィールの配列
     */
    static findAll() {
        return db.getAllTeachers();
    }

    /**
     * ユーザーIDで教師プロフィールを取得
     * @param {string} userId - ユーザーID
     * @returns {object|null} 教師プロフィール情報
     */
    static findByUserId(userId) {
        const teachers = db.getAllTeachers();
        return teachers.find(teacher => teacher.userId === userId);
    }

    /**
     * 新規教師プロフィールを作成
     * @param {object} teacherData - 教師データ
     * @returns {object} 作成された教師プロフィール
     */
    static create(teacherData) {
        // デフォルト値を設定
        const defaultData = {
            specialties: [],
            teachingStyle: '',
            shareThemes: [],
            learnThemes: [],
            certifications: [],
            hobbies: [],
            socialLinks: {
                twitter: '',
                facebook: '',
                linkedin: ''
            }
        };

        return db.createTeacher({
            ...defaultData,
            ...teacherData
        });
    }

    /**
     * 教師プロフィールを更新
     * @param {string} id - 教師ID
     * @param {object} teacherData - 更新する教師データ
     * @returns {object|null} 更新された教師プロフィール
     */
    static update(id, teacherData) {
        return db.updateTeacher(id, teacherData);
    }

    /**
     * プロフィール写真のURLを取得（未設定の場合はプレースホルダーを返す）
     * @param {string} profilePhoto - プロフィール写真のURL
     * @param {string} name - 教師の名前（プレースホルダー生成用）
     * @returns {string} プロフィール写真のURL
     */
    static getProfilePhotoUrl(profilePhoto, name = 'Teacher') {
        // プロフィール写真が未設定の場合はプレースホルダー画像を返す
        if (!profilePhoto || profilePhoto.trim() === '') {
            // UI Avatarsを使用してプレースホルダー画像を生成
            const encodedName = encodeURIComponent(name);
            return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=2563eb&color=fff`;
        }
        return profilePhoto;
    }

    /**
     * データをcamelCaseに変換（フロントエンド用）
     * User.findByIdと同じパターンでデータを返す
     * @param {object} teacher - 教師データ
     * @returns {object} camelCase形式の教師データ
     */
    static formatForResponse(teacher) {
        if (!teacher) return null;

        return {
            id: teacher.id,
            userId: teacher.userId,
            name: teacher.name,
            jobTitle: teacher.jobTitle,
            gender: teacher.gender,
            location: teacher.location,
            workplace: teacher.workplace,
            yearsOfExperience: teacher.yearsOfExperience,
            nationality: teacher.nationality,
            profilePhoto: this.getProfilePhotoUrl(teacher.profilePhoto, teacher.name),
            specialties: teacher.specialties || [],
            teachingStyle: teacher.teachingStyle || '',
            shareThemes: teacher.shareThemes || [],
            learnThemes: teacher.learnThemes || [],
            certifications: teacher.certifications || [],
            hobbies: teacher.hobbies || [],
            socialLinks: teacher.socialLinks || {
                twitter: '',
                facebook: '',
                linkedin: ''
            },
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt
        };
    }
}

export default Teacher;
