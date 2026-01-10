import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileService } from '../services/profileService';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../services/profileService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiTrash2, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  lastName: z.string().min(1, 'Vui lòng nhập họ'),
  email: z.string().email('Email không hợp lệ'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
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

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      gender: user?.gender,
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin tài khoản');
    }
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updateData: UpdateProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        // Email không được phép thay đổi
        gender: data.gender,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };

      const response = await profileService.updateProfile(updateData);
      if (response.success) {
        setUser(response.data.user);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      const passwordData: ChangePasswordRequest = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await profileService.changePassword(passwordData);
      if (response.success) {
        toast.success('Đổi mật khẩu thành công!');
        passwordForm.reset();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ cho phép upload file ảnh!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await profileService.uploadAvatar(file);
      if (response.success) {
        await loadProfile();
        toast.success('Upload avatar thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload avatar thất bại');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa avatar?')) return;

    try {
      const response = await profileService.deleteAvatar();
      if (response.success) {
        await loadProfile();
        toast.success('Xóa avatar thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xóa avatar thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Thông tin tài khoản</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'profile'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-primary-600'
              }`}
          >
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'password'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-secondary-600 hover:text-primary-600'
              }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <div className="card-body">
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-8 pb-8 border-b border-border">
                <div className="relative mb-4">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-100">
                      <FiUser className="w-16 h-16 text-primary-600" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    <FiCamera className="w-5 h-5" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <div className="flex gap-3">
                  <label
                    htmlFor="avatar-upload"
                    className="btn-secondary cursor-pointer"
                    style={{ pointerEvents: isUploadingAvatar ? 'none' : 'auto' }}
                  >
                    {isUploadingAvatar ? 'Đang tải...' : 'Thay đổi avatar'}
                  </label>
                  {user?.avatar && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      Xóa avatar
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline w-4 h-4 mr-1 mb-1" />
                      Tên
                    </label>
                    <input
                      {...profileForm.register('firstName')}
                      type="text"
                      className="input-primary"
                      placeholder="Tên"
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ
                    </label>
                    <input
                      {...profileForm.register('lastName')}
                      type="text"
                      className="input-primary"
                      placeholder="Họ"
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2">
                    <FiMail className="inline w-4 h-4 mr-1 mb-1" />
                    Email
                  </label>
                  <input
                    {...profileForm.register('email')}
                    type="email"
                    className="input-primary bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                    placeholder="email@example.com"
                    disabled
                    readOnly
                  />
                  <p className="mt-1 text-xs text-gray-400">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        {...profileForm.register('gender')}
                        type="radio"
                        value="male"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Nam</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        {...profileForm.register('gender')}
                        type="radio"
                        value="female"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Nữ</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        {...profileForm.register('gender')}
                        type="radio"
                        value="other"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Khác</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline w-4 h-4 mr-1 mb-1" />
                    Số điện thoại
                  </label>
                  <input
                    {...profileForm.register('phone')}
                    type="tel"
                    className="input-primary"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-1 mb-1" />
                    Địa chỉ
                  </label>
                  <input
                    {...profileForm.register('address')}
                    type="text"
                    className="input-primary"
                    placeholder="Địa chỉ"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary min-w-[120px]"
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card">
            <div className="card-body">
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    <FiLock className="inline w-4 h-4 mr-1 mb-1" />
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('currentPassword')}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="input-primary pr-10"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className="input-primary pr-10"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      {...passwordForm.register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-primary pr-10"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="btn-primary min-w-[120px]"
                  >
                    {isPasswordLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

