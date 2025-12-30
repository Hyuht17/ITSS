import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import { matchingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Home Page
 * Main dashboard with banner, recent interactions, and interest topics
 */
const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recentInteractions, setRecentInteractions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentInteractions();
    }, []);

    const fetchRecentInteractions = async () => {
        try {
            setLoading(true);
            const response = await matchingAPI.getFinished();
            setRecentInteractions(response.data || []);
        } catch (err) {
            console.error('Error fetching recent interactions:', err);
            setRecentInteractions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Interest topics data
    const interestTopics = [
        { id: 1, title: 'プログラミング教育', color: 'bg-blue-50 border-blue-200' },
        { id: 2, title: 'STEAM教育', color: 'bg-purple-50 border-purple-200' },
        { id: 3, title: '国際交流', color: 'bg-green-50 border-green-200' },
        { id: 4, title: 'カリキュラム開発', color: 'bg-orange-50 border-orange-200' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">ホーム</h1>
                        <button
                            onClick={() => navigate('/logout')}
                            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Banner Section */}
                    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10 max-w-xl">
                            <h2 className="text-2xl font-bold mb-2">一緒に指導方法を共有して、成長する教育</h2>
                            <h2 className="text-2xl font-bold mb-3">コミュニティをつくりましょう！</h2>
                            <p className="text-lg mb-6 opacity-90">いつでも、どこでも、好きなときに。</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/teacher-connection')}
                                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
                                >
                                    今すぐつながろう
                                </button>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                                >
                                    マイプロフィールを見る
                                </button>
                            </div>
                        </div>

                        {/* Illustration placeholder on right */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 opacity-20">
                            <div className="w-full h-full flex items-center justify-center">
                                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                                    <circle cx="100" cy="60" r="20" stroke="white" strokeWidth="3" />
                                    <circle cx="60" cy="130" r="20" stroke="white" strokeWidth="3" />
                                    <circle cx="140" cy="130" r="20" stroke="white" strokeWidth="3" />
                                    <line x1="100" y1="80" x2="70" y2="115" stroke="white" strokeWidth="2" />
                                    <line x1="100" y1="80" x2="130" y2="115" stroke="white" strokeWidth="2" />
                                    <path d="M60 150 Q100 170 140 150" stroke="white" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Recent Interactions Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            最近、どんな先生と交流しましたか？一緒に振り返ってみましょう！
                        </h2>

                        {loading ? (
                            <LoadingSpinner message="読み込み中..." />
                        ) : (
                            <div className="relative">
                                {/* Left scroll indicator */}
                                <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Cards container */}
                                <div className="flex gap-4 overflow-x-auto pb-4 px-12 scrollbar-hide">
                                    {recentInteractions.length === 0 ? (
                                        <div className="w-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                                            <p className="text-gray-500">まだ交流がありません。今すぐつながろう！</p>
                                            <button
                                                onClick={() => navigate('/teacher-connection')}
                                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                            >
                                                教師を探す
                                            </button>
                                        </div>
                                    ) : (
                                        recentInteractions.map((interaction, index) => {
                                            const partner = interaction.requesterId._id === user?.userId
                                                ? interaction.receiverId
                                                : interaction.requesterId;
                                            const teacherProfile = partner?.teacherProfile;

                                            return (
                                                <div
                                                    key={interaction._id || index}
                                                    onClick={() => navigate(`/messages?userId=${partner._id}`)}
                                                    className="flex-shrink-0 w-52 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow cursor-pointer"
                                                >
                                                    {/* Large circular avatar */}
                                                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                                        {teacherProfile?.profilePhoto ? (
                                                            <img
                                                                src={teacherProfile.profilePhoto}
                                                                alt={partner.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                                                                {partner.name?.[0] || 'T'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Teacher Info */}
                                                    <h3 className="text-center font-bold text-gray-900 mb-1">{partner.name}</h3>
                                                    <p className="text-center text-sm text-gray-600 mb-1">
                                                        {teacherProfile?.specialties?.[0] || teacherProfile?.jobTitle || 'ベテラン教師'}
                                                    </p>
                                                    <p className="text-center text-xs text-gray-500 mb-2">
                                                        {teacherProfile?.location || '東京都'}
                                                    </p>
                                                    <p className="text-center text-xs text-gray-400">{formatDate(interaction.updatedAt)}</p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Right scroll indicator */}
                                <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Interest Topics Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            最近、これらの内容に関心がありますか？
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {interestTopics.map((topic) => (
                                <div
                                    key={topic.id}
                                    onClick={() => navigate('/teacher-connection')}
                                    className={`${topic.color} rounded-xl border-2 p-6 hover:shadow-md transition-shadow cursor-pointer`}
                                >
                                    <h3 className="font-bold text-gray-900 text-center">{topic.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Home;
