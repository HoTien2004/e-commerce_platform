import api from './api';
import { API_ENDPOINTS } from '../config/api';

// Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
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

// Profile Service
export const profileService = {
  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get(API_ENDPOINTS.GET_PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post(API_ENDPOINTS.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await api.delete(API_ENDPOINTS.DELETE_AVATAR);
    return response.data;
  },
};

