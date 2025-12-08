import React from 'react';
import PropTypes from 'prop-types';

const TeacherDetailModal = ({ teacher, onClose, onConnect, isConnecting }) => {
    if (!teacher) return null;

    // ヘルパー：アバターURL生成
    const getProfilePhotoUrl = () => {
        if (teacher.profilePhoto) return teacher.profilePhoto;
        const encodedName = encodeURIComponent(teacher.name || 'Teacher');
        return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=2563eb&color=fff`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* モーダルコンテンツ */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up">

                {/* 閉じるボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* 左カラム：基本プロフィール */}
                    <div className="w-full md:w-1/3 bg-gray-50 p-8 flex flex-col items-center border-r border-gray-100">
                        {/* アバター */}
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-sm ring-4 ring-gray-100">
                            <img
                                src={getProfilePhotoUrl()}
                                alt={teacher.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* 名前と役職 */}
                        <h2 className="text-xl font-bold text-gray-900 text-center uppercase tracking-wide mb-1">
                            {teacher.name}
                        </h2>
                        <p className="text-gray-500 font-medium mb-8 text-center text-sm">
                            {teacher.subject || '教師'}
                        </p>

                        {/* 詳細情報テーブル */}
                        <div className="w-full space-y-4 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <span className="text-gray-500 font-medium">性別</span>
                                <span className="text-gray-900 font-semibold">{teacher.gender || '公開なし'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <span className="text-gray-500 font-medium">居住地</span>
                                <span className="text-gray-900 font-semibold">{teacher.location}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <span className="text-gray-500 font-medium">勤務先</span>
                                <span className="text-gray-900 font-semibold text-right max-w-[60%] truncate">{teacher.workplace}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <span className="text-gray-500 font-medium">経験年数</span>
                                <span className="text-gray-900 font-semibold">〜{teacher.yearsOfExperience}年間</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                <span className="text-gray-500 font-medium">国籍</span>
                                <span className="text-gray-900 font-semibold">{teacher.nationality || 'ベトナム'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 last:border-0">
                                <span className="text-gray-500 font-medium">FBリンク</span>
                                <a href="#" className="text-blue-600 hover:underline truncate max-w-[120px]">{teacher.facebookLink || '未設定'}</a>
                            </div>
                        </div>

                        {/* 左側の「つながり」ボタン（ワイヤーフレーム準拠） */}
                        <div className="mt-8 mb-4">
                            <button
                                onClick={() => onConnect(teacher)}
                                disabled={isConnecting}
                                className="bg-gray-500 text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                {isConnecting ? '送信中...' : 'つながり'}
                            </button>
                        </div>
                    </div>

                    {/* 右カラム：詳細情報 */}
                    <div className="w-full md:w-2/3 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* 専門分野 */}
                            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 relative group hover:border-blue-100 transition-colors">
                                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs font-bold">専門分野</span>
                                <div className="flex flex-wrap gap-2 justify-center mt-2">
                                    {teacher.specialties && teacher.specialties.length > 0 ? (
                                        teacher.specialties.map((spec, i) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                                                {spec}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm">情報なし</p>
                                    )}
                                </div>
                            </div>

                            {/* 教育スタイル */}
                            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 relative group hover:border-purple-100 transition-colors">
                                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs font-bold">教育スタイル</span>
                                <p className="text-gray-600 text-sm text-center mt-2 leading-relaxed">
                                    {teacher.teachingStyle || '生徒の理解度に合わせた丁寧な指導を心がけています。'}
                                </p>
                            </div>
                        </div>

                        {/* 共有・学びたいこと */}
                        <div className="mb-8 relative border-t border-gray-100 pt-8">
                            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs font-bold">共有・学びたいこと</span>
                            <div className="grid grid-cols-3 gap-4">
                                {['最新技術トレンドについて', '日本語教育メソッド', '異文化交流'].map((item, i) => (
                                    <div key={i} className="bg-gray-100/50 rounded-xl p-4 flex items-center justify-center text-center aspect-[4/3]">
                                        <span className="text-xl font-bold text-gray-800 font-serif mr-2">{i + 1}</span>
                                        <p className="text-xs text-gray-600 font-medium leading-tight">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 他のこと */}
                        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 relative mt-10">
                            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs font-bold">他のこと</span>
                            <p className="text-gray-600 text-sm leading-relaxed mt-2 text-center">
                                {teacher.bio || '趣味は読書と写真撮影です。週末はカフェで技術書を読むのが好きです。新しい技術に常に興味を持っています。'}
                            </p>
                        </div>

                        {/* アクションボタン（右下にメインのつながりボタン） */}
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => onConnect(teacher)}
                                disabled={isConnecting}
                                className="bg-black text-white px-10 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {isConnecting ? '送信中...' : 'つながり'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

TeacherDetailModal.propTypes = {
    teacher: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onConnect: PropTypes.func.isRequired,
    isConnecting: PropTypes.bool
};

export default TeacherDetailModal;
