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
  };
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
  };
}

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>(API_ENDPOINTS.DASHBOARD_STATS);
    return response.data;
  },
};

