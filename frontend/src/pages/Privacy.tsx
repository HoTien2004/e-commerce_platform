import { FiShield, FiLock, FiUser, FiInfo } from 'react-icons/fi';

const Privacy = () => {
  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Chính sách bảo mật thông tin</h1>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl">
              TechStore tôn trọng và bảo vệ quyền riêng tư của khách hàng, cam kết chỉ sử dụng thông tin vào
              mục đích phục vụ mua sắm và chăm sóc khách hàng.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <FiUser className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Thông tin thu thập</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Họ tên, email, số điện thoại, địa chỉ giao hàng.</li>
                <li>• Lịch sử đơn hàng và tương tác với TechStore.</li>
                <li>• Không thu thập thông tin thẻ thanh toán nhạy cảm.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiShield className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Mục đích sử dụng</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Xử lý đơn hàng và giao hàng cho khách.</li>
                <li>• Liên hệ tư vấn, hỗ trợ kỹ thuật, chăm sóc sau bán.</li>
                <li>• Gửi thông tin khuyến mãi nếu khách hàng đồng ý.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <FiLock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Bảo mật & chia sẻ</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Thông tin được lưu trữ an toàn, giới hạn truy cập nội bộ.</li>
                <li>• Không bán hoặc chia sẻ cho bên thứ ba ngoài đối tác vận chuyển/thanh toán.</li>
                <li>• Chỉ cung cấp khi có yêu cầu hợp pháp từ cơ quan chức năng.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FiInfo className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Quyền của khách hàng</h2>
            </div>
            <ul className="text-sm md:text-base text-gray-600 space-y-1">
              <li>• Xem, chỉnh sửa thông tin cá nhân trong trang hồ sơ.</li>
              <li>• Yêu cầu xoá thông tin cá nhân khỏi hệ thống khi không còn sử dụng dịch vụ.</li>
              <li>• Từ chối nhận email/SMS marketing bất kỳ lúc nào.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


