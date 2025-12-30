import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import { scheduleAPI, matchingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MiniWeeklyCalendar from '../components/MiniWeeklyCalendar';

/**
 * スケジュール作成画面
 * Create new schedule with form validation and conflict detection
 */
const CreateSchedule = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [matchingsLoading, setMatchingsLoading] = useState(true);
    const [acceptedMatchings, setAcceptedMatchings] = useState([]);
    const [error, setError] = useState(null);
    const [conflictError, setConflictError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        matchingId: '',
        partnerInfo: null,
        locationName: '',
        locationAddress: '',
        description: '',
        notes: ''
    });

    // Fetch accepted matchings on mount
    useEffect(() => {
        fetchAcceptedMatchings();
    }, []);

    const fetchAcceptedMatchings = async () => {
        try {
            setMatchingsLoading(true);
            const response = await matchingAPI.getAcceptedMatchings();
            setAcceptedMatchings(response.data || []);
        } catch (err) {
            console.error('Error fetching matchings:', err);
        } finally {
            setMatchingsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
        setConflictError(null);
    };

    const handleMatchingChange = (e) => {
        const matchingId = e.target.value;
        const selected = acceptedMatchings.find(m => m.matchingId === matchingId);

        setFormData(prev => ({
            ...prev,
            matchingId,
            partnerInfo: selected ? selected.partner : null
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('予定名を入力してください');
            return false;
        }
        if (!formData.date) {
            setError('日付を選択してください');
            return false;
        }
        if (!formData.startTime) {
            setError('開始時間を選択してください');
            return false;
        }
        if (!formData.endTime) {
            setError('終了時間を選択してください');
            return false;
        }

        // Check if end time is after start time
        const start = new Date(`${formData.date}T${formData.startTime}`);
        const end = new Date(`${formData.date}T${formData.endTime}`);

        if (end <= start) {
            setError('終了時間は開始時間より後である必要があります');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setConflictError(null);

            const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

            const scheduleData = {
                title: formData.title,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                matchingId: formData.matchingId || undefined,
                participants: formData.partnerInfo ? [formData.partnerInfo._id] : [],
                location: {
                    name: formData.locationName,
                    address: formData.locationAddress
                },
                description: formData.description,
                notes: formData.notes
            };

            const result = await scheduleAPI.createSchedule(scheduleData);

            if (result.success) {
                navigate('/schedule');
            }
        } catch (err) {
            console.error('Create schedule error:', err);

            if (err.response?.status === 409) {
                // Conflict error
                setConflictError(err.response.data);
            } else {
                setError(err.response?.data?.message || 'スケジュールの作成に失敗しました');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/schedule');
    };



    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-8xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            スケジュール一覧へ
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">新しいスケジュールを登録</h1>
                    </div>

                    {/* Error Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {conflictError && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                            <div className="font-bold mb-1">スケジュールが重複しています</div>
                            <div className="text-sm">
                                {conflictError.conflict && (
                                    <>
                                        既存の予定: {conflictError.conflict.title}<br />
                                        時間: {new Date(conflictError.conflict.startTime).toLocaleString('ja-JP')} 〜
                                        {new Date(conflictError.conflict.endTime).toLocaleString('ja-JP')}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form Section */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                {/* Title */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        予定名 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="例: 木村先生とのミーティング"
                                    />
                                </div>

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            日付選択 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            開始時間 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            終了時間 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Partner Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        相手（任意）
                                    </label>
                                    {matchingsLoading ? (
                                        <div className="text-gray-500 text-sm">読み込み中...</div>
                                    ) : acceptedMatchings.length === 0 ? (
                                        <div className="text-gray-500 text-sm">承認済みのマッチングがありません</div>
                                    ) : (
                                        <select
                                            name="matchingId"
                                            value={formData.matchingId}
                                            onChange={handleMatchingChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="">選択してください</option>
                                            {acceptedMatchings.map(matching => (
                                                <option key={matching.matchingId} value={matching.matchingId}>
                                                    {matching.partner.name} ({matching.partner.email})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {formData.partnerInfo && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            相手: {formData.partnerInfo.name} - {formData.partnerInfo.email}
                                        </div>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        場所
                                    </label>
                                    <input
                                        type="text"
                                        name="locationName"
                                        value={formData.locationName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                                        placeholder="場所名（例: ITSS会議室）"
                                    />
                                    <input
                                        type="text"
                                        name="locationAddress"
                                        value={formData.locationAddress}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="住所（例: 東京都渋谷区...）"
                                    />
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        共有内容
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="予定の内容や目的を記入"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        メモ
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        placeholder="補足情報や注意事項"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                                    >
                                        {loading ? '作成中...' : '登録する'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Mini Weekly Calendar */}
                        <div className="lg:col-span-1">
                            <MiniWeeklyCalendar selectedDate={formData.date} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateSchedule;
