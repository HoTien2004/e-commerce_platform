import { FiCpu, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const BuildPCGuide = () => {
    const components = [
        {
            name: 'CPU (Bộ xử lý)',
            description: 'Lựa chọn CPU phù hợp với nhu cầu',
            tips: [
                'Gaming: Intel Core i5/i7 hoặc AMD Ryzen 5/7',
                'Đồ họa/Render: Intel Core i7/i9 hoặc AMD Ryzen 7/9',
                'Văn phòng: Intel Core i3/i5 hoặc AMD Ryzen 3/5',
                'Kiểm tra socket tương thích với mainboard',
            ],
        },
        {
            name: 'Mainboard (Bo mạch chủ)',
            description: 'Nền tảng kết nối tất cả linh kiện',
            tips: [
                'Chọn chipset phù hợp với CPU',
                'Kiểm tra số khe RAM, cổng SATA, M.2',
                'Xem xét tính năng: WiFi, Bluetooth, RGB',
                'Form factor: ATX, mATX, ITX tùy case',
            ],
        },
        {
            name: 'RAM (Bộ nhớ)',
            description: 'Quyết định hiệu năng đa nhiệm',
            tips: [
                'Gaming: 16GB DDR4/DDR5 (2x8GB)',
                'Đồ họa: 32GB trở lên',
                'Văn phòng: 8-16GB đủ dùng',
                'Tần số: 3200MHz+ cho DDR4, 5600MHz+ cho DDR5',
            ],
        },
        {
            name: 'GPU (Card đồ họa)',
            description: 'Quan trọng cho gaming và render',
            tips: [
                'Gaming 1080p: RTX 3060, RX 6600 XT',
                'Gaming 1440p: RTX 4070, RX 7700 XT',
                'Gaming 4K: RTX 4080/4090, RX 7900 XTX',
                'Render/3D: RTX series với VRAM lớn',
            ],
        },
        {
            name: 'SSD/HDD (Ổ cứng)',
            description: 'Lưu trữ dữ liệu và hệ điều hành',
            tips: [
                'SSD NVMe M.2: Tốc độ cao, khuyến nghị cho OS',
                'Dung lượng: 500GB-1TB cho OS, thêm HDD cho storage',
                'Brand: Samsung, WD, Crucial, Kingston',
                'PCIe 4.0 cho hiệu năng tối đa',
            ],
        },
        {
            name: 'PSU (Nguồn)',
            description: 'Cung cấp điện cho toàn bộ hệ thống',
            tips: [
                'Công suất: 650W+ cho gaming, 850W+ cho high-end',
                '80 Plus Bronze trở lên (Gold/Platinum tốt hơn)',
                'Brand: Seasonic, Corsair, EVGA, be quiet!',
                'Modular: Dễ quản lý dây cáp',
            ],
        },
        {
            name: 'Case (Vỏ máy)',
            description: 'Bảo vệ và làm mát linh kiện',
            tips: [
                'Kích thước: ATX, mATX, ITX',
                'Airflow: Quan trọng cho tản nhiệt',
                'Số quạt: Tối thiểu 2-3 quạt',
                'RGB: Tùy chọn theo sở thích',
            ],
        },
        {
            name: 'Cooling (Tản nhiệt)',
            description: 'Giữ nhiệt độ CPU/GPU ổn định',
            tips: [
                'Air cooler: Phù hợp đa số, giá rẻ',
                'AIO Water cooler: Hiệu năng cao, giá cao hơn',
                'Kiểm tra kích thước tương thích với case',
                'Paste nhiệt: Dùng paste chất lượng tốt',
            ],
        },
    ];

    const buildSteps = [
        {
            step: 1,
            title: 'Lắp CPU vào Mainboard',
            description: 'Cẩn thận đặt CPU đúng hướng, không ép mạnh',
        },
        {
            step: 2,
            title: 'Lắp RAM',
            description: 'Lắp vào đúng khe, thường là khe 2 và 4 cho dual channel',
        },
        {
            step: 3,
            title: 'Lắp SSD M.2',
            description: 'Gắn vào khe M.2 trên mainboard, vặn ốc cố định',
        },
        {
            step: 4,
            title: 'Lắp Mainboard vào Case',
            description: 'Đặt mainboard vào case, vặn ốc standoff',
        },
        {
            step: 5,
            title: 'Lắp PSU',
            description: 'Gắn PSU vào case, kết nối dây nguồn',
        },
        {
            step: 6,
            title: 'Lắp GPU',
            description: 'Cắm vào khe PCIe x16, vặn ốc cố định',
        },
        {
            step: 7,
            title: 'Lắp Cooling',
            description: 'Gắn CPU cooler, kết nối quạt',
        },
        {
            step: 8,
            title: 'Kết nối dây cáp',
            description: 'Kết nối tất cả dây nguồn, dây data, dây quạt',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FiCpu className="w-8 h-8 text-primary-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Kinh nghiệm build PC</h1>
                    </div>
                    <p className="text-gray-600">
                        Hướng dẫn chi tiết về các linh kiện và cách lắp ráp PC gaming, workstation
                    </p>
                </div>

                {/* Components Guide */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Các linh kiện cần thiết</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {components.map((component, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{component.name}</h3>
                                <p className="text-gray-600 mb-4">{component.description}</p>
                                <ul className="space-y-2">
                                    {component.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="flex items-start gap-2 text-gray-700">
                                            <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Build Steps */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quy trình lắp ráp</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {buildSteps.map((step) => (
                            <div key={step.step} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                                        {step.step}
                                    </span>
                                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                                </div>
                                <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                        Lưu ý quan trọng
                    </h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>• Luôn tắt nguồn và rút dây điện trước khi lắp ráp</li>
                        <li>• Sử dụng vòng tay chống tĩnh điện để bảo vệ linh kiện</li>
                        <li>• Kiểm tra tương thích giữa các linh kiện trước khi mua</li>
                        <li>• Test từng linh kiện trước khi lắp vào case</li>
                        <li>• Đọc kỹ hướng dẫn của từng linh kiện</li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <a
                        href="/products?category=Linh kiện máy tính"
                        className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                        Xem linh kiện PC
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BuildPCGuide;

