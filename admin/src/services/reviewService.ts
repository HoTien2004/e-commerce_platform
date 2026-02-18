import api from './api';

export interface Review {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  productId: {
    _id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; isPrimary: boolean }>;
  };
  orderId?: string;
  rating: number | null;
  comment: string;
  likes: Array<{
    userId: string;
    createdAt: string;
  }>;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const reviewService = {
  // Get all reviews with filters and pagination
  getAllReviews: async (params?: {
    page?: number;
    limit?: number;
    rating?: number;
    productId?: string;
    userId?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.productId) queryParams.append('productId', params.productId);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get<{ success: boolean; data: ReviewsResponse }>(
      `/reviews?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get reviews for a specific product
  getProductReviews: async (
    productId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (rating) {
      params.append('rating', rating.toString());
    }
    const response = await api.get<{ success: boolean; data: ReviewsResponse }>(
      `/reviews/product/${productId}?${params.toString()}`
    );
    return response.data;
  },

  // Delete review (admin can delete any review)
  deleteReview: async (reviewId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/reviews/${reviewId}`
    );
    return response.data;
  },
};

