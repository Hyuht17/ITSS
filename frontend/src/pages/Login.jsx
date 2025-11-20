import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください / Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください / Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください / Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上である必要があります / Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        // Handle field-specific errors
        if (result.errors) {
          const fieldErrors = {};
          result.errors.forEach(err => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setGeneralError(result.error);
        }
      }
    } catch (error) {
      setGeneralError('予期しないエラーが発生しました / An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ログイン
            </h1>
            <p className="text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{generalError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス / Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                } focus:ring-2 focus:outline-none transition-colors`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード / Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                } focus:ring-2 focus:outline-none transition-colors`}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                パスワードをお忘れの方 / Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ログイン中... / Logging in...
                </span>
              ) : (
                'ログイン / Login'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方 / Don't have an account?{' '}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              >
                新規登録 / Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo:</strong> demo@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
