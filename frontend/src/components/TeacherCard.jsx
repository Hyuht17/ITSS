import PropTypes from 'prop-types';
import clockIcon from '../assets/clock.svg';
import locationIcon from '../assets/location.svg';
import heartIcon from '../assets/heart.svg';

/**
 * 教師カードコンポーネント
 * マッチング条件に基づいて教師情報を表示
 * @param {Object} props.teacher - 教師データ
 * @param {Object} props.matchedConditions - マッチした条件
 * @param {Function} props.onClick - クリックハンドラ
 */
const TeacherCard = ({ teacher, matchedConditions, onClick }) => {
    const getProfilePhotoUrl = () => {
        if (teacher.profilePhoto) {
            return teacher.profilePhoto;
        }
        // Placeholder with teacher name
        const encodedName = encodeURIComponent(teacher.name || 'Teacher');
        return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=2563eb&color=fff`;
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center cursor-pointer transform hover:-translate-y-1"
        >
            {/* プロフィール画像 */}
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100">
                <img
                    src={getProfilePhotoUrl()}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&size=200&background=2563eb&color=fff`;
                    }}
                />
            </div>

            {/* 教師情報 */}
            <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">
                {teacher.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 text-center">
                {teacher.workplace}
            </p>
            <p className="text-sm text-gray-500 mb-4 text-center">
                {teacher.subject}: 〜{teacher.yearsOfExperience}年間
            </p>

            {/* マッチング条件アイコン */}
            <div className="w-full space-y-2 mb-4">
                {/* 時間帯マッチ */}
                {matchedConditions.timeSlots && matchedConditions.timeSlots.length > 0 && (
                    <div className="flex items-start gap-2">
                        <img src={clockIcon} alt="Time" className="w-5 h-5 mt-0.5 opacity-60" />
                        <div className="flex-1">
                            <span className="text-sm text-gray-700">
                                {matchedConditions.timeSlots.map(slot => {
                                    const labels = {
                                        morning: '朝',
                                        afternoon: '昼',
                                        evening: '夜'
                                    };
                                    return labels[slot];
                                }).join('、')}
                            </span>
                        </div>
                    </div>
                )}

                {/* 地域マッチ */}
                {matchedConditions.location && (
                    <div className="flex items-start gap-2">
                        <img src={locationIcon} alt="Location" className="w-5 h-5 mt-0.5 opacity-60" />
                        <div className="flex-1">
                            <span className="text-sm text-gray-700">
                                {matchedConditions.location}
                            </span>
                        </div>
                    </div>
                )}

                {/* 専門分野マッチ */}
                {matchedConditions.specialties && matchedConditions.specialties.length > 0 && (
                    <div className="flex items-start gap-2">
                        <img src={heartIcon} alt="Specialty" className="w-5 h-5 mt-0.5 opacity-60" />
                        <div className="flex-1">
                            <span className="text-sm text-gray-700">
                                {matchedConditions.specialties.join('、')}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* つながりボタン */}
            <button className="w-full bg-gray-900 text-white py-2.5 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors">
                つながり
            </button>
        </div>
    );
};

TeacherCard.propTypes = {
    teacher: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        workplace: PropTypes.string.isRequired,
        yearsOfExperience: PropTypes.number.isRequired,
        subject: PropTypes.string.isRequired,
        profilePhoto: PropTypes.string,
        availableTimeSlots: PropTypes.arrayOf(PropTypes.string),
        location: PropTypes.string,
        specialties: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    matchedConditions: PropTypes.shape({
        timeSlots: PropTypes.arrayOf(PropTypes.string),
        location: PropTypes.string,
        specialties: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    onClick: PropTypes.func
};

export default TeacherCard;
