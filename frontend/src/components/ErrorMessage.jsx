/**
 * エラーメッセージコンポーネント
 * API失敗時のエラーメッセージを表示
 */
const ErrorMessage = ({ message = 'エラーが発生しました', onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <p className="text-gray-800 text-lg font-medium mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200"
                >
                    再試行
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
