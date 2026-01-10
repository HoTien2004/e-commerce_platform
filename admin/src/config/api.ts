// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
  REFRESH_TOKEN: '/user/refresh-token',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  UPLOAD_IMAGES: '/products/upload-images',
} as const;

