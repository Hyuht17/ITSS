import { useState } from 'react';

/**
 * Feedback Detail Modal Component
 * Read-only modal to display full feedback details
 */
const FeedbackDetailModal = ({ feedback, onClose }) => {
    if (!feedback) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
                            }`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">面談後の評価</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Feedback Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Evaluation Info */}
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <span className="text-sm text-gray-600">評価対象者：</span>
                                    <span className="font-medium text-gray-900 ml-2">{feedback.reviewerId?.name || 'Unknown'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <span className="text-sm text-gray-600">時間：</span>
                                    <span className="font-medium text-gray-900 ml-2">{formatDate(feedback.createdAt)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">全体評価：</span>
                                    <div className="flex gap-1">
                                        {renderStars(feedback.overallRating)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Ratings */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">詳細評価：</h3>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">知識・専門性：</span>
                                    <div className="flex gap-1">
                                        {renderStars(feedback.ratings?.knowledge || 0)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">伝達力：</span>
                                    <div className="flex gap-1">
                                        {renderStars(feedback.ratings?.communication || 0)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">態度：</span>
                                    <div className="flex gap-1">
                                        {renderStars(feedback.ratings?.attitude || 0)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                詳細なコメント：
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {feedback.comment || 'コメントはありません'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meeting Photo */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">ミーティング画像</h3>
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {feedback.meetingPhoto ? (
                                    <img
                                        src={feedback.meetingPhoto}
                                        alt="Meeting"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-500">画像未登録</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDetailModal;
