import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { teacherAPI } from '../services/api';

/**
 * 教師プロフィール編集画面
 * ワイヤーフレーム通りのレイアウト
 */
const EditTeacherProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        jobTitle: '',
        gender: '',
        location: '',
        workplace: '',
        yearsOfExperience: 0,
        nationality: '',
        profilePhoto: '',
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
    });

    // プロフィールデータを取得
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await teacherAPI.getTeacherProfile(id);
                setFormData(response.data);
            } catch (err) {
                console.error('プロフィール取得エラー:', err);
                setError('プロフィールの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    // フォーム送信
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);

            await teacherAPI.updateTeacherProfile(id, formData);

            // 成功したらプロフィール画面に戻る
            navigate(`/profile/${id}`);
        } catch (err) {
            console.error('プロフィール更新エラー:', err);
            setError(err.response?.data?.message || 'プロフィールの更新に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    // フォームの値を更新
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 配列フィールドの更新（カンマ区切り）
    const handleArrayChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(item => item.trim()).filter(item => item)
        }));
    };

    // SNSリンクの更新
    const handleSocialLinkChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value
            }
        }));
    };

    // アバター画像のアップロード処理
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ファイルサイズチェック (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('画像ファイルは5MB以下にしてください');
            return;
        }

        // ファイルタイプチェック
        if (!file.type.startsWith('image/')) {
            setError('画像ファイルを選択してください');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Cloudinaryにアップロード
            const result = await teacherAPI.uploadTeacherAvatar(id, file);

            if (result.status === 'success') {
                // プロフィール写真を更新
                setFormData(prev => ({
                    ...prev,
                    profilePhoto: result.data.avatarUrl
                }));
                console.log('Avatar uploaded successfully:', result.data.avatarUrl);
            }
        } catch (uploadError) {
            console.error('Avatar upload error:', uploadError);
            setError(uploadError.response?.data?.message || '画像のアップロードに失敗しました');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <SideMenu />
                <main className="flex-1 flex items-center justify-center">
                    <LoadingSpinner message="プロフィールを読み込み中..." />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideMenu />

            <main className="flex-1 p-8">
                <div className="max-w-5xl mx-auto">
                    {/* タイトル */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        プロフィール編集
                    </h1>

                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* メインコンテンツ */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 左カラム - プロフィール写真と基本情報 */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                                    {/* プロフィール写真 */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 relative group">
                                            {formData.profilePhoto ? (
                                                <img
                                                    src={formData.profilePhoto}
                                                    alt="プロフィール"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                            {/* ホバー時のオーバーレイ */}
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            id="avatar-input"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                            disabled={saving}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('avatar-input').click()}
                                            disabled={saving}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'アップロード中...' : '写真を変更'}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2 text-center">
                                            JPG, PNG形式（最大5MB）
                                        </p>
                                    </div>

                                    {/* 名前 */}
                                    <div className="text-center">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="text-xl font-bold text-center w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1"
                                        />
                                        <input
                                            type="text"
                                            name="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={handleChange}
                                            placeholder="職種"
                                            className="text-sm text-gray-600 text-center w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none px-2 py-1 mt-2"
                                        />
                                    </div>

                                    {/* 基本情報 */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600 w-20">性別</span>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="flex-1 text-right border-none focus:outline-none focus:ring-0 text-gray-900"
                                            >
                                                <option value="">選択</option>
                                                <option value="男性">男性</option>
                                                <option value="女性">女性</option>
                                                <option value="その他">その他</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600 w-20">居住地</span>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="flex-1 text-right border-none focus:outline-none focus:ring-0 text-gray-900"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600 w-20">勤務先</span>
                                            <input
                                                type="text"
                                                name="workplace"
                                                value={formData.workplace}
                                                onChange={handleChange}
                                                className="flex-1 text-right border-none focus:outline-none focus:ring-0 text-gray-900"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600 w-20">経験年数</span>
                                            <input
                                                type="number"
                                                name="yearsOfExperience"
                                                value={formData.yearsOfExperience}
                                                onChange={handleChange}
                                                className="flex-1 text-right border-none focus:outline-none focus:ring-0 text-gray-900"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600 w-20">国籍</span>
                                            <input
                                                type="text"
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                className="flex-1 text-right border-none focus:outline-none focus:ring-0 text-gray-900"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between py-2">
                                            <span className="text-gray-600 w-20">FBリンク</span>
                                            <input
                                                type="text"
                                                name="facebook"
                                                value={formData.socialLinks.facebook}
                                                onChange={handleSocialLinkChange}
                                                placeholder="Facebook URL"
                                                className="flex-1 text-right border-none focus:outline-none focus:ring-0 text-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 右カラム - 詳細情報 */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* 専門分野 */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded">
                                        専門分野
                                    </label>
                                    <input
                                        type="text"
                                        name="specialties"
                                        value={formData.specialties.join(', ')}
                                        onChange={handleArrayChange}
                                        placeholder="カンマ区切りで入力（例: 初級日本語, ビジネス日本語）"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* 教育スタイル */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded">
                                        教育スタイル
                                    </label>
                                    <textarea
                                        name="teachingStyle"
                                        value={formData.teachingStyle}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* 共有・学びたいこと */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded">
                                        共有・学びたいこと
                                    </label>
                                    <div className="space-y-4">
                                        {/* 1. 共有したいテーマ */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    1
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">共有したいテーマ</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="shareThemes"
                                                value={formData.shareThemes.join(', ')}
                                                onChange={handleArrayChange}
                                                placeholder="カンマ区切りで入力"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* 2. 学びたいテーマ */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    2
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">学びたいテーマ</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="learnThemes"
                                                value={formData.learnThemes.join(', ')}
                                                onChange={handleArrayChange}
                                                placeholder="カンマ区切りで入力"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* 3. 資格 */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    3
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">資格</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="certifications"
                                                value={formData.certifications.join(', ')}
                                                onChange={handleArrayChange}
                                                placeholder="カンマ区切りで入力"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 他のこと */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded">
                                        他のこと
                                    </label>
                                    <input
                                        type="text"
                                        name="hobbies"
                                        value={formData.hobbies.join(', ')}
                                        onChange={handleArrayChange}
                                        placeholder="趣味をカンマ区切りで入力（例: 読書, 旅行, 料理）"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ボタン */}
                        <div className="flex justify-center gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-12 py-3 bg-gray-900 text-white rounded-full font-medium
                                hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed
                                transition-colors duration-200"
                            >
                                {saving ? '保存中...' : '保存'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/profile/${id}`)}
                                className="px-12 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-medium
                                hover:bg-gray-50 transition-colors duration-200"
                            >
                                戻る
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditTeacherProfile;
