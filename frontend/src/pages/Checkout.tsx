import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiCreditCard, FiTruck, FiTag, FiX, FiMapPin, FiPlus } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { cartService } from '../services/cartService';
import { useAuthStore } from '../store/authStore';
import { promoCodeService } from '../services/promoCodeService';
import { profileService, type UserAddress } from '../services/profileService';
import { orderService } from '../services/orderService';
import AddressDropdown from '../components/AddressDropdown';
import AddressAutocomplete from '../components/AddressAutocomplete';
import toast from 'react-hot-toast';

// Helper function to validate image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Check if it's a valid HTTP/HTTPS URL and not a placeholder service
    return (
      (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
      !urlObj.hostname.includes('placeholder.com') &&
      !urlObj.hostname.includes('via.placeholder.com')
    );
  } catch {
    // If URL parsing fails, it might be a relative URL, which is OK
    return url.startsWith('/') || url.startsWith('./');
  }
};

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  paymentMethod: z.enum(['cod', 'bank', 'momo']),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, setCart } = useCartStore();
  const { user } = useAuthStore();

  // Get selected product IDs from navigation state
  const selectedProductIds = (location.state as any)?.selectedProductIds as string[] | undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<{
    code: string;
    discountAmount: number;
    isFreeShip: boolean;
  } | null>(null);
  const [isValidatingPromoCode, setIsValidatingPromoCode] = useState(false);

  // User addresses state
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);

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
    // Only redirect if not submitting (to avoid redirecting after successful order)
    if (items.length === 0 && !isSubmitting) {
      navigate('/cart');
    }
    // Redirect if no selected items when selectedProductIds is provided
    if (selectedProductIds && selectedProductIds.length === 0 && !isSubmitting) {
      navigate('/cart');
    }
  }, [items.length, navigate, isSubmitting, selectedProductIds]);

  // Load user addresses on mount (use cached data if available, otherwise fetch)
  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;

    const loadUserAddresses = async () => {
      if (!user?.id) return;

      // Use addresses from user object if available - use immediately
      if (user.addresses && user.addresses.length > 0) {
        const addresses = user.addresses;
        setUserAddresses(addresses);

        // Set default address if available
        const defaultAddress = addresses.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          setValue('address', defaultAddress.address);
        } else if (addresses.length > 0) {
          // If no default, use first address
          setSelectedAddressId(addresses[0]._id);
          setValue('address', addresses[0].address);
        }

        // Sync with backend in background (silently)
        try {
          abortController = new AbortController();
          const response = await profileService.getProfile();
          if (!isMounted || abortController.signal.aborted) return;

          if (response.success && response.data.user.addresses) {
            const addresses = response.data.user.addresses;
            setUserAddresses(addresses);

            // Update selected address if needed
            const defaultAddress = addresses.find((addr) => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress._id);
              setValue('address', defaultAddress.address);
            } else if (addresses.length > 0) {
              setSelectedAddressId(addresses[0]._id);
              setValue('address', addresses[0].address);
            }
          }
        } catch (error: any) {
          // Silently fail - we already have cached data
          if (error.code !== 'ECONNABORTED' && error.message !== 'Network Error' && error.name !== 'AbortError') {
            console.error('Error syncing addresses:', error);
          }
        }
        return;
      }

      // Skip if already loading
      if (isLoadingAddresses) return;

      try {
        setIsLoadingAddresses(true);
        abortController = new AbortController();
        const response = await profileService.getProfile();
        if (!isMounted || abortController.signal.aborted) return;

        if (response.success && response.data.user.addresses) {
          const addresses = response.data.user.addresses;
          setUserAddresses(addresses);

          // Set default address if available
          const defaultAddress = addresses.find((addr) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id);
            setValue('address', defaultAddress.address);
          } else if (addresses.length > 0) {
            // If no default, use first address
            setSelectedAddressId(addresses[0]._id);
            setValue('address', addresses[0].address);
          }
        }
      } catch (error: any) {
        // Only log error, don't show toast for timeout/network errors
        if (error.code !== 'ECONNABORTED' && error.message !== 'Network Error' && error.name !== 'AbortError') {
          console.error('Error loading user addresses:', error);
        }
      } finally {
        if (isMounted && !abortController?.signal.aborted) {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadUserAddresses();

    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id, not the whole user object or setValue

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);

      // Create order via API
      const response = await orderService.createOrder({
        shippingAddress: data.address,
        paymentMethod: data.paymentMethod,
        promoCode: appliedPromoCode?.code || undefined,
        notes: data.notes || undefined,
        selectedProductIds: selectedProductIds,
      });

      if (response.success && response.data.order) {
        toast.success('Đặt hàng thành công!');

        // Navigate first, then reload cart from backend to sync state
        navigate('/orders');

        // Reload cart from backend to sync with server (backend already removed selected items)
        setTimeout(async () => {
          try {
            const cartResponse = await cartService.getCart();
            setCart(cartResponse.data);
          } catch (error) {
            console.error('Error reloading cart:', error);
          }
        }, 100);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items to only selected ones if selectedProductIds is provided
  const displayItems = selectedProductIds
    ? items.filter((item) => {
      const productId = typeof item.productId === 'string' ? item.productId : (item.productId as any)?._id;
      return productId && selectedProductIds.includes(productId);
    })
    : items;

  // Calculate totals for selected items only
  const displayTotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate shipping fee (free if promo code provides free shipping or order > 1M)
  const qualifiesForFreeShip = appliedPromoCode?.isFreeShip || displayTotal > 1000000;
  const shippingFee = qualifiesForFreeShip ? 0 : 50000;

  // Calculate discount from promo code (based on displayTotal)
  const discountAmount = appliedPromoCode?.discountAmount || 0;

  // Calculate final total
  const finalTotal = Math.max(0, displayTotal - discountAmount + shippingFee);

  // Handle promo code validation
  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }

    try {
      setIsValidatingPromoCode(true);
      const response = await promoCodeService.validate(promoCode.trim(), displayTotal);

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

  // Handle add new address
  const handleAddNewAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }

    try {
      setIsSavingNewAddress(true);
      await profileService.addAddress(newAddress.trim());

      // Reload addresses
      const response = await profileService.getProfile();
      if (response.success && response.data.user.addresses) {
        const addresses = response.data.user.addresses;
        setUserAddresses(addresses);

        // Select the newly added address
        const newAddedAddress = addresses.find((addr) => addr.address === newAddress.trim());
        if (newAddedAddress) {
          setSelectedAddressId(newAddedAddress._id);
          setValue('address', newAddedAddress.address);
        }
      }

      setNewAddress('');
      setIsAddingNewAddress(false);
      toast.success('Thêm địa chỉ mới thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thêm địa chỉ thất bại');
    } finally {
      setIsSavingNewAddress(false);
    }
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
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.fullName ? 'border-red-500' : ''}`}
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
                    <input
                      {...register('phone')}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="0901234567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      disabled
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <FiMapPin className="inline w-4 h-4 mr-1 mb-1" />
                      Địa chỉ giao hàng <span className="text-red-500">*</span>
                    </label>
                    {!isAddingNewAddress && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <FiPlus className="w-4 h-4" />
                        Thêm địa chỉ mới
                      </button>
                    )}
                  </div>

                  {isAddingNewAddress ? (
                    <div className="space-y-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <AddressAutocomplete
                        value={newAddress}
                        onChange={setNewAddress}
                        placeholder="Nhập địa chỉ mới..."
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddNewAddress}
                          disabled={isSavingNewAddress}
                          className="btn-primary text-sm py-1.5 px-3"
                        >
                          {isSavingNewAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(false);
                            setNewAddress('');
                          }}
                          className="btn-ghost text-sm py-1.5 px-3"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : userAddresses.length > 0 ? (
                    <AddressDropdown
                      value={selectedAddressId}
                      onChange={(addressId) => {
                        setSelectedAddressId(addressId);
                        const selectedAddress = userAddresses.find((addr) => addr._id === addressId);
                        if (selectedAddress) {
                          setValue('address', selectedAddress.address);
                        }
                      }}
                      options={userAddresses.map((addr) => ({
                        code: addr._id,
                        name: addr.isDefault ? `${addr.address} (Mặc định)` : addr.address,
                      }))}
                      placeholder={isLoadingAddresses ? 'Đang tải...' : 'Chọn địa chỉ'}
                      error={errors.address?.message}
                      disabled={isLoadingAddresses}
                    />
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 italic mb-2">Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
                      <input
                        {...register('address')}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="Nhập địa chỉ giao hàng"
                      />
                    </div>
                  )}
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
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
                {displayItems.map((item) => {
                  const primaryImage = item.productId.images?.find((img) => img.isPrimary) || item.productId.images?.[0];
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {primaryImage &&
                          primaryImage.url &&
                          isValidImageUrl(primaryImage.url) &&
                          !imageErrors.has(primaryImage.url) ? (
                          <img
                            src={primaryImage.url}
                            alt={item.productId.name}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Mark this image URL as failed
                              setImageErrors((prev) => new Set(prev).add(primaryImage.url));
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
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
                  <span>{displayTotal.toLocaleString('vi-VN')}₫</span>
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
                      <span className="text-green-600 font-medium">
                        {appliedPromoCode?.isFreeShip
                          ? 'Miễn phí (áp dụng mã freeship)'
                          : 'Miễn phí'}
                      </span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Đơn hàng trên 1.000.000₫ thì phí vận chuyển miễn phí, còn dưới thì phí ship 50.000₫.
                </p>
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

