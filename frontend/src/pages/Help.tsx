import { FiHelpCircle, FiLock, FiShoppingBag, FiHeadphones, FiMail, FiPhone } from 'react-icons/fi';

const Help = () => {
  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Trung tâm hỗ trợ</h1>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl">
                Nếu bạn gặp vấn đề với đăng nhập, đặt lại mật khẩu hoặc đơn hàng, hãy xem các hướng dẫn nhanh
                bên dưới hoặc liên hệ đội ngũ TechStore để được hỗ trợ.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                <FiHelpCircle className="w-5 h-5" />
              </div>
              <div className="text-xs md:text-sm text-gray-700">
                <p className="font-semibold">Cần hỗ trợ nhanh?</p>
                <p>Hotline: <span className="font-medium">1900-xxxx</span></p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <FiLock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Vấn đề đăng nhập</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Quên mật khẩu: sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập.</li>
                <li>• Không nhận được OTP: kiểm tra hộp thư Spam/Quảng cáo hoặc thử gửi lại OTP.</li>
                <li>• Tài khoản bị khóa: liên hệ hotline để được mở khóa.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Đơn hàng & giao hàng</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Kiểm tra trạng thái đơn hàng tại trang "Đơn hàng" trong tài khoản.</li>
                <li>• Nếu đơn hàng bị chậm, hãy liên hệ hotline để được cập nhật.</li>
                <li>• Thay đổi địa chỉ giao hàng: hỗ trợ khi đơn hàng chưa được giao cho đơn vị vận chuyển.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FiHeadphones className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Liên hệ trực tiếp</h2>
              </div>
              <p className="text-sm md:text-base text-gray-600 mb-3">
                Nếu bạn cần hỗ trợ nhanh, hãy liên hệ qua các kênh sau:
              </p>
              <ul className="text-sm md:text-base text-gray-700 space-y-1">
                <li className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-gray-500" />
                  <span>Hotline: 1900-xxxx (8:30 - 21:30 mỗi ngày)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-gray-500" />
                  <span>Email: support@techstore.com</span>
                </li>
                <li>• Zalo: 0909 999 999</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;