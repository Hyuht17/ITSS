import { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import FeedbackDetailModal from '../components/FeedbackDetailModal';
import { feedbackAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Received Feedbacks Page
 * Display feedbacks received by current user in card format
 */
const ReceivedFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        fetchReceivedFeedbacks();
    }, []);

    const fetchReceivedFeedbacks = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await feedbackAPI.getReceived();
            setFeedbacks(response.data);

        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError('フィードバックの読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleDetailClick = (feedback) => {
        setSelectedFeedback(feedback);
    };

    const handleCloseModal = () => {
        setSelectedFeedback(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
                            }`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                ))}
            </div>
        );
    };

    const truncateComment = (comment, maxLength = 50) => {
        if (!comment) return '（コメントなし）';
        if (comment.length <= maxLength) return comment;
        return comment.substring(0, maxLength) + '...';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-6">
                {/* Outlet Frame Container */}
                <div className="max-w-8xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h1 className="text-2xl font-bold text-gray-900">フィードバック一覧</h1>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Gray Filter Bar */}
                    <div className="bg-gray-200 rounded-lg h-12 mb-6"></div>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-12">
                            <LoadingSpinner message="読み込み中..." />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && feedbacks.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                            <p className="text-gray-600 text-lg">受信したフィードバックはありません。</p>
                        </div>
                    )}

                    {/* Feedback Cards Grid - 3 per row */}
                    {!loading && !error && feedbacks.length > 0 && (
                        <div className="grid grid-cols-3 gap-5">
                            {feedbacks.map((feedback) => (
                                <div
                                    key={feedback._id}
                                    className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleDetailClick(feedback)}
                                >
                                    {/* Header: Round Avatar LEFT + Name/Date RIGHT */}
                                    <div className="flex items-start gap-3 mb-4">
                                        {/* Round Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                            {feedback.reviewerId?.profilePhoto ? (
                                                <img
                                                    src={feedback.reviewerId.profilePhoto}
                                                    alt={feedback.reviewerId.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-lg font-semibold">
                                                    {feedback.reviewerId?.name?.[0] || '?'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Name and Date Column */}
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900 text-base mb-0.5">
                                                {feedback.reviewerId?.name || 'Nguyen Van A'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                面談日：{formatDate(feedback.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comment Text */}
                                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                                        {truncateComment(feedback.comment, 80)}
                                    </p>

                                    {/* Large Meeting Photo Placeholder */}
                                    <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                                        {feedback.meetingPhoto ? (
                                            <img
                                                src={feedback.meetingPhoto}
                                                alt="Meeting"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Stars - Centered */}
                                    <div className="mb-4">
                                        {renderStars(feedback.overallRating)}
                                    </div>

                                    {/* Detail Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDetailClick(feedback);
                                        }}
                                        className="w-full bg-black text-white px-4 py-2.5 rounded-full hover:bg-gray-800 transition-colors font-semibold"
                                    >
                                        詳細
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Detail Modal */}
            {selectedFeedback && (
                <FeedbackDetailModal
                    feedback={selectedFeedback}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ReceivedFeedbacks;
