import { useState } from 'react';
import SideMenu from '../components/SideMenu';
import { availabilityAPI, teacherAPI, matchingAPI } from '../services/api';
import TeacherCard from '../components/TeacherCard';
import TeacherDetailModal from '../components/TeacherDetailModal';

/**
 * 教師とのつながり画面
 * 空き時間と活動地域を登録
 */
const TeacherConnection = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)); //  October 2025
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [recommendedTeachers, setRecommendedTeachers] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(true);

    // Modal state
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // 都市リスト
    const cities = [
        'ハノイ',
        'ダナン',
        'ニャチャン',
        'カントー',
        'ホーチミン市',
        'ハイフォン'
    ];

    // 時間帯オプション
    const timeSlots = [
        { id: 'morning', label: '朝 (06:00 - 12:00)' },
        { id: 'afternoon', label: '昼 (12:00 - 18:00)' },
        { id: 'evening', label: '夜 (18:00 - 22:00)' }
    ];

    // カレンダー生成
    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const calendar = [];
        let week = [];

        // 前月の日付で埋める
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
            week.push({ date: prevMonthDay, isCurrentMonth: false });
        }

        // 当月の日付
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            week.push({ date, isCurrentMonth: true });

            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }

        // 次月の日付で埋める
        if (week.length > 0) {
            const remainingDays = 7 - week.length;
            for (let i = 1; i <= remainingDays; i++) {
                const nextMonthDay = new Date(year, month + 1, i);
                week.push({ date: nextMonthDay, isCurrentMonth: false });
            }
            calendar.push(week);
        }

        return calendar;
    };

    // 日付選択
    const handleDateClick = (date, isCurrentMonth) => {
        if (!isCurrentMonth) return;

        // 過去の日付をチェック
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDay = new Date(date);
        selectedDay.setHours(0, 0, 0, 0);

        if (selectedDay < today) {
            setError('過去の日付は選択できません');
            return;
        }

        setError(null);
        setSelectedDate(date);
    };

    // 時間帯選択
    const handleTimeSlotToggle = (slotId) => {
        setSelectedTimeSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(id => id !== slotId)
                : [...prev, slotId]
        );
    };

    // 都市選択
    const handleCityToggle = (city) => {
        setSelectedCities(prev =>
            prev.includes(city)
                ? prev.filter(c => c !== city)
                : [...prev, city]
        );
    };

    // 月変更
    const changeMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + direction);
            return newMonth;
        });
    };

    // 保存処理
    // おすすめ教師を取得
    const fetchRecommendations = async (conditions) => {
        try {
            setLoadingRecommendations(true);
            const response = await teacherAPI.getRecommendations(conditions);

            if (response.success) {
                setRecommendedTeachers(response.data.teachers || []);
            }
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    // 保存処理
    const handleSave = async () => {
        try {
            // バリデーション
            if (!selectedDate) {
                setError('日付を選択してください');
                return;
            }

            if (selectedTimeSlots.length === 0) {
                setError('時間帯を少なくとも1つ選択してください');
                return;
            }

            if (selectedCities.length === 0) {
                setError('活動地域を少なくとも1つ選択してください');
                return;
            }

            setError(null);
            setSuccessMessage(null);
            setSaving(true);

            // 日付をISO形式に変換
            const dateStr = selectedDate.toISOString().split('T')[0];

            // API用のデータ形式に変換
            const availabilities = selectedCities.map(city => ({
                date: dateStr,
                timeSlots: selectedTimeSlots,
                location: city
            }));

            // API呼び出し
            const response = await availabilityAPI.registerAvailability(availabilities);

            if (response.success) {
                setSuccessMessage('空き時間を登録しました！');
                setShowRegistrationForm(false); // Switch view immediately

                // 検索条件をLocalStorageに保存
                const searchConditions = {
                    timeSlots: selectedTimeSlots,
                    cities: selectedCities
                };
                localStorage.setItem('searchConditions', JSON.stringify(searchConditions));

                // フォームをリセット
                // setSelectedDate(null); // Keep selection for re-edit
                // setSelectedTimeSlots([]); 
                // setSelectedCities([]);

                // おすすめ教師を取得
                await fetchRecommendations(searchConditions);
            }
        } catch (err) {
            console.error('空き時間登録エラー:', err);
            setError(err.response?.data?.message || '登録に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const handleConnect = async (teacher) => {
        setIsConnecting(true);
        try {
            // The recommendations API now returns userId directly
            const receiverId = teacher.userId;

            if (!receiverId) {
                throw new Error('Teacher userId is missing');
            }

            await matchingAPI.createRequest(receiverId);
            setSuccessMessage('マッチング申請を送信しました');
            setSelectedTeacher(null); // Close modal

            // Clear message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Connection error:', err);
            setError(err.response?.data?.message || '申請に失敗しました');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsConnecting(false);
        }
    };

    const calendar = generateCalendar();
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideMenu />

            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* ヘッダー */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="p-1">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="h-6 w-px bg-gray-300"></div>
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

                    {/* エラー・成功メッセージ */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-green-800">{successMessage}</p>
                        </div>
                    )}

                    {showRegistrationForm ? (
                        <div>
                            {/* サブタイトル */}
                            <p className="text-gray-600 mb-6">
                                空き時間と活動地域を登録して、あなたにぴったりの教師を見つけましょう
                            </p>

                            {/* メインコンテンツ */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 左側：時間セクション */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h2 className="text-lg font-bold text-gray-900">時間</h2>
                                    </div>

                                    {/* カレンダー */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-gray-700">日付を選択</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => changeMonth(-1)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                                                    {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                                                </span>
                                                <button
                                                    onClick={() => changeMonth(1)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* 曜日ヘッダー */}
                                            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                                                {weekDays.map(day => (
                                                    <div key={day} className="text-center py-2 text-xs font-semibold text-gray-600">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* カレンダー本体 */}
                                            {calendar.map((week, weekIdx) => (
                                                <div key={weekIdx} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
                                                    {week.map((day, dayIdx) => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        const dayDate = new Date(day.date);
                                                        dayDate.setHours(0, 0, 0, 0);
                                                        const isPastDate = dayDate < today;

                                                        const isSelected = selectedDate &&
                                                            day.date.getDate() === selectedDate.getDate() &&
                                                            day.date.getMonth() === selectedDate.getMonth() &&
                                                            day.isCurrentMonth;

                                                        return (
                                                            <button
                                                                key={dayIdx}
                                                                onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                                                                disabled={(isPastDate && day.isCurrentMonth) || !showRegistrationForm}
                                                                className={`
                                                            py-3 text-sm transition-colors border-r border-gray-200 last:border-r-0
                                                            ${!day.isCurrentMonth ? 'text-gray-300 cursor-default' : ''}
                                                            ${day.isCurrentMonth && isPastDate ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
                                                            ${day.isCurrentMonth && !isPastDate ? 'text-gray-900 hover:bg-gray-50' : ''}
                                                            ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                                        `}
                                                            >
                                                                {day.date.getDate()}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 時間帯選択 */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">時間帯</h3>
                                        <div className="space-y-2">
                                            {timeSlots.map(slot => (
                                                <label
                                                    key={slot.id}
                                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        disabled={!showRegistrationForm}
                                                        checked={selectedTimeSlots.includes(slot.id)}
                                                        onChange={() => handleTimeSlotToggle(slot.id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{slot.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 右側：地域セクション */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <h2 className="text-lg font-bold text-gray-900">地域</h2>
                                    </div>

                                    {/* 都市リスト（2列） */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {cities.map((city, index) => (
                                            <label
                                                key={index}
                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    disabled={!showRegistrationForm}
                                                    checked={selectedCities.includes(city)}
                                                    onChange={() => handleCityToggle(city)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{city}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 保存ボタン */}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`px-12 py-3 rounded-full font-medium transition-colors ${saving
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {saving ? '保存中...' : '保存'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8">
                            {/* Summary & Edit Button */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">登録された条件</h2>
                                <button
                                    onClick={() => setShowRegistrationForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    編集
                                </button>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl mb-12 flex flex-wrap gap-8 text-gray-700 shadow-sm border border-blue-100">
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">日付</span>
                                    <span className="font-medium text-lg text-gray-900">{selectedDate ? selectedDate.toLocaleDateString() : '未選択'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">時間帯</span>
                                    <span className="font-medium text-lg text-gray-900">
                                        {selectedTimeSlots.map(ts => timeSlots.find(s => s.id === ts)?.label.split(' ')[0]).join(', ')}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">地域</span>
                                    <span className="font-medium text-lg text-gray-900">{selectedCities.join(', ')}</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-6">あなたへのおすすめの教師</h2>

                            {loadingRecommendations ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">おすすめの教師を探しています...</p>
                                </div>
                            ) : recommendedTeachers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recommendedTeachers.map((teacher, index) => (
                                        <TeacherCard
                                            key={teacher._id || index}
                                            teacher={teacher}
                                            matchedConditions={teacher.matchedConditions}
                                            onClick={() => handleTeacherClick(teacher)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                    <p className="text-gray-600 text-lg">条件に一致する教師が見つかりませんでした。</p>
                                    <p className="text-gray-500 mt-2">条件を変更して再度検索してみてください。</p>
                                </div>
                            )}

                            {/* Teacher Detail Modal */}
                            {selectedTeacher && (
                                <TeacherDetailModal
                                    teacher={selectedTeacher}
                                    onClose={() => setSelectedTeacher(null)}
                                    onConnect={() => handleConnect(selectedTeacher)}
                                    isConnecting={isConnecting}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
};

export default TeacherConnection;
