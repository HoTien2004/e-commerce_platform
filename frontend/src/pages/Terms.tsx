import { FiFileText, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const Terms = () => {
    return (
        <div className="w-full bg-gray-50">
            <div className="w-full px-4 md:px-8 py-10 md:py-14">
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Điều khoản sử dụng</h1>
                        <p className="text-sm md:text-base text-gray-600 max-w-3xl">
                            Khi truy cập và mua sắm tại HDQTShop, bạn đồng ý với các điều khoản sử dụng dưới đây. Vui lòng
                            đọc kỹ để hiểu rõ quyền lợi và trách nhiệm của mình.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 mb-10">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                                    <FiFileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Quy định chung</h2>
                            </div>
                            <ul className="text-sm md:text-base text-gray-600 space-y-1">
                                <li>• Nội dung trên website có thể được cập nhật, thay đổi mà không báo trước.</li>
                                <li>• Giá bán và khuyến mãi có thể thay đổi theo từng thời điểm.</li>
                                <li>• Hình ảnh chỉ mang tính minh họa, chi tiết xem tại mô tả sản phẩm.</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <FiCheckCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Trách nhiệm của khách hàng</h2>
                            </div>
                            <ul className="text-sm md:text-base text-gray-600 space-y-1">
                                <li>• Cung cấp thông tin chính xác khi đặt hàng và tạo tài khoản.</li>
                                <li>• Bảo mật thông tin đăng nhập, không chia sẻ cho người khác.</li>
                                <li>• Kiểm tra kỹ thông tin đơn hàng trước khi xác nhận thanh toán.</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                    <FiXCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Hành vi bị cấm</h2>
                            </div>
                            <ul className="text-sm md:text-base text-gray-600 space-y-1">
                                <li>• Lợi dụng website để lừa đảo, phát tán mã độc, spam.</li>
                                <li>• Can thiệp trái phép vào hệ thống, dữ liệu của HDQTShop.</li>
                                <li>• Sử dụng thông tin của người khác mà không được phép.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <FiInfo className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Thay đổi điều khoản</h2>
                        </div>
                        <ul className="text-sm md:text-base text-gray-600 space-y-1">
                            <li>• HDQTShop có thể điều chỉnh điều khoản để phù hợp với quy định pháp luật.</li>
                            <li>• Các thay đổi sẽ được cập nhật trên website, khách hàng nên kiểm tra định kỳ.</li>
                            <li>• Việc tiếp tục sử dụng website sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận điều khoản mới.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;


