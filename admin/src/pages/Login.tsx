import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { resetVerification, markAsVerified } from '../components/ProtectedRoute';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null); // Clear previous error

    try {
      const response = await authService.login(data);

      if (response.success) {
        // Check if user is admin
        if (response.data.user.role !== 'admin') {
          setErrorMessage('Bạn không có quyền truy cập admin panel');
          setIsLoading(false);
          return;
        }

        // Reset verification flag before login
        resetVerification();

        // Set auth state
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );

        // Mark as verified since we just logged in successfully
        // This prevents ProtectedRoute from re-verifying immediately
        markAsVerified();

        toast.success('Đăng nhập thành công!');

        // Navigate after a small delay to ensure state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setErrorMessage(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';

      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 401) {
          errorMsg = 'Email hoặc mật khẩu không đúng';
        } else if (status === 400) {
          errorMsg = message || 'Dữ liệu không hợp lệ';
        } else if (status === 500) {
          errorMsg = 'Lỗi server. Vui lòng thử lại sau.';
        } else if (message) {
          errorMsg = message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
            <span style={{ color: '#ef4444' }}>H</span>
            <span style={{ color: '#22c55e' }}>D</span>
            <span style={{ color: '#f97316' }}>Q</span>
            <span style={{ color: '#06b6d4' }}>T</span>
            <span style={{ color: '#1f2937' }}>Shop</span>
            <span className="ml-3 text-primary-600">Admin</span>
          </h1>
          <p className="text-lg text-gray-600">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Đăng nhập
          </h2>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`pl-10 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={`pl-10 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.password
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
                    }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="h-5 w-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Chỉ dành cho quản trị viên
        </p>
      </div>
    </div>
  );
};

export default Login;

