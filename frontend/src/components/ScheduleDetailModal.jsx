/**
 * Schedule Detail Modal Component
 * Displays detailed information about a schedule
 */
const ScheduleDetailModal = ({ schedule, isOpen, onClose }) => {
    if (!isOpen || !schedule) return null;

    const formatDateTime = (date) => {
        const d = new Date(date);
        return d.toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">スケジュール詳細</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">予定名</div>
                        <div className="text-lg font-bold text-gray-900">{schedule.title}</div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">開始時間</div>
                            <div className="text-gray-900">{formatDateTime(schedule.startTime)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">終了時間</div>
                            <div className="text-gray-900">{formatDateTime(schedule.endTime)}</div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">時間</div>
                        <div className="text-gray-900">
                            {formatTime(schedule.startTime)} 〜 {formatTime(schedule.endTime)}
                        </div>
                    </div>

                    {/* Participants */}
                    {schedule.participants && schedule.participants.length > 0 && (
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">参加者</div>
                            <div className="space-y-2">
                                {schedule.participants.map((participant, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            {participant.profilePhoto ? (
                                                <img
                                                    src={participant.profilePhoto}
                                                    alt={participant.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-gray-600 font-bold">
                                                    {participant.name?.charAt(0) || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{participant.name}</div>
                                            <div className="text-sm text-gray-500">{participant.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    {schedule.location && (schedule.location.name || schedule.location.address) && (
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">場所</div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {schedule.location.name && (
                                    <div className="font-medium text-gray-900 mb-1">
                                        {schedule.location.name}
                                    </div>
                                )}
                                {schedule.location.address && (
                                    <div className="text-sm text-gray-600">
                                        {schedule.location.address}
                                    </div>
                                )}
                                {schedule.location.lat && schedule.location.lng && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        座標: {schedule.location.lat.toFixed(6)}, {schedule.location.lng.toFixed(6)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {schedule.description && (
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">共有内容</div>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                                {schedule.description}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {schedule.notes && (
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-2">メモ</div>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                                {schedule.notes}
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">ステータス</div>
                        <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                ${schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                                ${schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                ${schedule.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                            `}>
                                {schedule.status === 'confirmed' && '確認済み'}
                                {schedule.status === 'pending' && '保留中'}
                                {schedule.status === 'cancelled' && 'キャンセル'}
                                {schedule.status === 'completed' && '完了'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetailModal;
