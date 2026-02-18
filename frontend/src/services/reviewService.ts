import api from './api';
import { API_ENDPOINTS } from "../config/api";

export interface Review {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  likes: Array<{
    userId: string;
    createdAt: string;
  }>;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  userLiked?: boolean;
}

export interface CreateReviewData {
  productId: string;
  rating?: number;
  comment?: string;
  orderId?: string;
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
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const reviewService = {
  // Create review
  createReview: async (data: CreateReviewData) => {
    const response = await api.post<{ success: boolean; data: { review: Review } }>(
      API_ENDPOINTS.CREATE_REVIEW,
      data
    );
    return response.data;
  },

  // Get product reviews
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
      params.append("rating", rating.toString());
    }
    const response = await api.get<{ success: boolean; data: ReviewsResponse }>(
      `${API_ENDPOINTS.GET_PRODUCT_REVIEWS(productId)}?${params.toString()}`
    );
    return response.data;
  },

  // Toggle like on review
  toggleReviewLike: async (reviewId: string) => {
    const response = await api.post<{
      success: boolean;
      data: { liked: boolean; helpfulCount: number };
    }>(API_ENDPOINTS.TOGGLE_REVIEW_LIKE(reviewId));
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.DELETE_REVIEW(reviewId)
    );
    return response.data;
  },
};

