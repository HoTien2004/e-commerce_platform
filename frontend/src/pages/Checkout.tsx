import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiCreditCard, FiTruck, FiMapPin, FiPhone, FiMail, FiTag, FiX } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { promoCodeService } from '../services/promoCodeService';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  city: z.string().min(1, 'Thành phố không được để trống'),
  district: z.string().min(1, 'Quận/Huyện không được để trống'),
  ward: z.string().min(1, 'Phường/Xã không được để trống'),
  paymentMethod: z.enum(['cod', 'bank', 'momo']),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discountAmount: number;
    isFreeShip: boolean;
  } | null>(null);
  const [isValidatingPromoCode, setIsValidatingPromoCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      paymentMethod: 'cod',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      navigate('/cart');
    }
  }, [items, navigate]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);

      // TODO: Call API to create order
      // Mock order creation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Apply promo code if used (increment usage count)
      if (appliedPromoCode) {
        try {
          await promoCodeService.apply(appliedPromoCode.code);
        } catch (error) {
          console.error('Error applying promo code:', error);
          // Don't block order creation if promo code apply fails
        }
      }

      // Clear cart
      clearCart();

      toast.success('Đặt hàng thành công!');
      navigate('/checkout/success', {
        state: {
          orderId: `TS-${Date.now()}`,
          total: finalTotal,
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate shipping fee (free if promo code provides free shipping or order > 5M)
  const shippingFee = 
    appliedPromoCode?.isFreeShip || total > 5000000 
      ? 0 
      : 30000;
  
  // Calculate discount from promo code
  const discountAmount = appliedPromoCode?.discountAmount || 0;
  
  // Calculate final total
  const finalTotal = Math.max(0, total - discountAmount + shippingFee);
  
  // Handle promo code validation
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }
    
    try {
      setIsValidatingPromoCode(true);
      const response = await promoCodeService.validate(promoCode.trim(), total);
      
      if (response.success && response.data) {
        setAppliedPromoCode({
          code: response.data.code,
          discountAmount: response.data.discountAmount,
          isFreeShip: response.data.isFreeShip,
        });
        setPromoCode('');
        toast.success('Áp dụng mã khuyến mãi thành công!');
      } else {
        toast.error(response.message || 'Mã khuyến mãi không hợp lệ');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi áp dụng mã khuyến mãi');
    } finally {
      setIsValidatingPromoCode(false);
    }
  };
  
  // Remove promo code
  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    toast.success('Đã xóa mã khuyến mãi');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại giỏ hàng</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Thanh toán</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiTruck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Thông tin giao hàng</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    className={errors.fullName ? 'border-red-500' : ''}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('phone')}
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="0901234567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        {...register('email')}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('address')}
                      className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="Số nhà, tên đường"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('city')}
                      className={errors.city ? 'border-red-500' : ''}
                      placeholder="TP. Hồ Chí Minh"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('district')}
                      className={errors.district ? 'border-red-500' : ''}
                      placeholder="Quận 1"
                    />
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('ward')}
                      className={errors.ward ? 'border-red-500' : ''}
                      placeholder="Phường Bến Nghé"
                    />
                    {errors.ward && (
                      <p className="mt-1 text-sm text-red-600">{errors.ward.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ghi chú cho đơn hàng..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiCreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="cod"
                    className="w-5 h-5 text-primary-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="bank"
                    className="w-5 h-5 text-primary-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-500">Chuyển khoản qua tài khoản ngân hàng</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="momo"
                    className="w-5 h-5 text-primary-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Ví MoMo</p>
                    <p className="text-sm text-gray-500">Thanh toán qua ứng dụng MoMo</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const primaryImage = item.productId.images?.find((img) => img.isPrimary) || item.productId.images?.[0];
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {primaryImage && (
                          <img
                            src={primaryImage.url}
                            alt={item.productId.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.productId.name}
                        </p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                        <p className="text-sm font-semibold text-primary-600">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                {appliedPromoCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">{appliedPromoCode.code}</p>
                        {appliedPromoCode.isFreeShip && (
                          <p className="text-xs text-green-600">Miễn phí vận chuyển</p>
                        )}
                        {appliedPromoCode.discountAmount > 0 && (
                          <p className="text-xs text-green-600">
                            Giảm {appliedPromoCode.discountAmount.toLocaleString('vi-VN')}₫
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromoCode}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <FiX className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mã khuyến mãi
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã khuyến mãi"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromoCode();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromoCode}
                        disabled={isValidatingPromoCode || !promoCode.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidatingPromoCode ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString('vi-VN')}₫</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

