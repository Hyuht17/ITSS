import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              ダッシュボード / Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              ログアウト / Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ようこそ / Welcome!
          </h2>
          
          {user && (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 w-32">Name:</span>
                <span className="font-medium text-gray-900">{user.name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-32">Email:</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-32">User ID:</span>
                <span className="font-medium text-gray-900">{user.id}</span>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              ✅ ログインに成功しました！ / Successfully logged in!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
