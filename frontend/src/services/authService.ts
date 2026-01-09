import api from './api';
import { API_ENDPOINTS } from '../config/api';

// Types
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      gender?: 'male' | 'female' | 'other';
      phone?: string;
      address?: string;
      role: string;
      avatar?: string;
    };
  };
}

// Auth Service
export const authService = {
  // Register - Request OTP
  register: async (data: RegisterRequest) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  },

  // Verify OTP and complete registration
  verifyOTP: async (data: VerifyOTPRequest): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.VERIFY_OTP, data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email: string) => {
    const response = await api.post(API_ENDPOINTS.RESEND_OTP, { email });
    return response.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email: string) => {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // Verify Reset OTP
  verifyResetOTP: async (email: string, otp: string) => {
    const response = await api.post(API_ENDPOINTS.VERIFY_RESET_OTP, { email, otp });
    return response.data;
  },

  // Reset Password
  resetPassword: async (email: string, newPassword: string, confirmPassword: string) => {
    const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
      email,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

