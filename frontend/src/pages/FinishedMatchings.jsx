import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import { matchingAPI, feedbackAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

/**
 * Finished Matchings Page
 * Shows list of approved matchings with feedback button
 */
const FinishedMatchings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [matchings, setMatchings] = useState([]);
    const [feedbackStatus, setFeedbackStatus] = useState({}); // Track feedback status for each matching
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFinishedMatchings();
    }, []);

    const fetchFinishedMatchings = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get finished matchings with properly populated user data
            const response = await matchingAPI.getFinished();

            setMatchings(response.data || []);

            // Check feedback status for each matching
            await checkFeedbackStatus(response.data || []);

        } catch (err) {
            console.error('Error fetching matchings:', err);
            setError('マッチング情報の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const checkFeedbackStatus = async (matchings) => {
        const statusMap = {};

        // Check each matching for existing feedback from current user
        await Promise.all(
            matchings.map(async (matching) => {
                try {
                    const response = await feedbackAPI.getByMatching(matching._id);

                    console.log('Checking feedback for matching:', matching._id);
                    console.log('Current user ID:', user?._id);
                    console.log('Feedbacks received:', response.data);

                    // Check if current user has already given feedback
                    // response.data contains ALL feedbacks for this matching (from both users)
                    // We need to check if any feedback has reviewerId === current user
                    const userFeedback = response.data?.find(
                        feedback => {
                            const reviewerId = feedback.reviewerId?._id?.toString() || feedback.reviewerId?.toString();
                            const currentUserId = user?._id?.toString();
                            console.log('Comparing:', reviewerId, 'vs', currentUserId, '=', reviewerId === currentUserId);
                            return reviewerId === currentUserId;
                        }
                    );

                    console.log('User has feedback?', !!userFeedback);
                    statusMap[matching._id] = !!userFeedback;
                } catch (err) {
                    console.log('Error checking feedback:', err);
                    // If 404 or error, no feedback exists
                    statusMap[matching._id] = false;
                }
            })
        );

        setFeedbackStatus(statusMap);
    };

    const handleFeedbackClick = (matching) => {
        const hasFeedback = feedbackStatus[matching._id];

        if (hasFeedback) {
            // Navigate to view feedback instead
            navigate(`/feedback`);
        } else {
            navigate(`/feedback/create/${matching._id}`);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <h1 className="text-3xl font-bold text-gray-900">終了</h1>
                        </div>
                    </div>

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
                    {!loading && !error && matchings.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 text-lg">終了したマッチングはありません。</p>
                        </div>
                    )}

                    {/* Matchings List */}
                    {!loading && !error && matchings.length > 0 && (
                        <div className="space-y-4">
                            {matchings.map((matching) => {
                                // Determine the partner (the other person)
                                const isRequester = matching.requesterId?._id === user?._id;
                                const partner = isRequester ? matching.receiverId : matching.requesterId;
                                const teacherProfile = partner?.teacherProfile;
                                const hasFeedback = feedbackStatus[matching._id];

                                return (
                                    <div
                                        key={matching._id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            {/* Left: Profile Info */}
                                            <div className="flex items-center gap-4">
                                                {/* Profile Photo */}
                                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                    {teacherProfile?.profilePhoto ? (
                                                        <img
                                                            src={teacherProfile.profilePhoto}
                                                            alt={partner?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Name and Workplace */}
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {partner?.name || 'Unknown'}
                                                    </h3>
                                                    {/* Display finish date */}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        終了日: {new Date(matching.updatedAt).toLocaleDateString('ja-JP', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Feedback Button */}
                                            <button
                                                onClick={() => handleFeedbackClick(matching)}
                                                className={`px-6 py-2 rounded-full transition-colors ${hasFeedback
                                                    ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                                    }`}
                                            >
                                                {hasFeedback ? '評価済み' : 'フィードバック'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FinishedMatchings;
