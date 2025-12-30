import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import TeacherCard from '../components/TeacherCard';
import { teacherAPI } from '../services/api';

/**
 * 教師おすすめ表示画面
 * 登録条件に基づいてマッチする教師を表示
 */
const TeacherRecommendations = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1); // API uses 1-based indexing
    const [registeredConditions, setRegisteredConditions] = useState({
        timeSlots: [],
        cities: []
    });
    const [teachers, setTeachers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 教師データを取得
    const fetchTeachers = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                timeSlots: registeredConditions.timeSlots,
                cities: registeredConditions.cities,
                page,
                limit: 6
            };

            const response = await teacherAPI.getRecommendations(params);

            if (response.success) {
                setTeachers(response.data.teachers);
                setPagination(response.data.pagination);
            } else {
                setError('教師データの取得に失敗しました');
            }
        } catch (err) {
            console.error('教師データ取得エラー:', err);
            setError('教師データの取得中にエラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    // 登録条件を取得
    useEffect(() => {
        // LocalStorageから登録条件を取得
        const savedConditions = localStorage.getItem('searchConditions');
        if (savedConditions) {
            setRegisteredConditions(JSON.parse(savedConditions));
        } else {
            // デフォルト条件
            setRegisteredConditions({
                timeSlots: ['morning', 'afternoon'],
                cities: ['ハノイ', 'ダナン', 'ホーチミン市']
            });
        }
    }, []);

    // 条件が変わったら教師データ取得
    useEffect(() => {
        if (registeredConditions.timeSlots.length > 0 || registeredConditions.cities.length > 0) {
            fetchTeachers(currentPage);
        }
    }, [registeredConditions, currentPage]);


    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleEditConditions = () => {
        navigate('/connection');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-8xl mx-auto">
                    {/* ヘッダー */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-xl font-bold text-gray-900">教師とのつながり</h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 登録済み条件表示 */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            登録済み: <span className="font-semibold">{registeredConditions.timeSlots.length}つの時間帯</span>、
                            <span className="font-semibold">{registeredConditions.cities.length}つの地域</span>
                        </div>
                        <button
                            onClick={handleEditConditions}
                            className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            編集
                        </button>
                    </div>

                    {/* 教師カード一覧 with スクロール */}
                    <div className="relative min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-gray-500">読み込み中...</div>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-red-500">{error}</div>
                            </div>
                        ) : teachers.length === 0 ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-gray-500">条件に一致する教師が見つかりませんでした</div>
                            </div>
                        ) : (
                            <>
                                {/* 左矢印 */}
                                {currentPage > 1 && (
                                    <button
                                        onClick={handlePrevPage}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {/* カードグリッド */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {teachers.map(teacher => (
                                        <TeacherCard
                                            key={teacher.id}
                                            teacher={teacher}
                                            matchedConditions={teacher.matchedConditions || { timeSlots: [], location: null, specialties: [] }}
                                        />
                                    ))}
                                </div>

                                {/* 右矢印 */}
                                {currentPage < pagination.totalPages && (
                                    <button
                                        onClick={handleNextPage}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* ページインジケーター */}
                    {pagination.totalPages > 1 && !loading && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: pagination.totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`w-2 h-2 rounded-full transition-colors ${index + 1 === currentPage ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherRecommendations;
