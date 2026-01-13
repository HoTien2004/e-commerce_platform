import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';
import {
  FiArrowLeft,
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { scrollToTop } from '../utils/scrollToTop';

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

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    icon: FiClock,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    description: 'Đơn hàng đang chờ Shop xác nhận và chuẩn bị hàng',
  },
  shipped: {
    label: 'Chờ giao hàng',
    icon: FiTruck,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    description: 'Đơn hàng đã được xác nhận và đang trên đường giao đến bạn',
  },
  delivered: {
    label: 'Đã giao',
    icon: FiCheckCircle,
    color: 'text-green-600 bg-green-50 border-green-200',
    description: 'Đơn hàng đã được giao thành công',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: FiXCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
    description: 'Đơn hàng đã bị hủy',
  },
  returned: {
    label: 'Trả hàng/Hoàn tiền',
    icon: FiRefreshCw,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    description: 'Đơn hàng đã được trả hàng và hoàn tiền',
  },
};

const OrderDetail = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem chi tiết đơn hàng');
      navigate('/');
      return;
    }
    if (orderNumber) {
      loadOrder();
    }
    scrollToTop();
  }, [orderNumber, isAuthenticated, navigate]);

  const loadOrder = async () => {
    if (!orderNumber) return;

    try {
      setIsLoading(true);
      const response = await orderService.getOrderById(orderNumber);
      if (response.success && response.data.order) {
        setOrder(response.data.order);
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !order._id) return;

    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setIsCancelling(true);
      const response = await orderService.cancelOrder(order._id);
      if (response.success) {
        toast.success('Hủy đơn hàng thành công!');
        loadOrder(); // Reload to get updated status
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusConfig = (status: Order['orderStatus']) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cod: 'Thanh toán khi nhận hàng (COD)',
      bank: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo',
    };
    return labels[method] || method;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải chi tiết đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn hàng</p>
            <Link to="/orders" className="btn-primary mt-4">
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusConfig(order.orderStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách đơn hàng</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Đơn hàng: {order.orderNumber}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}
                >
                  <StatusIcon className="w-5 h-5" />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = typeof item.productId === 'object' ? item.productId : null;
                  const primaryImage = product?.images?.find((img) => img.isPrimary) || product?.images?.[0];

                  return (
                    <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-20 h-20 bg-primary-50 rounded-lg overflow-hidden border-2 border-primary-600">
                        {primaryImage && 
                         primaryImage.url && 
                         isValidImageUrl(primaryImage.url) && 
                         !imageErrors.has(primaryImage.url) ? (
                          <img
                            src={primaryImage.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Mark this image URL as failed
                              setImageErrors((prev) => new Set(prev).add(primaryImage.url));
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{item.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Số lượng:</span> {item.quantity}
                          </p>
                          <p>
                            <span className="font-medium">Đơn giá:</span> {item.price.toLocaleString('vi-VN')}₫
                          </p>
                          <p className="text-base font-semibold text-primary-600 pt-1">
                            Thành tiền: {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-primary-600" />
                Thông tin giao hàng
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Người nhận</p>
                  <p className="text-gray-900">{order.customerInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    Số điện thoại
                  </p>
                  <p className="text-gray-900">{order.customerInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="text-gray-900">{order.customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</p>
                  <p className="text-gray-900">{order.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-primary-600" />
                Phương thức thanh toán
              </h2>
              <p className="text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ghi chú</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{order.discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                {order.promoCode && (
                  <div className="text-xs text-gray-500 mb-2">
                    Mã khuyến mãi: <span className="font-medium">{order.promoCode}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {order.shippingFee === 0 ? (
                      <span className="text-green-600 font-medium">Miễn phí</span>
                    ) : (
                      `${order.shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{order.total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {order.orderStatus === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                </button>
              )}

              <Link
                to="/orders"
                className="block w-full mt-3 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

