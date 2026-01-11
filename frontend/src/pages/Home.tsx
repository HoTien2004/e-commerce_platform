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
        .slice(0, 8);

      // Fetch best sellers (8 products)
      const bestSellersRes = await productService.getBestSellers(8);

      // Fetch accessories: Chuột, Loa máy tính, Màn hình, Tai nghe, Bàn phím, Pad chuột
      const accessoryCategories = ['Chuột', 'Loa máy tính', 'Màn hình', 'Tai nghe', 'Bàn phím', 'Pad chuột'];
      const accessoryPromises = accessoryCategories.map(cat => 
        productService.getProducts({ category: cat, limit: 3, status: 'active' })
      );
      const accessoryResults = await Promise.all(accessoryPromises);
      const accessoryProducts = accessoryResults
        .flatMap(res => res?.data?.products || [])
        .slice(0, 8);

      // Fetch components: Linh kiện máy tính
      const componentsRes = await productService.getProducts({ 
        category: 'Linh kiện máy tính', 
        limit: 8, 
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
                  <nav className="px-3 py-0 space-y-1 text-sm">
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

          {/* Sản phẩm khuyến mãi */}
          <section className="py-6 md:py-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiZap className="w-5 h-5 text-amber-500" />
                  <span>Sản phẩm khuyến mãi</span>
                </h2>
                <Link
                  to="/products?sortBy=discount&sortOrder=desc"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (promotions || []).slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Sản phẩm bán chạy */}
          <section className="py-6 md:py-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-primary-600" />
                  <span>Sản phẩm bán chạy</span>
                </h2>
                <Link
                  to="/products?sortBy=soldCount&sortOrder=desc"
                  className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (bestSellers || []).slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Phụ kiện máy tính */}
          <section className="py-6 md:py-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (accessories || []).slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Linh kiện máy tính */}
          <section className="py-6 md:py-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  (components || []).slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;

