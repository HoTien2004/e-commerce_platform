import { FiTag, FiGift, FiPercent } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Promotions = () => {
  // Mock promotions data
  const promotions = [
    {
      id: 1,
      title: 'Giảm giá lên đến 30% cho laptop gaming',
      description: 'Áp dụng cho tất cả laptop gaming ASUS, MSI, Acer. Giảm giá trực tiếp tại cửa hàng.',
      discount: '30%',
      validUntil: '31/01/2024',
      code: 'GAMING30',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    },
    {
      id: 2,
      title: 'Combo PC + Màn hình giảm 15%',
      description: 'Mua PC gaming kèm màn hình được giảm thêm 15%. Áp dụng cho tất cả sản phẩm trong combo.',
      discount: '15%',
      validUntil: '28/01/2024',
      code: 'COMBO15',
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800',
    },
    {
      id: 3,
      title: 'Voucher 500.000₫ cho đơn hàng từ 10 triệu',
      description: 'Nhập mã voucher để được giảm 500.000₫ cho đơn hàng từ 10.000.000₫ trở lên.',
      discount: '500K',
      validUntil: '25/01/2024',
      code: 'SAVE500K',
      image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800',
    },
    {
      id: 4,
      title: 'Miễn phí vận chuyển toàn quốc',
      description: 'Miễn phí vận chuyển cho tất cả đơn hàng. Áp dụng cho mọi sản phẩm trong cửa hàng.',
      discount: 'Free',
      validUntil: '31/12/2024',
      code: 'FREESHIP',
      image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiTag className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Khuyến mãi & Voucher</h1>
          </div>
          <p className="text-gray-600">
            Các chương trình khuyến mãi và voucher đang diễn ra tại HDQTShop
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <div className="aspect-video bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                    -{promo.discount}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{promo.title}</h2>
                <p className="text-gray-600 mb-4">{promo.description}</p>
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Mã khuyến mãi</p>
                    <p className="text-lg font-bold text-primary-600">{promo.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Có hiệu lực đến</p>
                    <p className="text-sm font-semibold text-gray-900">{promo.validUntil}</p>
                  </div>
                </div>
                <Link
                  to="/products"
                  className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Áp dụng ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Promotions;

