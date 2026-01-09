import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Modal from './Modal';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Vui lòng nhập tên'),
    lastName: z.string().min(1, 'Vui lòng nhập họ'),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ cái viết hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái viết thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
    confirmPassword: z.string(),
    gender: z.enum(['male', 'female', 'other']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { setAuth } = useAuthStore();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    loginForm.clearErrors();
    try {
      const response = await authService.login(data);
      if (response.success) {
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        toast.success('Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
          loginForm.reset();
          setError('');
        }, 100);
      } else {
        const errorMessage = response.message || 'Đăng nhập thất bại';
        const lowerMessage = errorMessage.toLowerCase();

        const hasEmail = lowerMessage.includes('email') || lowerMessage.includes('tài khoản') || lowerMessage.includes('không tồn tại');
        const hasPassword = lowerMessage.includes('mật khẩu') || lowerMessage.includes('password') || lowerMessage.includes('sai') || lowerMessage.includes('pass');

        if (hasEmail && hasPassword) {
          loginForm.setError('root', { type: 'manual', message: errorMessage });
        } else if (hasEmail && !hasPassword) {
          loginForm.setError('email', { type: 'manual', message: errorMessage });
        } else if (hasPassword && !hasEmail) {
          loginForm.setError('password', { type: 'manual', message: errorMessage });
        } else {
          loginForm.setError('root', { type: 'manual', message: errorMessage });
        }
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      const lowerMessage = errorMessage.toLowerCase();

      const hasEmail = lowerMessage.includes('email') || lowerMessage.includes('tài khoản') || lowerMessage.includes('không tồn tại');
      const hasPassword = lowerMessage.includes('mật khẩu') || lowerMessage.includes('password') || lowerMessage.includes('sai') || lowerMessage.includes('pass');

      if (hasEmail && hasPassword) {
        loginForm.setError('root', { type: 'manual', message: errorMessage });
      } else if (hasEmail && !hasPassword) {
        loginForm.setError('email', { type: 'manual', message: errorMessage });
      } else if (hasPassword && !hasEmail) {
        loginForm.setError('password', { type: 'manual', message: errorMessage });
      } else {
        loginForm.setError('root', { type: 'manual', message: errorMessage });
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.register(data);
      if (response.success) {
        setEmail(data.email);
        setMode('verify');
        setError('');
        toast.success('Mã OTP đã được gửi đến email của bạn!');
      } else {
        const errorMessage = response.message || 'Đăng ký thất bại';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      toast.error('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await authService.verifyOTP({ email, otp });
      if (response.success) {
        setAuth(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        toast.success('Đăng ký thành công!');
        setTimeout(() => {
          onClose();
          setMode('login');
          setOtp('');
          setError('');
          registerForm.reset();
        }, 100);
      } else {
        const errorMessage = response.message || 'Xác thực OTP thất bại';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authService.resendOTP(email);
      if (response.success) {
        toast.success('Đã gửi lại mã OTP!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }
    onClose();
    setMode(initialMode);
    setOtp('');
    setEmail('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    loginForm.reset();
    loginForm.clearErrors();
    registerForm.reset();
    registerForm.clearErrors();
  };

  if (mode === 'verify') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Xác thực OTP"
        closeOnBackdropClick={!isLoading}
        disableClose={false}
      >
        <div className="space-y-6">
          <p className="text-center text-sm text-gray-600">
            Mã OTP đã được gửi đến <strong>{email}</strong>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập mã OTP (6 số)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-primary text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Gửi lại mã OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="btn-primary w-full"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  }

  if (mode === 'login') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Đăng nhập tài khoản"
        closeOnBackdropClick={!isLoading}
        disableClose={false}
      >
        <div className="space-y-6">
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => {
                setMode('register');
                setError('');
                loginForm.clearErrors();
              }}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Đăng ký ngay
            </button>
          </p>

          {loginForm.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {loginForm.formState.errors.root.message}
            </div>
          )}

          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                {...loginForm.register('email')}
                type="email"
                className="input-primary"
                placeholder="email@example.com"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-primary pr-10"
                  placeholder="Mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                  window.location.href = '/forgot-password';
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đăng ký tài khoản"
      size="lg"
      closeOnBackdropClick={!isLoading}
      disableClose={false}
    >
      <div className="space-y-6">
        <p className="text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Đăng nhập
          </button>
        </p>

        {registerForm.formState.errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {registerForm.formState.errors.root.message}
          </div>
        )}

        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Tên
              </label>
              <input
                {...registerForm.register('firstName')}
                type="text"
                className="input-primary"
                placeholder="Tên"
              />
              {registerForm.formState.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ
              </label>
              <input
                {...registerForm.register('lastName')}
                type="text"
                className="input-primary"
                placeholder="Họ"
              />
              {registerForm.formState.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {registerForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              {...registerForm.register('email')}
              type="email"
              className="input-primary"
              placeholder="email@example.com"
            />
            {registerForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {registerForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính (tùy chọn)
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...registerForm.register('gender')}
                  type="radio"
                  value="male"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Nam</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...registerForm.register('gender')}
                  type="radio"
                  value="female"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Nữ</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...registerForm.register('gender')}
                  type="radio"
                  value="other"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Khác</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                {...registerForm.register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-primary pr-10"
                placeholder="Mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {registerForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {registerForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                {...registerForm.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="input-primary pr-10"
                placeholder="Xác nhận mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {registerForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {registerForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default AuthModal;

