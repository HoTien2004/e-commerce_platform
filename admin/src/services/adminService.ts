import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  ordersByStatus: {
    pending: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  revenueByMonth: {
    _id: {
      year: number;
      month: number;
    };
    total: number;
  }[];
  ordersByDay: {
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
  }[];
}

export interface RecentOrder {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  customerInfo?: {
    fullName: string;
    phone: string;
    email: string;
  };
  userId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    recentOrdersPagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (params?: { page?: number; limit?: number }): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>(API_ENDPOINTS.DASHBOARD_STATS, { params });
    return response.data;
  },
};

