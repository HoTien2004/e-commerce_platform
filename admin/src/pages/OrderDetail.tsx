import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService, type Order } from '../services/orderService';
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
  FiEdit,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: {
    label: 'Chờ xử lý',
    icon: FiClock,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  shipped: {
    label: 'Đang giao',
    icon: FiTruck,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  delivered: {
    label: 'Đã giao',
    icon: FiCheckCircle,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: FiXCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  returned: {
    label: 'Đã trả hàng',
    icon: FiRefreshCw,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  },
};

const OrderDetail = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    if (!orderNumber) return;

    try {
      setIsLoading(true);
      const response = await orderService.getOrderById(orderNumber);
      if (response.success && response.data.order) {
        setOrder(response.data.order);
      } else {
        toast.error('Không tìm thấy đơn hàng');
        navigate('/orders');
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải chi tiết đơn hàng';
      toast.error(errorMessage);
      
      // Only navigate if it's not a 401 (unauthorized) - let ProtectedRoute handle that
      if (error.response?.status !== 401) {
        navigate('/orders');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${newStatus}"?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      // Use orderNumber for consistency with URL
      await orderService.updateOrderStatus(order.orderNumber, { orderStatus: newStatus as any });
      toast.success('Cập nhật trạng thái thành công!');
      loadOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return (
        (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
        !urlObj.hostname.includes('placeholder.com') &&
        !urlObj.hostname.includes('via.placeholder.com')
      );
    } catch {
      return url.startsWith('/') || url.startsWith('./');
    }
  };

  const getStatusConfig = (status: Order['orderStatus']) => statusConfig[status] || statusConfig.pending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const statusInfo = getStatusConfig(order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Status Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {(['pending', 'shipped', 'delivered', 'cancelled', 'returned'] as const).map((status) => {
            const config = statusConfig[status];
            const isActive = order.orderStatus === status;
            return (
              <button
                key={status}
                onClick={() => !isActive && handleStatusChange(status)}
                disabled={isUpdating || isActive}
                className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                  isActive
                    ? `${config.color} cursor-default`
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50'
                }`}
              >
                <config.icon className="w-5 h-5" />
                <span className="font-semibold">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đặt:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-medium">
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                   order.paymentMethod === 'vnpay' ? 'Thanh toán VNPay' :
                   order.paymentMethod === 'momo' ? 'Ví MoMo' : order.paymentMethod}
                </span>
              </div>
              {order.paymentStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái thanh toán:</span>
                  <span className={`font-medium px-2 py-1 rounded ${
                    order.paymentStatus === 'paid' ? 'text-green-600 bg-green-50' :
                    order.paymentStatus === 'failed' ? 'text-red-600 bg-red-50' :
                    order.paymentStatus === 'refunded' ? 'text-gray-600 bg-gray-50' :
                    'text-yellow-600 bg-yellow-50'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                     order.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                     order.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                     'Chờ thanh toán'}
                  </span>
                </div>
              )}
              {order.paymentTransactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-medium font-mono text-sm">{order.paymentTransactionId}</span>
                </div>
              )}
              {order.promoCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã khuyến mãi:</span>
                  <span className="font-medium text-primary-600">{order.promoCode}</span>
                </div>
              )}
              {order.notes && (
                <div>
                  <span className="text-gray-600">Ghi chú:</span>
                  <p className="mt-1 text-gray-900">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => {
                const product = item.productId;
                const primaryImage = product?.images?.find((img: any) => img.isPrimary) || product?.images?.[0];
                const imageUrl = primaryImage?.url;
                const isValidImage = isValidImageUrl(imageUrl);
                const hasError = imageUrl && imageErrors.has(imageUrl);

                return (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-20 h-20 flex-shrink-0 border-2 border-primary-600 bg-primary-50 rounded-lg overflow-hidden">
                      {isValidImage && !hasError ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={() => imageUrl && setImageErrors((prev) => new Set(prev).add(imageUrl))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-gray-600">Số lượng: {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{order.customerInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{order.customerInfo.email}</span>
              </div>
              {order.userId && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Tài khoản</p>
                  <p className="font-medium">
                    {order.userId.firstName} {order.userId.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{order.userId.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

