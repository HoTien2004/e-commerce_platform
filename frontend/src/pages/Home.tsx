import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiStar,
  FiTrendingUp,
  FiZap,
  FiCpu,
  FiMonitor,
  FiHardDrive,
  FiMousePointer,
  FiTag,
  FiBookOpen,
  FiMessageSquare,
} from 'react-icons/fi';

const heroSlides = [
  {
    id: 1,
    title: 'Laptop gaming hiệu năng cao',
    subtitle: 'FPS mượt, tản nhiệt tốt, giá cực tốt cho game thủ.',
    cta: 'Xem laptop gaming',
    to: '/laptops',
    badge: 'Gaming Sale',
  },
  {
    id: 2,
    title: 'PC đồ họa & làm việc',
    subtitle: 'Render nhanh, đa nhiệm mượt, phù hợp designer & editor.',
    cta: 'Xem PC cấu hình cao',
    to: '/pcs',
    badge: 'Workstation',
  },
  {
    id: 3,
    title: 'Phụ kiện công nghệ chính hãng',
    subtitle: 'Chuột, bàn phím, tai nghe, màn hình... đồng bộ hệ sinh thái.',
    cta: 'Xem phụ kiện',
    to: '/accessories',
    badge: 'Accessory Week',
  },
];

type Product = {
  id: number;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  category: 'laptop' | 'pc' | 'accessory';
};

const bestSellers: Product[] = [
  { id: 1, name: 'Laptop Gaming ASUS ROG Strix G15', price: '29.990.000₫', oldPrice: '33.990.000₫', badge: 'Bán chạy', category: 'laptop' },
  { id: 2, name: 'MacBook Air M2 13"', price: '27.490.000₫', badge: 'Hot', category: 'laptop' },
  { id: 3, name: 'PC Gaming RTX 4060 Ti', price: '24.990.000₫', oldPrice: '26.990.000₫', category: 'pc' },
  { id: 4, name: 'Màn hình LG UltraGear 27"', price: '7.990.000₫', category: 'accessory' },
];

const promotions: Product[] = [
  { id: 5, name: 'Laptop học sinh - sinh viên', price: '11.990.000₫', oldPrice: '13.990.000₫', badge: '-15%', category: 'laptop' },
  { id: 6, name: 'PC văn phòng tiết kiệm', price: '8.490.000₫', badge: 'Combo', category: 'pc' },
  { id: 7, name: 'Bộ phím chuột không dây Logitech', price: '890.000₫', oldPrice: '1.090.000₫', badge: 'Giảm giá', category: 'accessory' },
  { id: 8, name: 'Tai nghe gaming 7.1', price: '1.290.000₫', category: 'accessory' },
];

const accessories: Product[] = [
  { id: 9, name: 'Chuột Logitech G Pro X Superlight', price: '3.290.000₫', badge: 'Best seller', category: 'accessory' },
  { id: 10, name: 'Bàn phím cơ Keychron K2', price: '2.190.000₫', category: 'accessory' },
  { id: 11, name: 'SSD NVMe 1TB Gen4', price: '2.590.000₫', category: 'accessory' },
  { id: 12, name: 'RAM DDR5 16GB 5200MHz', price: '1.890.000₫', category: 'accessory' },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = heroSlides[currentSlide];

  const renderProductCard = (product: Product) => (
    <div
      key={product.id}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      <div className="h-40 md:h-44 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-sm text-primary-600">
          {product.category === 'laptop' && <FiTrendingUp className="w-7 h-7" />}
          {product.category === 'pc' && <FiCpu className="w-7 h-7" />}
          {product.category === 'accessory' && <FiZap className="w-7 h-7" />}
        </div>
      </div>
      <div className="flex-1 p-4 md:p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          {product.badge && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-100">
              {product.badge}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base md:text-lg font-bold text-primary-600">{product.price}</span>
            {product.oldPrice && (
              <span className="text-xs md:text-sm text-gray-400 line-through">{product.oldPrice}</span>
            )}
          </div>
          <button
            type="button"
            className="mt-3 inline-flex items-center justify-center w-full rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-xs md:text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-0 py-6 lg:py-8 flex gap-6 lg:gap-8">
        {/* Left sidebar categories */}
        <aside className="hidden lg:block w-52 xl:w-60 sticky top-24 self-start">
          {/* Scrollable container with fixed rounded corners */}
          <div className="h-[calc(100vh-8rem)] rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-full overflow-y-auto no-scrollbar">
              <div className="space-y-4 p-3">
                {/* Title */}
                <div className="px-4 pb-0">
                  <h2 className="text-xl font-bold text-gray-900">Danh mục</h2>
                </div>
                {/* Group 1: sản phẩm */}
                <div className="rounded-xl bg-white mt-2">
                  <nav className="px-3 py-0 space-y-1 text-sm">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                    >
                      <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Laptop</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                    >
                      <FiCpu className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">PC & máy tính để bàn</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiMonitor className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Màn hình</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Laptop văn phòng</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Laptop gaming</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiHardDrive className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Linh kiện PC</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Chuột</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Bàn phím</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Tai nghe</span>
                    </button>
                  </nav>
                </div>

                {/* Divider */}
                <div className="flex justify-center my-0.5">
                  <div className="w-5/6 border-t-2 border-gray-300"></div>
                </div>

                {/* Group 2: nội dung / tin tức */}
                <div className="rounded-xl bg-white">
                  <nav className="px-3 py-0 space-y-1 text-sm">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                    >
                      <FiBookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Tin tức công nghệ</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiTag className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Khuyến mãi & voucher</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiBookOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Hướng dẫn chọn laptop</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiCpu className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Kinh nghiệm build PC</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Hỏi đáp & hỗ trợ</span>
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 text-gray-800 transition-colors"
                    >
                      <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Hỏi đáp & hỗ trợ</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-10 lg:space-y-12">
          {/* Hero slider */}
          <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl overflow-hidden shadow-md">
            <div className="px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 space-y-4 md:space-y-5">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs md:text-sm font-medium">
                  <FiStar className="mr-1.5 h-4 w-4 text-amber-300" />
                  {activeSlide.badge}
                </span>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  {activeSlide.title}
                </h1>
                <p className="text-sm md:text-lg text-primary-50 max-w-xl">
                  {activeSlide.subtitle}
                </p>
                <Link
                  to={activeSlide.to}
                  className="inline-flex items-center space-x-2 bg-white text-primary-700 px-5 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-semibold hover:bg-gray-100 transition shadow-sm"
                >
                  <span>{activeSlide.cta}</span>
                  <FiArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <div className="flex items-center gap-2 pt-2">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                      aria-label={`Chuyển tới slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1 hidden md:flex items-center justify-center">
                <div className="relative w-full max-w-md h-56 md:h-64 bg-white/5 rounded-3xl border border-white/15 shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-primary-500/20" />
                  <div className="relative p-5 h-full flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-primary-100 uppercase tracking-wide">
                        Gợi ý hôm nay
                      </p>
                      <p className="text-lg font-semibold">
                        Combo máy + phụ kiện giảm đến <span className="text-amber-300">20%</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-[11px]">
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-2">
                        <p className="font-semibold">Laptop</p>
                        <p className="text-primary-50">Từ 11.9 triệu</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-2">
                        <p className="font-semibold">PC Gaming</p>
                        <p className="text-primary-50">RTX series</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-2">
                        <p className="font-semibold">Linh kiện</p>
                        <p className="text-primary-50">SSD, RAM, PSU...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-6 md:py-8 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="px-4 md:px-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Danh mục nổi bật</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <Link
                  to="/laptops"
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-50 to-primary-100 p-5 md:p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-primary-600 mb-1">Laptop</p>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Laptop chính hãng</h3>
                    <p className="text-sm text-secondary-700">
                      Laptop gaming, văn phòng, đồ họa cho mọi nhu cầu.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary-700">Xem tất cả</span>
                    <span className="text-4xl md:text-5xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      💻
                    </span>
                  </div>
                </Link>

                <Link
                  to="/pcs"
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 md:p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 mb-1">PC</p>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">PC cấu hình cao</h3>
                    <p className="text-sm text-secondary-700">
                      PC gaming, đồ họa, văn phòng lắp sẵn, tối ưu hiệu năng.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-700">Xem tất cả</span>
                    <span className="text-4xl md:text-5xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      🖥️
                    </span>
                  </div>
                </Link>

                <Link
                  to="/accessories"
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 md:p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 mb-1">Phụ kiện</p>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Phụ kiện & linh kiện</h3>
                    <p className="text-sm text-secondary-700">
                      Chuột, bàn phím, tai nghe, linh kiện nâng cấp PC.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-700">Xem tất cả</span>
                    <span className="text-4xl md:text-5xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      🖱️
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* Best sellers */}
          <section className="py-6 md:py-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-600" />
                  <span>Sản phẩm bán chạy</span>
                </h2>
                <button
                  type="button"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {bestSellers.map(renderProductCard)}
              </div>
            </div>
          </section>

          {/* Promotions */}
          <section className="py-6 md:py-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiZap className="w-5 h-5 text-amber-500" />
                  <span>Khuyến mãi nổi bật</span>
                </h2>
                <button
                  type="button"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Xem chương trình
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {promotions.map(renderProductCard)}
              </div>
            </div>
          </section>

          {/* Accessories & parts */}
          <section className="py-6 md:py-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiCpu className="w-5 h-5 text-emerald-600" />
                  <span>Phụ kiện & linh kiện</span>
                </h2>
                <button
                  type="button"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Xem phụ kiện
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {accessories.map(renderProductCard)}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;

