import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiX } from 'react-icons/fi';
import { promoCodeService, type PromoCode, type CreatePromoCodeRequest } from '../services/promoCodeService';
import toast from 'react-hot-toast';

const promoCodeSchema = z.object({
  code: z.string().min(1, 'Mã khuyến mãi không được để trống').regex(/^[A-Z0-9]+$/, 'Mã chỉ được chứa chữ cái in hoa và số'),
  type: z.enum(['percentage', 'fixed', 'freeship'], {
    required_error: 'Vui lòng chọn loại mã khuyến mãi',
  }),
  value: z.number().min(0, 'Giá trị phải lớn hơn hoặc bằng 0'),
  minOrder: z.number().min(0, 'Đơn tối thiểu phải lớn hơn hoặc bằng 0'),
  maxDiscount: z.number().min(0).optional().or(z.literal('')),
  validFrom: z.string().min(1, 'Ngày bắt đầu không được để trống'),
  validTo: z.string().min(1, 'Ngày kết thúc không được để trống'),
  usageLimit: z.number().min(1).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.type === 'percentage' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Phần trăm không được vượt quá 100%',
  path: ['value'],
}).refine((data) => {
  if (data.validFrom && data.validTo) {
    return new Date(data.validFrom) < new Date(data.validTo);
  }
  return true;
}, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['validTo'],
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

interface PromoCodeModalProps {
  promoCode: PromoCode | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PromoCodeModal = ({ promoCode, onClose, onSuccess }: PromoCodeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!promoCode;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: promoCode?.code || '',
      type: promoCode?.type || 'percentage',
      value: promoCode?.value || 0,
      minOrder: promoCode?.minOrder || 0,
      maxDiscount: promoCode?.maxDiscount || undefined,
      validFrom: promoCode?.validFrom ? new Date(promoCode.validFrom).toISOString().slice(0, 16) : '',
      validTo: promoCode?.validTo ? new Date(promoCode.validTo).toISOString().slice(0, 16) : '',
      usageLimit: promoCode?.usageLimit || undefined,
      isActive: promoCode?.isActive ?? true,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (promoCode) {
      reset({
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        minOrder: promoCode.minOrder,
        maxDiscount: promoCode.maxDiscount,
        validFrom: new Date(promoCode.validFrom).toISOString().slice(0, 16),
        validTo: new Date(promoCode.validTo).toISOString().slice(0, 16),
        usageLimit: promoCode.usageLimit,
        isActive: promoCode.isActive,
      });
    }
  }, [promoCode, reset]);

  const onSubmit = async (data: PromoCodeFormData) => {
    try {
      setIsLoading(true);

      const payload: CreatePromoCodeRequest = {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minOrder: data.minOrder,
        validFrom: new Date(data.validFrom).toISOString(),
        validTo: new Date(data.validTo).toISOString(),
        isActive: data.isActive,
      };

      if (data.maxDiscount && data.maxDiscount !== '') {
        payload.maxDiscount = typeof data.maxDiscount === 'number' ? data.maxDiscount : Number(data.maxDiscount);
      }

      if (data.usageLimit && data.usageLimit !== '') {
        payload.usageLimit = typeof data.usageLimit === 'number' ? data.usageLimit : Number(data.usageLimit);
      }

      if (isEditing && promoCode) {
        await promoCodeService.updatePromoCode(promoCode._id, payload);
        toast.success('Cập nhật mã khuyến mãi thành công!');
      } else {
        await promoCodeService.createPromoCode(payload);
        toast.success('Tạo mã khuyến mãi thành công!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu mã khuyến mãi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Sửa mã khuyến mãi' : 'Thêm mã khuyến mãi'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã khuyến mãi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="SUMMER20"
              disabled={isEditing}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
            {!isEditing && (
              <p className="mt-1 text-xs text-gray-500">Mã sẽ được chuyển thành chữ in hoa</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại mã khuyến mãi <span className="text-red-500">*</span>
            </label>
            <select
              {...register('type')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (₫)</option>
              <option value="freeship">Miễn phí vận chuyển</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Value */}
          {selectedType !== 'freeship' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedType === 'percentage' ? 'Phần trăm (%)' : 'Số tiền (₫)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step={selectedType === 'percentage' ? '1' : '1000'}
                {...register('value', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.value ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={selectedType === 'percentage' ? '20' : '50000'}
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>
          )}

          {/* Max Discount (only for percentage) */}
          {selectedType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giảm tối đa (₫) <span className="text-gray-500">(Tùy chọn)</span>
              </label>
              <input
                type="number"
                step="1000"
                {...register('maxDiscount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="500000"
              />
              <p className="mt-1 text-xs text-gray-500">Giới hạn số tiền giảm tối đa (để trống = không giới hạn)</p>
            </div>
          )}

          {/* Min Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn hàng tối thiểu (₫) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="1000"
              {...register('minOrder', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.minOrder ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1000000"
            />
            {errors.minOrder && (
              <p className="mt-1 text-sm text-red-600">{errors.minOrder.message}</p>
            )}
          </div>

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('validFrom')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.validFrom ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.validFrom && (
              <p className="mt-1 text-sm text-red-600">{errors.validFrom.message}</p>
            )}
          </div>

          {/* Valid To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('validTo')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.validTo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.validTo && (
              <p className="mt-1 text-sm text-red-600">{errors.validTo.message}</p>
            )}
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới hạn số lần sử dụng <span className="text-gray-500">(Tùy chọn)</span>
            </label>
            <input
              type="number"
              step="1"
              {...register('usageLimit', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="100"
            />
            <p className="mt-1 text-xs text-gray-500">Để trống = không giới hạn</p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Kích hoạt mã khuyến mãi
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoCodeModal;
