import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'user' | 'admin';
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>(API_ENDPOINTS.ALL_USERS, { params });
    return response.data;
  },
};

