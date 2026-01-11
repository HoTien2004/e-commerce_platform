import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Product, ProductsResponse, ProductResponse } from '../types/product';

export const productService = {
  // Get products with filters, pagination, search
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    status?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return response.data;
  },

  // Get product by slug (uses same endpoint as getProductById)
  getProductBySlug: async (slug: string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(API_ENDPOINTS.PRODUCT_BY_ID(slug));
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS_FEATURED, {
      params: { limit },
    });
    return response.data;
  },

  // Get best sellers
  getBestSellers: async (limit: number = 8): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS_BEST_SELLERS, {
      params: { limit },
    });
    return response.data;
  },

  // Get categories
  getCategories: async (): Promise<{ success: boolean; data: Array<{ category: string; count: number }> }> => {
    const response = await api.get<{ success: boolean; data: Array<{ category: string; count: number }> }>(
      API_ENDPOINTS.PRODUCTS_CATEGORIES
    );
    return response.data;
  },

  // Get brands
  getBrands: async (): Promise<{ success: boolean; data: Array<{ brand: string; count: number }> }> => {
    const response = await api.get<{ success: boolean; data: Array<{ brand: string; count: number }> }>(
      API_ENDPOINTS.PRODUCTS_BRANDS
    );
    return response.data;
  },
};
