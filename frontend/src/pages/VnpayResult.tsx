import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';

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
  };
}

const VnpayResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

        // Gọi trực tiếp BE với toàn bộ query
        const queryString = searchParams.toString();
        const response = await api.get<VnpayConfirmResponse>(`/payments/vnpay/confirm?${queryString}`);
        setResult(response.data);
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
  }, [location.search]);

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
                <p className="text-sm text-gray-500 mb-6">
                  Mã đơn hàng:{' '}
                  <span className="font-semibold text-gray-900">{result.data.orderNumber}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBackToOrders}
                  className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  Xem đơn hàng của tôi
                </button>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <FiXCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán không thành công</h1>
              <p className="text-gray-600 mb-4">
                {result?.message ||
                  'Thanh toán qua VNPay không thành công hoặc đã bị hủy. Vui lòng thử lại sau.'}
              </p>
              {result?.data?.orderNumber && (
                <p className="text-sm text-gray-500 mb-6">
                  Mã đơn hàng:{' '}
                  <span className="font-semibold text-gray-900">{result.data.orderNumber}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBackToOrders}
                  className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  Xem đơn hàng của tôi
                </button>
                <Link
                  to="/cart"
                  className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  Quay lại giỏ hàng
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VnpayResult;


