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
  FiDollarSign,
  FiUsers,
  FiRefreshCw,
  FiCreditCard,
  FiShield,
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

const heroSlides = [
  {
    id: 1,
    title: 'Laptop gaming hiệu năng cao',
    subtitle: 'FPS mượt, tản nhiệt tốt, giá cực tốt cho game thủ.',
    cta: 'Xem laptop gaming',
    to: '/products?category=Laptop',
    badge: 'Gaming Sale',
  },
  {
    id: 2,
    title: 'PC đồ họa & làm việc',
    subtitle: 'Render nhanh, đa nhiệm mượt, phù hợp designer & editor.',
    cta: 'Xem PC cấu hình cao',
    to: '/products?category=PC',
    badge: 'Workstation',
  },
  {
    id: 3,
    title: 'Phụ kiện công nghệ chính hãng',
    subtitle: 'Chuột, bàn phím, tai nghe, màn hình... đồng bộ hệ sinh thái.',
    cta: 'Xem phụ kiện',
    to: '/products?category=Phụ kiện',
    badge: 'Accessory Week',
  },
];


const Home = () => {
  const { addItem, setLoading: setCartLoading } = useCartStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [promotions, setPromotions] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [components, setComponents] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch all products for promotions (filter by discount > 0)
      const allProductsRes = await productService.getProducts({ limit: 50, status: 'active' });
      const allProducts = allProductsRes?.data?.products || [];
      const promotionProducts = allProducts
        .filter((p: Product) => p.discount > 0)
        .slice(0, 10);

      // Fetch best sellers (10 products)
      const bestSellersRes = await productService.getBestSellers(10);

      // Fetch accessories: Chuột, Loa máy tính, Màn hình, Tai nghe, Bàn phím, Pad chuột
      const accessoryCategories = ['Chuột', 'Loa máy tính', 'Màn hình', 'Tai nghe', 'Bàn phím', 'Pad chuột'];
      const accessoryPromises = accessoryCategories.map(cat =>
        productService.getProducts({ category: cat, limit: 3, status: 'active' })
      );
      const accessoryResults = await Promise.all(accessoryPromises);
      const accessoryProducts = accessoryResults
        .flatMap(res => res?.data?.products || [])
        .slice(0, 10);

      // Fetch components: Linh kiện máy tính
      const componentsRes = await productService.getProducts({
        category: 'Linh kiện máy tính',
        limit: 10,
        status: 'active'
      });

      setPromotions(promotionProducts);
      setBestSellers(bestSellersRes?.data?.products || []);
      setAccessories(accessoryProducts);
      setComponents(componentsRes?.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set empty arrays on error to prevent undefined map errors
      setPromotions([]);
      setBestSellers([]);
      setAccessories([]);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setCartLoading(true);
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: 1,
      });

      addItem(response.data.items[response.data.items.length - 1]);
      setCartLoading(false);

      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } catch (error: any) {
      setCartLoading(false);
      toast.error(error.message || 'Lỗi khi thêm vào giỏ hàng');
    }
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <div className="bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-0 py-6 lg:py-8">
        {/* Top section: Categories, Hero slider, and Image cards */}
        <div className="mb-6">
          {/* Top row: Categories, Slider, Right cards */}
          <div className="flex gap-4 lg:gap-6 mb-4">
            {/* Left sidebar categories */}
            <aside className="hidden lg:block w-52 xl:w-60">
              {/* Fixed height container - A4 landscape height */}
              <div className="h-[450px] rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-full overflow-y-auto no-scrollbar">
                  <div className="space-y-4 p-3">
                    {/* Title */}
                    <div className="px-4 pb-0">
                      <h2 className="text-xl font-bold text-gray-900">Danh mục</h2>
                    </div>
                    {/* Group 1: sản phẩm */}
                    <div className="rounded-xl bg-white mt-2">
                      <nav className="px-3 py-0 space-y-1 text-[15px]">
                        <Link
                          to="/products?category=PC Gaming"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiCpu className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">PC Gaming</span>
                        </Link>
                        <Link
                          to="/products?category=PC Văn phòng"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiCpu className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">PC Văn phòng</span>
                        </Link>
                        <Link
                          to="/products?category=PC Workstation"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiCpu className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">PC Workstation</span>
                        </Link>
                        <Link
                          to="/products?category=PC MINI"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiCpu className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">PC MINI</span>
                        </Link>
                        <Link
                          to="/products?category=Laptop gaming"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Laptop gaming</span>
                        </Link>
                        <Link
                          to="/products?category=Laptop văn phòng"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiTrendingUp className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Laptop văn phòng</span>
                        </Link>
                        <Link
                          to="/products?category=Màn hình"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMonitor className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Màn hình</span>
                        </Link>
                        <Link
                          to="/products?category=Loa máy tính"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiZap className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Loa máy tính</span>
                        </Link>
                        <Link
                          to="/products?category=Giá treo"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMonitor className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Giá treo</span>
                        </Link>
                        <Link
                          to="/products?category=Tai nghe"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Tai nghe</span>
                        </Link>
                        <Link
                          to="/products?category=Chuột"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Chuột</span>
                        </Link>
                        <Link
                          to="/products?category=Bàn phím"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Bàn phím</span>
                        </Link>
                        <Link
                          to="/products?category=Pad chuột"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Pad chuột</span>
                        </Link>
                        <Link
                          to="/products?category=Phụ kiện"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMousePointer className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Phụ kiện</span>
                        </Link>
                        <Link
                          to="/products?category=Linh kiện máy tính"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiHardDrive className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Linh kiện máy tính</span>
                        </Link>
                      </nav>
                    </div>

                    {/* Divider */}
                    <div className="flex justify-center my-0.5">
                      <div className="w-5/6 border-t-2 border-gray-300"></div>
                    </div>

                    {/* Group 2: nội dung / tin tức */}
                    <div className="rounded-xl bg-white">
                      <nav className="px-3 py-0 space-y-1 text-[15px]">
                        <Link
                          to="/news"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiBookOpen className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Tin tức công nghệ</span>
                        </Link>
                        <Link
                          to="/promotions"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiTag className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Khuyến mãi & voucher</span>
                        </Link>
                        <Link
                          to="/guides/laptop"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiBookOpen className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Hướng dẫn chọn laptop</span>
                        </Link>
                        <Link
                          to="/guides/build-pc"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiCpu className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Kinh nghiệm build PC</span>
                        </Link>
                        <Link
                          to="/faq"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-800 transition-colors"
                        >
                          <FiMessageSquare className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">Hỏi đáp & hỗ trợ</span>
                        </Link>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Hero slider - A4 landscape height */}
            <section className="flex-1 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl overflow-hidden shadow-md h-[450px]">
              <div className="h-full px-4 md:px-8 py-6 md:py-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 space-y-3 md:space-y-4">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs md:text-sm font-medium">
                    <FiStar className="mr-1.5 h-4 w-4 text-amber-300" />
                    {activeSlide.badge}
                  </span>
                  <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
                    {activeSlide.title}
                  </h1>
                  <p className="text-sm md:text-base text-primary-50 max-w-xl">
                    {activeSlide.subtitle}
                  </p>
                  <Link
                    to={activeSlide.to}
                    className="inline-flex items-center space-x-2 bg-white text-primary-700 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition shadow-sm"
                  >
                    <span>{activeSlide.cta}</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                  <div className="flex items-center gap-2 pt-1">
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
              </div>
            </section>

            {/* Right side: 3 vertical image cards */}
            <div className="hidden lg:flex flex-col gap-3 w-64 h-[450px]">
              <Link
                to="/products?category=Laptop"
                className="h-[calc(33.333%-0.5rem)] rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold mb-1">Laptop mới</h3>
                  <p className="text-xs text-blue-100">Giảm đến 30%</p>
                </div>
                <div className="mt-2 text-xs text-blue-200">Xem ngay →</div>
              </Link>
              <Link
                to="/products?category=PC Gaming"
                className="h-[calc(33.333%-0.5rem)] rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold mb-1">PC Gaming</h3>
                  <p className="text-xs text-purple-100">Cấu hình cao</p>
                </div>
                <div className="mt-2 text-xs text-purple-200">Xem ngay →</div>
              </Link>
              <Link
                to="/products?category=Phụ kiện"
                className="h-[calc(33.333%-0.5rem)] rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold mb-1">Phụ kiện</h3>
                  <p className="text-xs text-emerald-100">Đa dạng mẫu mã</p>
                </div>
                <div className="mt-2 text-xs text-emerald-200">Xem ngay →</div>
              </Link>
            </div>
          </div>

          {/* Bottom row: 4 horizontal image cards */}
          <div className="hidden lg:grid grid-cols-4 gap-3">
            <Link
              to="/products?search=ram"
              className="h-[139px] rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <h3 className="text-sm font-bold mb-1">RAM DDR5</h3>
              <p className="text-xs text-orange-100">Hiệu năng cao</p>
            </Link>
            <Link
              to="/products?search=ssd"
              className="h-[139px] rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-500 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <h3 className="text-sm font-bold mb-1">SSD NVMe</h3>
              <p className="text-xs text-indigo-100">Tốc độ nhanh</p>
            </Link>
            <Link
              to="/products?search=vga"
              className="h-[139px] rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <h3 className="text-sm font-bold mb-1">Card đồ họa</h3>
              <p className="text-xs text-pink-100">RTX Series</p>
            </Link>
            <Link
              to="/products?search=psu"
              className="h-[139px] rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 text-white p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <h3 className="text-sm font-bold mb-1">Nguồn máy tính</h3>
              <p className="text-xs text-teal-100">80 Plus Gold</p>
            </Link>
          </div>
        </div>

        {/* Products sections - below slider and categories */}
        <div className="space-y-10 lg:space-y-12">
          {/* Sản phẩm khuyến mãi */}
          <section className="py-6 md:py-8 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl border border-amber-200 shadow-md">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiZap className="w-5 h-5 text-amber-500" />
                  <span>Sản phẩm khuyến mãi</span>
                </h2>
                <Link
                  to="/products?sort=discount:desc"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (promotions || []).slice(0, 10).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Sản phẩm bán chạy */}
          <section className="py-6 md:py-8 bg-gradient-to-br from-blue-50 via-primary-50 to-indigo-50 rounded-3xl border border-primary-200 shadow-md">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-600" />
                  <span>Sản phẩm bán chạy</span>
                </h2>
                <Link
                  to="/products?sort=soldCount:desc"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (bestSellers || []).slice(0, 10).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Phụ kiện máy tính */}
          <section className="py-6 md:py-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl border border-emerald-200 shadow-md">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiMousePointer className="w-5 h-5 text-emerald-600" />
                  <span>Phụ kiện máy tính</span>
                </h2>
                <Link
                  to="/products?category=Chuột"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (accessories || []).slice(0, 10).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Linh kiện máy tính */}
          <section className="py-6 md:py-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border border-indigo-200 shadow-md">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiHardDrive className="w-5 h-5 text-indigo-600" />
                  <span>Linh kiện máy tính</span>
                </h2>
                <Link
                  to="/products?category=Linh kiện máy tính"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (components || []).slice(0, 10).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Trải nghiệm mua sắm 5T */}
        <section className="mt-12 md:mt-16 py-8 md:py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50 rounded-3xl border border-primary-200 shadow-lg">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            {/* Header with Logo */}
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary-700">
                  Trải nghiệm mua sắm 5T tại
                </h2>
                <span className="text-2xl md:text-3xl font-extrabold text-primary-600 tracking-tight">
                  TechStore
                </span>
              </div>
            </div>

            {/* 5T Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {/* Tốt hơn về giá */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FiDollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tốt hơn về giá</h3>
                </div>
              </div>

              {/* Thành viên - HSSV */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FiUsers className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thành viên - HSSV</h3>
                  <p className="text-sm text-gray-600 mt-1">Ưu đãi riêng tới 5%</p>
                </div>
              </div>

              {/* Thu cũ đổi mới */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <FiRefreshCw className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thu cũ đổi mới</h3>
                  <p className="text-sm text-gray-600 mt-1">Thu cũ giá cao, trợ giá lên đời</p>
                </div>
              </div>

              {/* Thanh toán - Trả góp */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <FiCreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thanh toán - Trả góp</h3>
                  <p className="text-sm text-gray-600 mt-1">Dễ dàng</p>
                </div>
              </div>

              {/* Trả máy lỗi */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <FiShield className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Trả máy lỗi</h3>
                  <p className="text-sm text-gray-600 mt-1">Đổi máy liền</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

