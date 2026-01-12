import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  specifications?: Array<{
    description: string;
    quantity: string;
    warranty: string;
  }>;
  price: number;
  originalPrice?: number;
  discount: number;
  images: Array<{
    url: string;
    publicId?: string;
    isPrimary: boolean;
  }>;
  category: string;
  brand: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  specifications?: Array<{
    description: string;
    quantity: string;
    warranty: string;
  }>;
  price: number;
  originalPrice?: number;
  category?: string;
  brand?: string;
  stock?: number;
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  images?: Array<{
    url: string;
    publicId?: string;
    isPrimary?: boolean;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface UploadImagesResponse {
  success: boolean;
  data: Array<{
    url: string;
    publicId: string;
    isPrimary: boolean;
  }>;
}

export const productService = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return response.data;
  },

  createProduct: async (data: CreateProductData): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>(API_ENDPOINTS.PRODUCTS, data);
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductData): Promise<ProductResponse> => {
    const response = await api.put<ProductResponse>(API_ENDPOINTS.PRODUCT_BY_ID(id), data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.PRODUCT_BY_ID(id)
    );
    return response.data;
  },

  uploadImages: async (files: File[]): Promise<UploadImagesResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<UploadImagesResponse>(
      API_ENDPOINTS.UPLOAD_IMAGES,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

