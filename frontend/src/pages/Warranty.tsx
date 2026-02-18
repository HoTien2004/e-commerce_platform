import { FiRefreshCw, FiShield, FiClock, FiInfo } from 'react-icons/fi';

const Warranty = () => {
  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Chính sách bảo hành & đổi trả</h1>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl">
              HDQTShop cam kết mang đến cho bạn sản phẩm chính hãng, bảo hành rõ ràng và quy trình đổi trả minh bạch,
              giúp bạn yên tâm sử dụng.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <FiShield className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Thời gian bảo hành</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Laptop, PC, màn hình: bảo hành từ 12 - 36 tháng tùy model.</li>
                <li>• Phụ kiện: bảo hành từ 6 - 24 tháng theo quy định hãng.</li>
                <li>• Chi tiết thời gian được ghi rõ trên phiếu bảo hành hoặc hoá đơn.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiRefreshCw className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Điều kiện đổi trả</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Đổi mới trong 7 ngày nếu lỗi do nhà sản xuất.</li>
                <li>• Sản phẩm còn đầy đủ hộp, phụ kiện, hoá đơn, tem bảo hành.</li>
                <li>• Không áp dụng đổi trả với sản phẩm hư hỏng do người dùng.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <FiClock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Thời gian xử lý</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Tiếp nhận bảo hành trong vòng 24h kể từ khi nhận sản phẩm.</li>
                <li>• Thời gian xử lý dự kiến: 7 - 21 ngày làm việc.</li>
                <li>• Trường hợp cần đổi máy, sẽ được tư vấn phương án cụ thể.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FiInfo className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Lưu ý thêm</h2>
            </div>
            <ul className="text-sm md:text-base text-gray-600 space-y-1">
              <li>• Vui lòng sao lưu dữ liệu trước khi gửi máy bảo hành.</li>
              <li>• HDQTShop không chịu trách nhiệm với dữ liệu cá nhân lưu trên thiết bị.</li>
              <li>• Mọi thắc mắc xin liên hệ Trung tâm hỗ trợ hoặc hotline 1900-xxxx.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warranty;


