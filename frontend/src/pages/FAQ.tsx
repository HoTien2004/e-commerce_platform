import { useState } from 'react';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiHelpCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Làm thế nào để đặt hàng?',
      answer: 'Bạn có thể đặt hàng trực tuyến bằng cách thêm sản phẩm vào giỏ hàng, sau đó tiến hành thanh toán. Hoặc bạn có thể đến trực tiếp cửa hàng để mua hàng.',
    },
    {
      question: 'Phương thức thanh toán nào được chấp nhận?',
      answer: 'Chúng tôi chấp nhận thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và ví điện tử MoMo.',
    },
    {
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thời gian giao hàng từ 1-3 ngày làm việc tùy theo khu vực. Đơn hàng trên 5 triệu được miễn phí vận chuyển.',
    },
    {
      question: 'Có được đổi trả sản phẩm không?',
      answer: 'Có, bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn, chưa sử dụng và còn đầy đủ phụ kiện.',
    },
    {
      question: 'Chính sách bảo hành như thế nào?',
      answer: 'Tất cả sản phẩm đều có bảo hành chính hãng. Thời gian bảo hành tùy theo từng sản phẩm, thường từ 12-36 tháng. Bạn có thể xem chi tiết tại trang Bảo hành & đổi trả.',
    },
    {
      question: 'Làm sao để kiểm tra tình trạng đơn hàng?',
      answer: 'Bạn có thể đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi" để xem chi tiết và theo dõi tình trạng đơn hàng.',
    },
    {
      question: 'Có hỗ trợ lắp ráp PC không?',
      answer: 'Có, chúng tôi cung cấp dịch vụ lắp ráp PC miễn phí khi mua linh kiện tại cửa hàng. Bạn có thể liên hệ để được tư vấn cấu hình phù hợp.',
    },
    {
      question: 'Làm thế nào để liên hệ hỗ trợ?',
      answer: 'Bạn có thể liên hệ qua hotline 0909 999 999, email support@hdqtshop.com, hoặc đến trực tiếp cửa hàng. Thời gian hỗ trợ: 8:30 - 21:30 (Thứ 2 - Chủ nhật).',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiMessageSquare className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Hỏi đáp & Hỗ trợ</h1>
          </div>
          <p className="text-gray-600">
            Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với chúng tôi để được hỗ trợ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Câu hỏi thường gặp</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                      {openIndex === index ? (
                        <FiChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === index && (
                      <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiHelpCircle className="w-6 h-6 text-primary-600" />
                Cần hỗ trợ thêm?
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Hotline</p>
                  <a
                    href="tel:0909999999"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    0909 999 999
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                  <a
                    href="mailto:support@hdqtshop.com"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    support@hdqtshop.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Thời gian</p>
                  <p className="text-gray-600">8:30 - 21:30</p>
                  <p className="text-gray-600">Thứ 2 - Chủ nhật</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/help"
                    className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    Trung tâm hỗ trợ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

