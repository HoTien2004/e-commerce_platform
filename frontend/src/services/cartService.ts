import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Cart, AddToCartData, UpdateCartItemData } from '../types/cart';

export const cartService = {
  // Get cart
  getCart: async (): Promise<{ success: boolean; data: Cart }> => {
    const response = await api.get<{ success: boolean; data: Cart }>(API_ENDPOINTS.CART);
    return response.data;
  },

  // Add to cart
  addToCart: async (
    data: AddToCartData
  ): Promise<{ success: boolean; data: Cart; message: string }> => {
    const response = await api.post<{ success: boolean; data: Cart; message: string }>(
      API_ENDPOINTS.CART_ADD,
      data
    );
    return response.data;
  },

  // Update cart item
  updateCartItem: async (
    data: UpdateCartItemData
  ): Promise<{ success: boolean; data: Cart; message: string }> => {
    const response = await api.put<{ success: boolean; data: Cart; message: string }>(
      API_ENDPOINTS.CART_UPDATE,
      data
    );
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (
    productId: string
  ): Promise<{ success: boolean; data: Cart; message: string }> => {
    const response = await api.delete<{ success: boolean; data: Cart; message: string }>(
      API_ENDPOINTS.CART_REMOVE,
      { data: { productId } }
    );
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.CART_CLEAR
    );
    return response.data;
  },
};
