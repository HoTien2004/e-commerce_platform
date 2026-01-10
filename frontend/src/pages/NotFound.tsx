import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-8xl">😢</div>
            <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-1 bg-primary-600"></div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Không tìm thấy trang
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <p className="text-base text-gray-500">
            Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiHome className="w-5 h-5" />
            <span>Về trang chủ</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Hoặc truy cập các trang phổ biến:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/store"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Cửa hàng
            </Link>
            <Link
              to="/help"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Trung tâm hỗ trợ
            </Link>
            <Link
              to="/warranty"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Bảo hành
            </Link>
            <Link
              to="/shipping"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Giao hàng
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFound;

