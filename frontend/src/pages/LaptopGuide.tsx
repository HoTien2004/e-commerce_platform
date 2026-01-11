import { FiBookOpen, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const LaptopGuide = () => {
  const sections = [
    {
      title: 'Xác định nhu cầu sử dụng',
      content: [
        'Laptop văn phòng: Xử lý văn bản, email, duyệt web, video call',
        'Laptop gaming: Chơi game, stream, render video',
        'Laptop đồ họa: Thiết kế, chỉnh sửa ảnh/video, 3D modeling',
        'Laptop học tập: Làm bài tập, nghiên cứu, học online',
      ],
    },
    {
      title: 'Chọn cấu hình phù hợp',
      content: [
        'CPU: Intel Core i5/i7 hoặc AMD Ryzen 5/7 cho đa số nhu cầu',
        'RAM: Tối thiểu 8GB, khuyến nghị 16GB cho gaming/đồ họa',
        'Ổ cứng: SSD 256GB trở lên, ưu tiên NVMe SSD',
        'Card đồ họa: Integrated cho văn phòng, RTX series cho gaming',
      ],
    },
    {
      title: 'Kích thước màn hình',
      content: [
        '13-14 inch: Nhẹ, dễ mang theo, phù hợp công việc di động',
        '15-16 inch: Cân bằng giữa di động và trải nghiệm',
        '17 inch trở lên: Tối ưu cho gaming và đồ họa',
      ],
    },
    {
      title: 'Thời lượng pin',
      content: [
        'Laptop văn phòng: 8-10 giờ sử dụng thực tế',
        'Laptop gaming: 3-5 giờ (thường cắm sạc khi chơi game)',
        'Lưu ý: Thời lượng pin phụ thuộc vào cách sử dụng',
      ],
    },
    {
      title: 'Ngân sách',
      content: [
        'Dưới 15 triệu: Laptop văn phòng, học tập cơ bản',
        '15-25 triệu: Laptop văn phòng cao cấp, gaming entry-level',
        '25-40 triệu: Laptop gaming, đồ họa chuyên nghiệp',
        'Trên 40 triệu: Laptop flagship, workstation',
      ],
    },
  ];

  const tips = [
    'Kiểm tra kết nối: USB-C, HDMI, card reader theo nhu cầu',
    'Bàn phím: Test cảm giác gõ, đặc biệt quan trọng với laptop văn phòng',
    'Tản nhiệt: Laptop gaming cần hệ thống tản nhiệt tốt',
    'Bảo hành: Chọn sản phẩm có bảo hành chính hãng',
    'Đánh giá: Đọc review từ người dùng thực tế',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiBookOpen className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Hướng dẫn chọn laptop</h1>
          </div>
          <p className="text-gray-600">
            Hướng dẫn chi tiết giúp bạn chọn được laptop phù hợp với nhu cầu và ngân sách
          </p>
        </div>

        {/* Guide Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-gray-700">
                    <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiAlertCircle className="w-6 h-6 text-blue-600" />
            Lưu ý quan trọng
          </h2>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="/products?category=Laptop"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Xem danh sách laptop
          </a>
        </div>
      </div>
    </div>
  );
};

export default LaptopGuide;

