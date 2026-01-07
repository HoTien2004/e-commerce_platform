// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/user/register',
  VERIFY_OTP: '/user/verify-otp',
  RESEND_OTP: '/user/resend-otp',
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
  REFRESH_TOKEN: '/user/refresh-token',
  
  // Profile
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/password',
  
  // Password Reset
  FORGOT_PASSWORD: '/user/forgot-password',
  VERIFY_RESET_OTP: '/user/verify-reset-otp',
  RESET_PASSWORD: '/user/reset-password',
  
  // Avatar
  UPLOAD_AVATAR: '/user/avatar',
  DELETE_AVATAR: '/user/avatar',
  
  // Products (sẽ thêm sau)
  PRODUCTS: '/products',
} as const;

