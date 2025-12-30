import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import { matchingAPI } from '../services/api';

const MatchingStatus = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab from URL
    const getActiveTab = () => {
        if (location.pathname.includes('/approved')) return 'approved';
        if (location.pathname.includes('/finished')) return 'finished';
        return 'pending';
    };

    const activeTab = getActiveTab();
    const [requests, setRequests] = useState({ sent: [], received: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch requests on mount
    useEffect(() => {
        fetchMatchings();
    }, []);

    const fetchMatchings = async () => {
        try {
            setLoading(true);
            const response = await matchingAPI.getRequests();

            // Get current user ID - user object stores _id, not userId
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = localStorage.getItem('userId') || user._id || user.userId;
            const allMatchings = response.data || [];

            // Helper to extract ID from either string or object
            const getId = (ref) => (typeof ref === 'object' && ref?._id) ? ref._id : ref;

            const sent = allMatchings.filter(m => getId(m.requesterId) === userId);
            const received = allMatchings.filter(m => getId(m.receiverId) === userId);

            setRequests({ sent, received });
        } catch (err) {
            console.error('Error fetching matchings:', err);
            setError('マッチング情報の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await matchingAPI.approveRequest(id);
            fetchMatchings(); // Refresh
        } catch (err) {
            console.error(err);
            alert('承認に失敗しました');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('本当に拒否しますか？')) return;
        try {
            await matchingAPI.rejectRequest(id);
            fetchMatchings();
        } catch (err) {
            console.error(err);
            alert('拒否に失敗しました');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('申請を取り消しますか？')) return;
        try {
            await matchingAPI.cancelRequest(id);
            fetchMatchings();
        } catch (err) {
            console.error(err);
            alert('キャンセルに失敗しました');
        }
    };

    // Filter Logic
    const pendingReceived = (requests.received || []).filter(r => r.status === 'pending');
    const pendingSent = (requests.sent || []).filter(r => r.status === 'pending');

    const approvedMatches = [
        ...(requests.received || []).filter(r => r.status === 'approved'),
        ...(requests.sent || []).filter(r => r.status === 'approved')
    ];

    // Card Components
    const RequestCard = ({ request, type }) => {
        // type: 'received' or 'sent'
        const isReceived = type === 'received';
        const user = isReceived ? request.requesterId : request.receiverId;
        const teacher = user.teacherProfile || {};

        return (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={teacher.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <h4 className="font-bold text-gray-900">{user.name}</h4>
                        <p className="text-xs text-gray-500">{teacher.workplace || '所属なし'}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isReceived ? (
                        <>
                            <button
                                onClick={() => handleReject(request._id)}
                                className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50"
                            >
                                拒否
                            </button>
                            <button
                                onClick={() => handleApprove(request._id)}
                                className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800"
                            >
                                承認
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="text-sm text-gray-500 flex items-center mr-2">返信待つ</span>
                            <button
                                onClick={() => handleCancel(request._id)}
                                className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const ApprovedCard = ({ request }) => {
        const otherUser = request.requesterId.teacherProfile ? request.requesterId : request.receiverId;
        const teacher = otherUser.teacherProfile || {};

        return (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={teacher.profilePhoto || `https://ui-avatars.com/api/?name=${otherUser.name}&background=random`}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <h4 className="font-bold text-gray-900">{otherUser.name}</h4>
                        <p className="text-xs text-gray-500">{teacher.workplace || '所属なし'}</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/messages', { state: { selectedUserId: otherUser._id } })}
                    className="px-6 py-1.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800"
                >
                    メッセージ
                </button>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-8xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeTab === 'pending' ? '保留中' : activeTab === 'approved' ? '承認済み' : '終了'}
                            </h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            </div>
                        ) : activeTab === 'pending' ? (
                            <div className="space-y-8">
                                {/* Received Requests */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-500 mb-4">受信したリクエスト</h3>
                                    {pendingReceived.length > 0 ? (
                                        pendingReceived.map(req => (
                                            <RequestCard key={req._id} request={req} type="received" />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-dashed border border-gray-200">
                                            受信したリクエストはありません
                                        </div>
                                    )}
                                </section>

                                {/* Sent Requests */}
                                <section>
                                    <h3 className="text-sm font-bold text-gray-500 mb-4">送信したリクエスト</h3>
                                    {pendingSent.length > 0 ? (
                                        pendingSent.map(req => (
                                            <RequestCard key={req._id} request={req} type="sent" />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-dashed border border-gray-200">
                                            送信したリクエストはありません
                                        </div>
                                    )}
                                </section>
                            </div>
                        ) : activeTab === 'approved' ? (
                            <div className="space-y-4">
                                {approvedMatches.length > 0 ? (
                                    approvedMatches.map(req => (
                                        <ApprovedCard key={req._id} request={req} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        承認済みの教師はいません
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                終了したマッチングは あ りません
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MatchingStatus;
