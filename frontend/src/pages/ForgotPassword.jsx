import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              パスワードリセット
            </h1>
            <p className="text-gray-600">
              Reset your password
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <p className="text-sm text-yellow-800">
              この機能は現在実装中です / This feature is under development
            </p>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-3 px-4 rounded-lg font-medium text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            ログインに戻る / Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
