import { useState } from 'react';

/**
 * Star Rating Component
 * Reusable component for 1-5 star rating
 */
const StarRating = ({ value, onChange, label, required = false }) => {
    const [hoverValue, setHoverValue] = useState(0);

    const handleClick = (rating) => {
        onChange(rating);
    };

    const handleMouseEnter = (rating) => {
        setHoverValue(rating);
    };

    const handleMouseLeave = () => {
        setHoverValue(0);
    };

    return (
        <div className="flex items-center gap-3">
            {label && (
                <label className="text-sm font-medium text-gray-700 min-w-[120px]">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => {
                    const isFilled = rating <= (hoverValue || value);
                    return (
                        <button
                            key={rating}
                            type="button"
                            onClick={() => handleClick(rating)}
                            onMouseEnter={() => handleMouseEnter(rating)}
                            onMouseLeave={handleMouseLeave}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <svg
                                className={`w-8 h-8 ${isFilled
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300 fill-current'
                                    }`}
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                    );
                })}
            </div>
            {value > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                    {value} / 5
                </span>
            )}
        </div>
    );
};

export default StarRating;
