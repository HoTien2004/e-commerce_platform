import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface PromoCode {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'freeship';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodesResponse {
  success: boolean;
  data: PromoCode[];
}

export interface PromoCodeResponse {
  success: boolean;
  data: {
    promoCode: PromoCode;
  };
}

export interface CreatePromoCodeRequest {
  code: string;
  type: 'percentage' | 'fixed' | 'freeship';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  isActive?: boolean;
}

export interface UpdatePromoCodeRequest extends Partial<CreatePromoCodeRequest> {}

export const promoCodeService = {
  // Get all promo codes
  getPromoCodes: async (): Promise<PromoCodesResponse> => {
    const response = await api.get<PromoCodesResponse>(API_ENDPOINTS.PROMO_CODES);
    return response.data;
  },

  // Get promo code by ID
  getPromoCodeById: async (id: string): Promise<PromoCodeResponse> => {
    const response = await api.get<PromoCodeResponse>(API_ENDPOINTS.PROMO_CODE_BY_ID(id));
    return response.data;
  },

  // Create promo code
  createPromoCode: async (data: CreatePromoCodeRequest): Promise<PromoCodeResponse> => {
    const response = await api.post<PromoCodeResponse>(API_ENDPOINTS.PROMO_CODES, data);
    return response.data;
  },

  // Update promo code
  updatePromoCode: async (id: string, data: UpdatePromoCodeRequest): Promise<PromoCodeResponse> => {
    const response = await api.put<PromoCodeResponse>(API_ENDPOINTS.PROMO_CODE_BY_ID(id), data);
    return response.data;
  },

  // Delete promo code
  deletePromoCode: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(API_ENDPOINTS.PROMO_CODE_BY_ID(id));
    return response.data;
  },
};

