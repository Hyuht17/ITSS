import { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import { scheduleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ScheduleDetailModal from '../components/ScheduleDetailModal';
import locationIcon from '../assets/location.svg';

/**
 * スケジュール管理画面
 * Weekly calendar view with schedule cards matching wireframe design
 */
const Schedule = () => {
    // Get current date and week
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Time slots for the schedule (09:00 to 21:00)
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];

    // Get Monday of current week
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    // Get end of week (Sunday)
    const getWeekEnd = (weekStart) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
    };

    // Get array of 7 days starting from Monday
    const getWeekDays = () => {
        const weekStart = getWeekStart(currentDate);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays();
    const dayNames = ['時間', '月', '火', '水', '木', '金', '土', '日'];

    // Fetch schedules from API
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                setError(null);

                const weekStart = getWeekStart(currentDate);
                const weekEnd = getWeekEnd(weekStart);

                const schedulesData = await scheduleAPI.getSchedules(weekStart, weekEnd);

                console.log('Fetched schedules:', schedulesData.data); // Debug
                setSchedules(schedulesData.data || []);

            } catch (err) {
                console.error('スケジュール取得エラー:', err);
                setError('スケジュールの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [currentDate]);

    // Navigate to previous/next week
    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    // Format date for display
    const formatMonth = () => {
        return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
    };

    // Get all schedules for a specific day (regardless of time)
    const getSchedulesForDay = (dayIndex) => {
        const targetDate = weekDays[dayIndex];

        return schedules.filter(schedule => {
            const scheduleStart = new Date(schedule.startTime);
            return scheduleStart.getDate() === targetDate.getDate() &&
                scheduleStart.getMonth() === targetDate.getMonth() &&
                scheduleStart.getFullYear() === targetDate.getFullYear();
        });
    };

    // Get schedule for a specific day and time slot
    const getScheduleForTimeSlot = (dayIndex, timeSlot) => {
        const targetDate = weekDays[dayIndex];
        const [hours] = timeSlot.split(':');
        const slotHour = parseInt(hours, 10);

        return schedules.find(schedule => {
            const scheduleStart = new Date(schedule.startTime);
            const scheduleHour = scheduleStart.getHours();

            // Check if schedule is on the same day and hour
            return scheduleStart.getDate() === targetDate.getDate() &&
                scheduleStart.getMonth() === targetDate.getMonth() &&
                scheduleStart.getFullYear() === targetDate.getFullYear() &&
                scheduleHour === slotHour;
        });
    };

    // Format time to HH:MM
    const formatTime = (date) => {
        const d = new Date(date);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // Get schedule title
    const getScheduleTitle = (schedule) => {
        if (schedule.title) return schedule.title;
        if (schedule.participants && schedule.participants.length > 0) {
            return `${schedule.participants[0].name}先生に会う`;
        }
        return '予定';
    };

    // Handle schedule card click
    const handleScheduleClick = (schedule) => {
        setSelectedSchedule(schedule);
        setIsModalOpen(true);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSchedule(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-8xl mx-auto">
                    {/* Header with navigation and new schedule button */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 p-6">
                        <div className="flex items-center justify-between mb-6">
                            {/* Month navigation */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigateWeek(-1)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-xl font-bold text-gray-900">{formatMonth()}</h2>
                                <button
                                    onClick={() => navigateWeek(1)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* New schedule button */}
                            <button
                                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                                onClick={() => window.location.href = '/schedule/create'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                新しい予定を登録
                            </button>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="py-12">
                                <LoadingSpinner message="スケジュールを読み込み中..." />
                            </div>
                        )}

                        {/* Error state */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Weekly calendar grid */}
                        {!loading && !error && (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    {/* Header row with day names and dates */}
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            {dayNames.map((name, index) => (
                                                <th key={index} className="p-4 text-center bg-gray-50">
                                                    <div className="font-bold text-gray-900">{name}</div>
                                                    {index > 0 && (
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {weekDays[index - 1].getDate()}
                                                        </div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Time slots rows */}
                                    <tbody>
                                        {timeSlots.map((timeSlot, timeIndex) => (
                                            <tr key={timeIndex} className="border-b border-gray-200">
                                                {/* Time label */}
                                                <td className="p-4 text-center font-medium text-gray-600 bg-gray-50 border-r border-gray-200">
                                                    {timeSlot}
                                                </td>

                                                {/* Day cells */}
                                                {weekDays.map((day, dayIndex) => {
                                                    const scheduleForSlot = getScheduleForTimeSlot(dayIndex, timeSlot);

                                                    return (
                                                        <td key={dayIndex} className="p-2 align-top border-r border-gray-200 min-h-[100px]">
                                                            {/* Show schedule if it matches this time slot */}
                                                            {scheduleForSlot && (
                                                                <div
                                                                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                                                                    onClick={() => handleScheduleClick(scheduleForSlot)}
                                                                >
                                                                    <div className="font-medium text-sm text-gray-900 mb-1">
                                                                        {getScheduleTitle(scheduleForSlot)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        {formatTime(scheduleForSlot.startTime)}〜{formatTime(scheduleForSlot.endTime)}
                                                                    </div>
                                                                    {scheduleForSlot.location && scheduleForSlot.location.name && (
                                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                            <img src={locationIcon} alt="location" className="w-3 h-3" />
                                                                            {scheduleForSlot.location.name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main >

            {/* Schedule Detail Modal */}
            < ScheduleDetailModal
                schedule={selectedSchedule}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div >
    );
};

export default Schedule;
