import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import LoadingSpinner from '../components/LoadingSpinner';
import { teacherAPI } from '../services/api';

/**
 * ホーム画面
 * 教師一覧を表示
 */
const Home = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await teacherAPI.getAllTeachers();
                setTeachers(response.data);
            } catch (err) {
                console.error('教師一覧取得エラー:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        教師一覧
                    </h1>

                    {loading ? (
                        <LoadingSpinner message="教師一覧を読み込み中..." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teachers.map((teacher) => (
                                <Link
                                    key={teacher.id}
                                    to={`/profile/${teacher.id}`}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                                >
                                    <img
                                        src={teacher.profilePhoto}
                                        alt={teacher.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                                            {teacher.name}
                                        </h2>
                                        <p className="text-gray-600 mb-2">{teacher.jobTitle}</p>
                                        <p className="text-sm text-gray-500">
                                            📍 {teacher.location} • ⏰ {teacher.yearsOfExperience}年
                                        </p>
                                        {teacher.specialties && teacher.specialties.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {teacher.specialties.slice(0, 3).map((specialty, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                                    >
                                                        {specialty}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
