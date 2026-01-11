import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface PromoCodeValidation {
  success: boolean;
  data?: {
    code: string;
    type: 'percentage' | 'fixed' | 'freeship';
    discountAmount: number;
    isFreeShip: boolean;
    description: string;
  };
  message?: string;
}

export const promoCodeService = {
  // Validate promo code
  validate: async (code: string, orderTotal: number): Promise<PromoCodeValidation> => {
    const response = await api.post<PromoCodeValidation>(
      API_ENDPOINTS.PROMO_CODE_VALIDATE,
      { code, orderTotal }
    );
    return response.data;
  },

  // Apply promo code (after order is created)
  apply: async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.PROMO_CODE_APPLY,
      { code }
    );
    return response.data;
  },
};

