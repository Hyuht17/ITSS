import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import StarRating from '../components/StarRating';
import { feedbackAPI, matchingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

/**
 * Create Feedback Page
 * Form for creating feedback on finished matching
 */
const CreateFeedback = () => {
    const { matchingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [matching, setMatching] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        overallRating: 0,
        ratings: {
            knowledge: 0,
            communication: 0,
            attitude: 0
        },
        comment: '',
        meetingPhoto: ''
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        fetchMatchingData();
    }, [matchingId]);

    const fetchMatchingData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get matching details
            const matchings = await matchingAPI.getRequests();
            const targetMatching = matchings.data.find(m => m._id === matchingId);

            if (!targetMatching) {
                setError('マッチングが見つかりません');
                return;
            }

            setMatching(targetMatching);

        } catch (err) {
            console.error('Error fetching matching:', err);
            setError('マッチング情報の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (field, value) => {
        if (field === 'overallRating') {
            setFormData(prev => ({
                ...prev,
                overallRating: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                ratings: {
                    ...prev.ratings,
                    [field]: value
                }
            }));
        }
    };

    const handleCommentChange = (e) => {
        const value = e.target.value;
        if (value.length <= 300) {
            setFormData(prev => ({
                ...prev,
                comment: value
            }));
        }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('画像ファイルは5MB以下にしてください');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('画像ファイルのみアップロード可能です');
                return;
            }

            setPhotoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setFormData(prev => ({ ...prev, meetingPhoto: '' }));
    };

    const uploadPhotoToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('photo', file);

        const token = localStorage.getItem('accessToken');
        const response = await fetch(
            'http://localhost:5000/api/upload/meeting-photo',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Meeting photo upload error:', errorData);
            throw new Error(
                errorData.message ||
                `画像のアップロードに失敗しました (${response.status})`
            );
        }

        const data = await response.json();
        return data.data.url;
    };

    const validateForm = () => {
        if (formData.overallRating === 0) {
            setError('全体評価を選択してください');
            return false;
        }
        if (formData.ratings.knowledge === 0) {
            setError('知識・専門性の評価を選択してください');
            return false;
        }
        if (formData.ratings.communication === 0) {
            setError('伝達力の評価を選択してください');
            return false;
        }
        if (formData.ratings.attitude === 0) {
            setError('態度の評価を選択してください');
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
            setSubmitting(true);
            setError(null);

            // Upload photo if selected
            let meetingPhotoUrl = formData.meetingPhoto;
            if (photoFile) {
                setUploadingPhoto(true);
                meetingPhotoUrl = await uploadPhotoToCloudinary(photoFile);
                setUploadingPhoto(false);
            }

            const feedbackData = {
                matchingId,
                ...formData,
                meetingPhoto: meetingPhotoUrl
            };

            await feedbackAPI.create(feedbackData);

            setSuccess(true);
            setTimeout(() => {
                navigate('/matching-status/finished');
            }, 2000);

        } catch (err) {
            console.error('Submit feedback error:', err);
            setError(err.response?.data?.message || '評価の送信に失敗しました');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <SideMenu />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <LoadingSpinner message="読み込み中..." />
                </main>
            </div>
        );
    }

    // Get current user and determine partner
    const isRequester = matching?.requesterId?._id === user?.userId;
    const partner = isRequester ? matching?.receiverId : matching?.requesterId;
    const teacherProfile = partner?.teacherProfile;

    const meetingDate = matching?.updatedAt ? new Date(matching.updatedAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '日時未定';

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/matching-status/finished')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            戻る
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">フィードバック作成</h1>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            評価を送信しました。
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !success && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Form Section */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200">
                                {/* Evaluation Info Section */}
                                <div className="p-6 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">面談後の評価</h2>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <span className="text-sm text-gray-600">評価対象者：</span>
                                                <span className="font-medium text-gray-900 ml-2">{partner?.name}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <span className="text-sm text-gray-600">時間：</span>
                                                <span className="font-medium text-gray-900 ml-2">{meetingDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ratings Section */}
                                <div className="p-6 space-y-6">
                                    {/* Overall Rating */}
                                    <div>
                                        <h3 className="text-md font-bold text-gray-900 mb-3">全体評価</h3>
                                        <StarRating
                                            value={formData.overallRating}
                                            onChange={(value) => handleRatingChange('overallRating', value)}
                                            required
                                        />
                                    </div>

                                    {/* Detailed Ratings */}
                                    <div>
                                        <h3 className="text-md font-bold text-gray-900 mb-3">詳細評価</h3>
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                            <StarRating
                                                label="知識・専門性"
                                                value={formData.ratings.knowledge}
                                                onChange={(value) => handleRatingChange('knowledge', value)}
                                                required
                                            />
                                            <StarRating
                                                label="伝達力"
                                                value={formData.ratings.communication}
                                                onChange={(value) => handleRatingChange('communication', value)}
                                                required
                                            />
                                            <StarRating
                                                label="態度"
                                                value={formData.ratings.attitude}
                                                onChange={(value) => handleRatingChange('attitude', value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <h3 className="text-md font-bold text-gray-900 mb-3">
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            詳細なコメント
                                        </h3>
                                        <textarea
                                            value={formData.comment}
                                            onChange={handleCommentChange}
                                            rows="5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            placeholder="感想やフィードバックを入力してください（任意、最大300文字）"
                                        />
                                        <div className="text-right text-sm text-gray-500 mt-1">
                                            {formData.comment.length} / 300
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium"
                                    >
                                        {submitting ? '送信中...' : '評価を送信'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right: Meeting Photo Upload Area */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">ミーティング画像</h3>

                                {/* Photo Preview/Upload Area */}
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Meeting preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <p className="text-sm text-gray-500">画像未選択</p>
                                        </div>
                                    )}
                                </div>

                                {/* Upload/Remove Buttons */}
                                <div className="space-y-2">
                                    {!photoPreview ? (
                                        <label className="block w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoSelect}
                                                className="hidden"
                                            />
                                            <div className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer text-center transition-colors">
                                                画像を選択
                                            </div>
                                        </label>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            画像を削除
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-500 text-center">JPG, PNG（最大5MB）</p>
                                </div>

                                {uploadingPhoto && (
                                    <div className="mt-4 text-center">
                                        <LoadingSpinner message="アップロード中..." />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateFeedback;
