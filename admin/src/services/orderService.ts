import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  shippingAddress: string;
  shippingFee: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'vnpay' | 'momo';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentProvider?: 'momo' | 'vnpay' | null;
  paymentTransactionId?: string | null;
  orderStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  promoCode?: string;
  notes?: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
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

export interface OrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
}

export interface UpdateOrderStatusRequest {
  orderStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
}

export const orderService = {
  // Get all orders (admin can see all, users see only their own)
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    orderNumber?: string;
    email?: string;
  }): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>(API_ENDPOINTS.ORDERS, { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(API_ENDPOINTS.ORDER_BY_ID(orderId));
    return response.data;
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId: string, data: UpdateOrderStatusRequest): Promise<OrderResponse> => {
    const response = await api.put<OrderResponse>(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), data);
    return response.data;
  },
};

