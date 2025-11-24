/**
 * ローディングスピナーコンポーネント
 * データ取得中の視覚的フィードバックを提供
 */
const LoadingSpinner = ({ message = '読み込み中...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
