// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
  REFRESH_TOKEN: '/user/refresh-token',
  GET_PROFILE: '/user/profile',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  UPLOAD_IMAGES: '/products/upload-images',
  
  // Admin
  DASHBOARD_STATS: '/admin/dashboard/stats',
  ALL_USERS: '/user/all',
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/status`,
  
  // Promo Codes
  PROMO_CODES: '/promo-code',
  PROMO_CODE_BY_ID: (id: string) => `/promo-code/${id}`,
} as const;

