import { useNavigate } from 'react-router-dom';

/**
 * プロフィールカードコンポーネント
 * 教師の詳細情報を表示
 */
const ProfileCard = ({ teacher, isOwner = false }) => {
    const navigate = useNavigate();

    if (!teacher) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* ヘッダー部分 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* プロフィール写真 */}
                    <img
                        src={teacher.profilePhoto}
                        alt={teacher.name}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />

                    {/* 基本情報 */}
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-bold mb-2">{teacher.name}</h2>
                        <p className="text-blue-100 text-lg mb-2">{teacher.jobTitle}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                                📍 {teacher.location}
                            </span>
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                                🏢 {teacher.workplace}
                            </span>
                            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                                ⏰ {teacher.yearsOfExperience}年の経験
                            </span>
                        </div>
                    </div>

                    {/* 編集ボタン */}
                    {isOwner && (
                        <button
                            onClick={() => navigate(`/profile/edit/${teacher.id}`)}
                            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium
                         hover:bg-blue-50 transition-colors duration-200"
                        >
                            編集
                        </button>
                    )}
                </div>
            </div>

            {/* 詳細情報 */}
            <div className="p-6 space-y-6">
                {/* 性別・国籍 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">性別</h3>
                        <p className="text-gray-800">{teacher.gender}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">国籍</h3>
                        <p className="text-gray-800">{teacher.nationality}</p>
                    </div>
                </div>

                {/* 専門分野 */}
                {teacher.specialties && teacher.specialties.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">専門分野</h3>
                        <div className="flex flex-wrap gap-2">
                            {teacher.specialties.map((specialty, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                    {specialty}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 教育スタイル */}
                {teacher.teachingStyle && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">教育スタイル</h3>
                        <p className="text-gray-700 leading-relaxed">{teacher.teachingStyle}</p>
                    </div>
                )}

                {/* 共有したいテーマ */}
                {teacher.shareThemes && teacher.shareThemes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            共有したいテーマ
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            {teacher.shareThemes.map((theme, index) => (
                                <li key={index} className="text-gray-700">
                                    {theme}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 学びたいテーマ */}
                {teacher.learnThemes && teacher.learnThemes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">
                            学びたいテーマ
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                            {teacher.learnThemes.map((theme, index) => (
                                <li key={index} className="text-gray-700">
                                    {theme}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 資格 */}
                {teacher.certifications && teacher.certifications.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">資格</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {teacher.certifications.map((cert, index) => (
                                <li key={index} className="text-gray-700">
                                    {cert}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* 趣味 */}
                {teacher.hobbies && teacher.hobbies.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">趣味</h3>
                        <div className="flex flex-wrap gap-2">
                            {teacher.hobbies.map((hobby, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {hobby}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* SNSリンク */}
                {teacher.socialLinks && Object.keys(teacher.socialLinks).length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">SNS</h3>
                        <div className="flex gap-4">
                            {teacher.socialLinks.twitter && (
                                <a
                                    href={teacher.socialLinks.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                    🐦 Twitter
                                </a>
                            )}
                            {teacher.socialLinks.facebook && (
                                <a
                                    href={teacher.socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    📘 Facebook
                                </a>
                            )}
                            {teacher.socialLinks.linkedin && (
                                <a
                                    href={teacher.socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900 transition-colors"
                                >
                                    💼 LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCard;
