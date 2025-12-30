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
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 5;

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
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上である必要があります';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Check if max attempts reached
    if (attemptCount >= maxAttempts) {
      setGeneralError('ログイン試行回数が上限に達しました。しばらくしてからもう一度お試しください。');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Reset attempt count on successful login
        setAttemptCount(0);
        navigate('/home');
      } else {
        // Increment attempt count on failure
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        const remainingAttempts = maxAttempts - newAttemptCount;

        // Handle field-specific errors
        if (result.errors) {
          const fieldErrors = {};
          result.errors.forEach(err => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        }

        // Set general error with attempt count
        let errorMessage = result.error || 'メールアドレスまたはパスワードが正しくありません';
        if (remainingAttempts > 0) {
          errorMessage += ` (残り${remainingAttempts}回の試行)`;
        }
        setGeneralError(errorMessage);
      }
    } catch (error) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      const remainingAttempts = maxAttempts - newAttemptCount;

      let errorMessage = '予期しないエラーが発生しました';
      if (remainingAttempts > 0) {
        errorMessage += ` (残り${remainingAttempts}回の試行)`;
      }
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            先生リンク
          </h1>
          <p className="text-lg text-slate-700">
            先生リンクへようこそ
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 transform transition-all duration-300 hover:shadow-blue-200/50">
          {/* General Error Message */}
          {generalError && (
            <div className={`mb-6 p-4 border rounded-xl shadow-sm animate-shake ${maxAttempts - attemptCount <= 1
                ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
                : maxAttempts - attemptCount <= 3
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
              <p className={`text-sm font-medium ${maxAttempts - attemptCount <= 1
                  ? 'text-red-800'
                  : maxAttempts - attemptCount <= 3
                    ? 'text-yellow-800'
                    : 'text-red-700'
                }`}>{generalError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="flex items-start gap-4">
              <label
                htmlFor="email"
                className="w-40 pt-3 text-sm font-semibold text-slate-800 text-right flex-shrink-0"
              >
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 rounded-full border-2 ${errors.email
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-slate-200 bg-white'
                    } focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md`}
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  メールアドレスは半角スクランチャーマークでスクリし
                  <br />
                  てください。例：name@example.com
                </p>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="flex items-start gap-4">
              <label
                htmlFor="password"
                className="w-40 pt-3 text-sm font-semibold text-slate-800 text-right flex-shrink-0"
              >
                パスワード <span className="text-rose-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 rounded-full border-2 ${errors.password
                    ? 'border-red-400 bg-red-50/50'
                    : 'border-slate-200 bg-white'
                    } focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md`}
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-slate-500">
                  パスワードを入力してください
                </p>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium animate-fade-in">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium hover:underline"
              >
                パスワードをお忘れの方
              </Link>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-20 py-3.5 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${isLoading
                  ? 'bg-slate-400 cursor-not-allowed shadow-none scale-100'
                  : 'bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 hover:shadow-blue-500/50 hover:shadow-xl'
                  }`}
              >
                {isLoading ? 'ログイン中...' : 'ロゲイン'}
              </button>
            </div>
          </form>

          {/* Demo Info */}
          {/* <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              デモ: demo@example.com / password123
            </p>
          </div> */}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
