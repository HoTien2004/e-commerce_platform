import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  role: string;
  avatar?: string;
  avatarPublicId?: string;
}

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

// User Service
export const userService = {
  // Get Profile
  getProfile: async (): Promise<{ success: boolean; data: UserProfile }> => {
    const response = await api.get(API_ENDPOINTS.GET_PROFILE);
    return response.data;
  },

  // Update Profile
  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  },

  // Change Password
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, data);
    return response.data;
  },

  // Upload Avatar
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

  // Delete Avatar
  deleteAvatar: async () => {
    const response = await api.delete(API_ENDPOINTS.DELETE_AVATAR);
    return response.data;
  },
};

