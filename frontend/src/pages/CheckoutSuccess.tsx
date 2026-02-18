import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiHome, FiPackage } from 'react-icons/fi';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = (location.state as any)?.orderNumber || 'TS-XXXXXX';
  const total = (location.state as any)?.total || 0;

  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-600">
              Cảm ơn bạn đã mua sắm tại HDQTShop. Đơn hàng của bạn đang được xử lý.
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <FiPackage className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Thông tin đơn hàng</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold text-primary-600">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Bước tiếp theo:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Chúng tôi sẽ gửi email xác nhận đơn hàng đến địa chỉ email của bạn</li>
              <li>• Đơn hàng sẽ được xử lý trong vòng 24 giờ</li>
              <li>• Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {orderNumber ? (
              <Link
                to={`/orders/${orderNumber}`}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                <FiPackage className="w-5 h-5" />
                <span>Xem chi tiết đơn hàng</span>
              </Link>
            ) : (
              <Link
                to="/orders"
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                <FiPackage className="w-5 h-5" />
                <span>Xem đơn hàng</span>
              </Link>
            )}
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-semibold"
            >
              <FiHome className="w-5 h-5" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;

