import { FiTruck, FiCreditCard, FiMapPin, FiInfo } from 'react-icons/fi';

const Shipping = () => {
  return (
    <div className="w-full bg-gray-50">
      <div className="w-full px-4 md:px-8 py-10 md:py-14">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Giao hàng & thanh toán</h1>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl">
              Thông tin về hình thức giao hàng, phạm vi áp dụng và phương thức thanh toán hỗ trợ tại TechStore.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                  <FiTruck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Hình thức giao hàng</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Giao hàng tận nơi trên toàn quốc thông qua đối tác vận chuyển.</li>
                <li>• Nhận hàng tại cửa hàng TechStore (áp dụng với một số khu vực).</li>
                <li>• Kiểm tra ngoại quan sản phẩm trước khi nhận hàng.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiCreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Thanh toán khi nhận hàng (COD) với một số khu vực được hỗ trợ.</li>
                <li>• Chuyển khoản ngân hàng theo thông tin tài khoản TechStore.</li>
                <li>• Thanh toán online qua cổng thanh toán (nếu được hỗ trợ).</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Thời gian & phí giao hàng</h2>
              </div>
              <ul className="text-sm md:text-base text-gray-600 space-y-1">
                <li>• Nội thành TP. Hồ Chí Minh: dự kiến 1 - 2 ngày làm việc.</li>
                <li>• Các tỉnh thành khác: 2 - 5 ngày làm việc tùy khu vực.</li>
                <li>• Phí giao hàng được hiển thị rõ trước khi xác nhận đơn.</li>
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
              <li>• Vui lòng cung cấp địa chỉ, số điện thoại chính xác để tránh chậm trễ.</li>
              <li>• Một số khu vực xa có thể phát sinh phụ phí theo quy định của đơn vị vận chuyển.</li>
              <li>• Nếu đơn hàng gặp sự cố giao hàng, hãy liên hệ hotline để được hỗ trợ.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;


