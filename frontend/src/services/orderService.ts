import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Order, OrdersResponse, OrderResponse, CreateOrderRequest, UpdateOrderStatusRequest } from '../types/order';

export const orderService = {
  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>(API_ENDPOINTS.CREATE_ORDER, data);
    return response.data;
  },

  // Get user's orders
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
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

  // Cancel order
  cancelOrder: async (orderId: string): Promise<OrderResponse> => {
    const response = await api.put<OrderResponse>(API_ENDPOINTS.CANCEL_ORDER(orderId));
    return response.data;
  },
};

