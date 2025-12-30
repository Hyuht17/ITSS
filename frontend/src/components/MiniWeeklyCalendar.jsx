import { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';

/**
 * Mini Weekly Calendar Component
 * Shows current week's schedule to avoid conflicts
 */
const MiniWeeklyCalendar = ({ selectedDate }) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

    // Get Monday of current week
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    // Get end of week
    function getWeekEnd(weekStart) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    // Get array of 7 days
    function getWeekDays() {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    }

    const weekDays = getWeekDays();
    const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

    // Fetch schedules for current week
    useEffect(() => {
        fetchSchedules();
    }, [currentWeekStart]);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const weekEnd = getWeekEnd(currentWeekStart);
            const response = await scheduleAPI.getSchedules(currentWeekStart, weekEnd);
            setSchedules(response.data || []);
        } catch (err) {
            console.error('Error fetching schedules:', err);
        } finally {
            setLoading(false);
        }
    };

    // Get schedules for a specific day
    const getSchedulesForDay = (date) => {
        return schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime);
            return scheduleDate.getDate() === date.getDate() &&
                scheduleDate.getMonth() === date.getMonth() &&
                scheduleDate.getFullYear() === date.getFullYear();
        });
    };

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Check if date is selected
    const isSelected = (date) => {
        if (!selectedDate) return false;
        const selected = new Date(selectedDate);
        return date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">今週のスケジュール</h3>

            {loading ? (
                <div className="text-center py-8 text-gray-500">読み込み中...</div>
            ) : (
                <>
                    {/* Week Calendar */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {weekDays.map((day, index) => {
                            const daySchedules = getSchedulesForDay(day);
                            const hasSchedules = daySchedules.length > 0;
                            const todayClass = isToday(day) ? '' : '';
                            const selectedClass = isSelected(day) ? 'bg-gray-800 text-white' : '';

                            return (
                                <div key={index} className={`text-center ${todayClass}`}>
                                    <div className={`text-xs font-medium text-gray-600 mb-1 ${selectedClass && 'text-black'}`}>
                                        {dayNames[index]}
                                    </div>
                                    <div className={`
                                        w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm
                                        ${selectedClass || (hasSchedules ? 'bg-gray-100' : '')}
                                    `}>
                                        {day.getDate()}
                                    </div>
                                    {hasSchedules && !selectedClass && (
                                        <div className="mt-1">
                                            <div className="w-1 h-1 bg-gray-900 rounded-full mx-auto"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Schedule List */}
                    {schedules.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {schedules.map(schedule => {
                                const start = new Date(schedule.startTime);
                                const end = new Date(schedule.endTime);
                                return (
                                    <div key={schedule._id} className="bg-gray-50 rounded-lg p-3 text-sm">
                                        <div className="font-medium text-gray-900 truncate">{schedule.title}</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                            {' '}
                                            {start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                            〜
                                            {end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            今週の予定はありません
                        </div>
                    )}

                    {/* Warning Message */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800">
                            ⚠️ 登録済みの予定との重複にご注意ください
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default MiniWeeklyCalendar;
