import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProfileEditModal from '../components/ProfileEditModal';
import { teacherAPI } from '../services/api';

/**
 * 教師プロフィール画面
 * ワイヤーフレーム通りのレイアウト
 */
const TeacherProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // profile or edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 現在のユーザー情報を取得
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchTeacherProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // "me" の場合は自分のプロフィールを取得
            if (id === 'me') {
                response = await teacherAPI.getMyTeacherProfile();
                setIsOwner(true);
            } else {
                // 特定の教師IDでプロフィールを取得
                response = await teacherAPI.getTeacherProfile(id);

                // 自分のプロフィールかチェック
                if (response.data.userId === currentUser.id) {
                    setIsOwner(true);
                }
            }

            setTeacher(response.data);
        } catch (err) {
            console.error('教師プロフィール取得エラー:', err);
            setError(err.response?.data?.message || 'プロフィールの取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherProfile();
    }, [id]);

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

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <SideMenu />
                <main className="flex-1 flex items-center justify-center">
                    <ErrorMessage message={error} onRetry={fetchTeacherProfile} />
                </main>
            </div>
        );
    }

    if (!teacher) return null;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-8xl mx-auto">
                    {/* ヘッダー */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-6 py-2 font-medium transition-colors ${activeTab === 'profile'
                                            ? 'text-gray-900 border-b-2 border-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        プロフィール
                                    </button>
                                    {isOwner && (
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="flex items-center gap-2 px-6 py-2 font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            編集
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* メインコンテンツ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 左カラム - プロフィール写真と基本情報 */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                {/* プロフィール写真 */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {teacher.profilePhoto ? (
                                                <img
                                                    src={teacher.profilePhoto}
                                                    alt={teacher.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 名前と職種 */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {teacher.name}
                                    </h2>
                                    <p className="text-gray-600">
                                        {teacher.jobTitle}
                                    </p>
                                </div>

                                {/* 基本情報 */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">性別</span>
                                        <span className="text-gray-900 font-medium">{teacher.gender}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">居住地</span>
                                        <span className="text-gray-900 font-medium">{teacher.location}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">勤務先</span>
                                        <span className="text-gray-900 font-medium">{teacher.workplace}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">経験年数</span>
                                        <span className="text-gray-900 font-medium">~{teacher.yearsOfExperience}年間</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">国籍</span>
                                        <span className="text-gray-900 font-medium">{teacher.nationality}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">FBリンク</span>
                                        <a
                                            href={teacher.socialLinks?.facebook || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-medium"
                                        >
                                            {teacher.socialLinks?.facebook ? 'プロフィール' : '-'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 右カラム - 詳細情報 */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 専門分野と教育スタイル */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 専門分野 */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                        専門分野
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.specialties?.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 教育スタイル */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                        教育スタイル
                                    </h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {teacher.teachingStyle || '情報がありません'}
                                    </p>
                                </div>
                            </div>

                            {/* 共有・学びたいこと */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                    共有・学びたいこと
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold mb-3">
                                            1
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">共有したいテーマ</h4>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            {teacher.shareThemes?.map((theme, index) => (
                                                <li key={index}>• {theme}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold mb-3">
                                            2
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">学びたいテーマ</h4>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            {teacher.learnThemes?.map((theme, index) => (
                                                <li key={index}>• {theme}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-bold mb-3">
                                            3
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">資格</h4>
                                        <ul className="space-y-1 text-sm text-gray-700">
                                            {teacher.certifications?.map((cert, index) => (
                                                <li key={index}>• {cert}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* 他のこと */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                                    他のこと
                                </h3>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">趣味</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.hobbies?.map((hobby, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                            >
                                                {hobby}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                teacherId={teacher?.id}
                onSuccess={fetchTeacherProfile}
            />
        </div>
    );
};

export default TeacherProfile;
