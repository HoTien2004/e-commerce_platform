// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/user/register',
  VERIFY_OTP: '/user/verify-otp',
  RESEND_OTP: '/user/resend-otp',
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
  REFRESH_TOKEN: '/user/refresh-token',

  // Profile
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/password',

  // Password Reset
  FORGOT_PASSWORD: '/user/forgot-password',
  VERIFY_RESET_OTP: '/user/verify-reset-otp',
  RESET_PASSWORD: '/user/reset-password',

  // Avatar
  UPLOAD_AVATAR: '/user/avatar',
  DELETE_AVATAR: '/user/avatar',

  // Addresses
  ADD_ADDRESS: '/user/addresses',
  UPDATE_ADDRESS: (addressId: string) => `/user/addresses/${addressId}`,
  DELETE_ADDRESS: (addressId: string) => `/user/addresses/${addressId}`,
  SET_DEFAULT_ADDRESS: (addressId: string) => `/user/addresses/${addressId}/default`,

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`, // Can use ID or slug
  PRODUCTS_FEATURED: '/products/featured',
  PRODUCTS_BEST_SELLERS: '/products/best-sellers',
  PRODUCTS_CATEGORIES: '/products/categories',
  PRODUCTS_BRANDS: '/products/brands',
  PRODUCTS_UPLOAD_IMAGES: '/products/upload-images',

  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: '/cart/update',
  CART_REMOVE: '/cart/remove',
  CART_CLEAR: '/cart/clear',

  // Promo Code
  PROMO_CODE_VALIDATE: '/promo-code/validate',
  PROMO_CODE_APPLY: '/promo-code/apply',

  // Orders
  CREATE_ORDER: '/orders',
  ORDERS: '/orders',
  ORDER_BY_ID: (orderId: string) => `/orders/${orderId}`,
  UPDATE_ORDER_STATUS: (orderId: string) => `/orders/${orderId}/status`,
  CANCEL_ORDER: (orderId: string) => `/orders/${orderId}/cancel`,

  // Payments
  CREATE_VNPAY_PAYMENT: '/payments/vnpay/create',

  // Reviews
  CREATE_REVIEW: '/reviews',
  GET_PRODUCT_REVIEWS: (productId: string) => `/reviews/product/${productId}`,
  TOGGLE_REVIEW_LIKE: (reviewId: string) => `/reviews/${reviewId}/like`,
  DELETE_REVIEW: (reviewId: string) => `/reviews/${reviewId}`,
} as const;

