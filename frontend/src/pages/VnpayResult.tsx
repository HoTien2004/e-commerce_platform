import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import { API_BASE_URL } from '../config/api';

// Ảnh từ BE có thể là URL tuyệt đối hoặc đường dẫn tương đối (/uploads/...)
const getImageSrc = (url: string | null): string | null => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return origin + (url.startsWith('/') ? url : '/' + url);
};

interface OrderDetailItem {
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface OrderDetails {
  customerInfo: { fullName: string; phone: string; email: string };
  shippingAddress: string;
  items: OrderDetailItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

interface VnpayConfirmResponse {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    orderNumber: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentProvider: string | null;
    paymentTransactionId: string | null;
    responseCode: string | null;
    orderDetails?: OrderDetails | null;
  };
}

const VnpayResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setCart = useCartStore((s) => s.setCart);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<VnpayConfirmResponse | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        setIsLoading(true);

        const searchParams = new URLSearchParams(location.search);
        if (!searchParams.has('vnp_TxnRef')) {
          setResult({
            success: false,
            message: 'Thiếu thông tin đơn hàng từ VNPay',
          } as VnpayConfirmResponse);
          setIsLoading(false);
          return;
        }

        const queryString = searchParams.toString();
        const response = await api.get<VnpayConfirmResponse>(`/payments/vnpay/confirm?${queryString}`);
        setResult(response.data);

        // Thành công: giỏ đã trừ lúc tạo đơn → sync để header cập nhật ngay.
        // Thất bại: BE đã khôi phục giỏ → sync để header và trang giỏ hàng hiển thị đúng.
        try {
          const cartResponse = await cartService.getCart();
          if (cartResponse.success && cartResponse.data) {
            setCart(cartResponse.data);
          }
        } catch (e) {
          console.error('Error syncing cart after payment:', e);
        }
      } catch (error: any) {
        console.error('Error confirming VNPay payment:', error);
        setResult({
          success: false,
          message:
            error.response?.data?.message ||
            'Không thể xác nhận kết quả thanh toán. Vui lòng thử lại sau.',
        } as VnpayConfirmResponse);
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [location.search, setCart]);

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  const isSuccess = result?.success && result.data?.paymentStatus === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          {isLoading ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
                <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý thanh toán</h1>
              <p className="text-gray-600">
                Vui lòng chờ trong giây lát, chúng tôi đang xác nhận kết quả từ VNPay...
              </p>
            </>
          ) : isSuccess ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-4">
                Đơn hàng của bạn đã được thanh toán qua VNPay. Cảm ơn bạn đã mua sắm tại cửa hàng.
              </p>
              {result?.data?.orderNumber && (
                <p className="text-sm text-gray-500 mb-4">
                  Mã đơn hàng:{' '}
                  <span className="font-semibold text-gray-900">{result.data.orderNumber}</span>
                </p>
              )}

              {result?.data?.orderDetails && (
                <div className="text-left border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h2>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium text-gray-700">Họ tên:</span> {result.data.orderDetails.customerInfo.fullName}</p>
                    <p><span className="font-medium text-gray-700">Số điện thoại:</span> {result.data.orderDetails.customerInfo.phone}</p>
                    <p><span className="font-medium text-gray-700">Email:</span> {result.data.orderDetails.customerInfo.email}</p>
                    <p><span className="font-medium text-gray-700">Địa chỉ giao hàng:</span> {result.data.orderDetails.shippingAddress}</p>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Chi tiết sản phẩm</h3>
                  <ul className="space-y-3 mb-4">
                    {result.data.orderDetails.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-center py-2 border-b border-gray-100 last:border-0">
                        <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                          {getImageSrc(item.image) ? (
                            <img src={getImageSrc(item.image)!} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-gray-500">x{item.quantity} · {item.price.toLocaleString('vi-VN')}₫</p>
                        </div>
                        <p className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
                    {result.data.orderDetails.discount > 0 && (
                      <p className="flex justify-between text-gray-600">
                        <span>Giảm giá</span>
                        <span>-{result.data.orderDetails.discount.toLocaleString('vi-VN')}₫</span>
                      </p>
                    )}
                    {result.data.orderDetails.shippingFee > 0 && (
                      <p className="flex justify-between text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span>{result.data.orderDetails.shippingFee.toLocaleString('vi-VN')}₫</span>
                      </p>
                    )}
                    <p className="flex justify-between font-semibold text-gray-900 text-base pt-1">
                      <span>Tổng thanh toán</span>
                      <span>{result.data.orderDetails.total.toLocaleString('vi-VN')}₫</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors text-center"
                >
                  Tiếp tục mua sắm
                </Link>
                <button
                  onClick={handleBackToOrders}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Theo dõi đơn hàng
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <FiXCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán không thành công</h1>
              <p className="text-gray-600 mb-4">
                Thanh toán qua VNPay không thành công hoặc đã bị hủy. Vui lòng thử lại sau.
              </p>
              {result?.data?.orderNumber && (
                <p className="text-sm text-gray-500 mb-2">
                  Mã đơn hàng:{' '}
                  <span className="font-semibold text-gray-900">{result.data.orderNumber}</span>
                </p>
              )}
              {result?.data?.orderDetails && (
                <div className="text-left border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h2>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium text-gray-700">Họ tên:</span> {result.data.orderDetails.customerInfo.fullName}</p>
                    <p><span className="font-medium text-gray-700">Số điện thoại:</span> {result.data.orderDetails.customerInfo.phone}</p>
                    <p><span className="font-medium text-gray-700">Email:</span> {result.data.orderDetails.customerInfo.email}</p>
                    <p><span className="font-medium text-gray-700">Địa chỉ giao hàng:</span> {result.data.orderDetails.shippingAddress}</p>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Chi tiết sản phẩm</h3>
                  <ul className="space-y-3 mb-4">
                    {result.data.orderDetails.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3 items-center py-2 border-b border-gray-100 last:border-0">
                        <div className="w-14 h-14 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                          {getImageSrc(item.image) ? (
                            <img src={getImageSrc(item.image)!} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-gray-500">x{item.quantity} · {item.price.toLocaleString('vi-VN')}₫</p>
                        </div>
                        <p className="font-medium text-gray-900">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 pt-3">
                    <p className="flex justify-between font-semibold text-gray-900 text-sm">
                      <span>Tổng thanh toán</span>
                      <span>{result.data.orderDetails.total.toLocaleString('vi-VN')}₫</span>
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors text-center"
                >
                  Tiếp tục mua sắm
                </Link>
                <button
                  onClick={handleBackToOrders}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Theo dõi đơn hàng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VnpayResult;


