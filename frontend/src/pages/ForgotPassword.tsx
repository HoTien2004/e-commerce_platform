import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import Footer from '../components/Layout/Footer';

const emailSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải có 6 số'),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ cái viết hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái viết thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type Step = 'email' | 'otp' | 'password';

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<{ newPassword: string; confirmPassword: string }>({
    resolver: zodResolver(passwordSchema),
  });

  const handleSendOTP = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data.email);
      if (response.success) {
        setEmail(data.email);
        setStep('otp');
        toast.success('Mã OTP đã được gửi đến email của bạn!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: { otp: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyResetOTP(email, data.otp);
      if (response.success) {
        setStep('password');
        toast.success('Xác thực OTP thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xác thực OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: { newPassword: string; confirmPassword: string }) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(email, data.newPassword, data.confirmPassword);
      if (response.success) {
        toast.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        toast.success('Đã gửi lại mã OTP!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar giống header, đơn giản, có blur nhẹ */}
      <div className="bg-white/80 border-b border-gray-200 backdrop-blur-sm shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-5 md:py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <span className="text-xl md:text-2xl font-extrabold text-primary-600 tracking-tight">
                TechStore
              </span>
              <span className="text-base md:text-lg ml-2 font-semibold text-gray-800 truncate">
                Đặt lại mật khẩu
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <Link to="/help" className="text-primary-600 hover:text-primary-700 font-medium">
              Bạn cần giúp đỡ?
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8 bg-white rounded-2xl shadow-lg px-6 py-7 md:px-10 md:py-9 border border-gray-100 flex flex-col">
          <div className="text-center space-y-3">
            <p className="text-base md:text-lg text-gray-700 font-semibold">
              {step === 'email' && 'Bước 1/3: Nhập email của bạn'}
              {step === 'otp' && 'Bước 2/3: Nhập mã OTP được gửi qua email'}
              {step === 'password' && 'Bước 3/3: Tạo mật khẩu mới'}
            </p>
            <p className="text-sm md:text-base text-gray-500">
              Bạn nhớ mật khẩu?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form className="mt-8 space-y-6" onSubmit={emailForm.handleSubmit(handleSendOTP)}>
              <div>
                <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...emailForm.register('email')}
                  type="email"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base md:text-lg"
                  placeholder="email@example.com"
                />
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form className="mt-8 space-y-6" onSubmit={otpForm.handleSubmit(handleVerifyOTP)}>
              <div>
                <label htmlFor="otp" className="block text-base font-medium text-gray-700 mb-2">
                  Mã OTP (6 số)
                </label>
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  maxLength={6}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    otpForm.setValue('otp', value);
                  }}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-2xl md:text-3xl text-center tracking-[0.45em]"
                  placeholder="000000"
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-base text-primary-600 hover:text-primary-500"
                >
                  Gửi lại mã OTP
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form
              className="mt-8 space-y-6"
              onSubmit={passwordForm.handleSubmit(handleResetPassword)}
            >
              <div>
                <label htmlFor="newPassword" className="block text-base font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  {...passwordForm.register('newPassword')}
                  type="password"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base md:text-lg"
                  placeholder="Mật khẩu mới"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  {...passwordForm.register('confirmPassword')}
                  type="password"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base md:text-lg"
                  placeholder="Xác nhận mật khẩu"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;

