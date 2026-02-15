import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiZap, FiCpu, FiMonitor, FiHardDrive, FiMousePointer, FiTag, FiBookOpen, FiMessageSquare, FiDollarSign, FiUsers, FiRefreshCw, FiCreditCard, FiShield } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import { useCartModalStore } from '../store/cartModalStore';
import { useAuthStore } from '../store/authStore';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';

const Home = () => {
  const { setCart, setLoading: setCartLoading, addItem } = useCartStore();
  const { addModal } = useCartModalStore();
  const { isAuthenticated } = useAuthStore();
  const [promotions, setPromotions] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [components, setComponents] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const allProductsRes = await productService.getProducts({ limit: 50, status: 'active' });
      const allProducts = allProductsRes?.data?.products || [];
      const promotionProducts = allProducts
        .filter((p: Product) => p.discount > 0)
        .slice(0, 10);

      const bestSellersRes = await productService.getBestSellers(10);

      const accessoryCategories = ['Chuột', 'Loa máy tính', 'Màn hình', 'Tai nghe', 'Bàn phím', 'Pad chuột'];
      const accessoryPromises = accessoryCategories.map(cat =>
        productService.getProducts({ category: cat, limit: 3, status: 'active' })
      );
      const accessoryResults = await Promise.all(accessoryPromises);
      const accessoryProducts = accessoryResults
        .flatMap(res => res?.data?.products || [])
        .slice(0, 10);

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

      // If not authenticated, use local cart only
      if (!isAuthenticated) {
        addItem({
          productId: {
            _id: product._id,
            name: product.name,
            images: product.images || [],
          },
          quantity: 1,
          price: product.price,
        });
        toast.success('Đã thêm vào giỏ hàng');
        addModal(product, 1);
        return;
      }

      // If authenticated, sync with backend
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: 1,
      });

      setCart(response.data);
      addModal(product, 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi thêm vào giỏ hàng');
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-0 py-6 lg:py-8">
        {/* Top section: categories sidebar, hero slider, right banners */}
        <div className="mb-6">
          <div className="flex gap-4 lg:gap-6 mb-4">
            {/* Categories sidebar */}
            <aside className="hidden lg:block w-52 xl:w-60">
              <div className="h-[450px] rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-full overflow-y-auto no-scrollbar">
                  <div className="space-y-4 p-3">
                    <div className="px-4 pb-0">
                      <h2 className="text-xl font-bold text-gray-900">Danh mục</h2>
                    </div>
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

                    <div className="flex justify-center my-0.5">
                      <div className="w-5/6 border-t-2 border-gray-300"></div>
                    </div>
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

            {/* Hero slider */}
            <section className="flex-1 rounded-3xl overflow-hidden shadow-md h-[450px]">
              <div className="relative h-full w-full">
                <img
                  src={
                    currentSlide === 0
                      ? 'https://res.cloudinary.com/dxf5tsrif/image/upload/v1770024187/snapedit_1770024152700_asaojk.jpg'
                      : currentSlide === 1
                        ? 'https://res.cloudinary.com/dxf5tsrif/image/upload/v1770024547/snapedit_1770024534453_tarmab.jpg'
                        : 'https://res.cloudinary.com/dxf5tsrif/image/upload/v1770024548/snapedit_1770024520650_zciqxo.jpg'
                  }
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-center pb-4">
                  <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Right vertical banners */}
            <div className="hidden lg:flex flex-col gap-3 w-64 h-[450px]">
              <Link
                to="/products?category=Laptop gaming"
                className="relative h-[calc(33.333%-0.5rem)] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1770021053/macbook-giao-xa-2026_aej6mb.webp"
                  alt="Laptop"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>

              <Link
                to="/products?category=PC Gaming"
                className="relative h-[calc(33.333%-0.5rem)] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1769505949/ttgshop-banner-under-slider-top-27122025-3_nkswqk.png"
                  alt="PC"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>

              <Link
                to="/products?category="
                className="relative h-[calc(33.333%-0.5rem)] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1770021339/ttgshop-banner-under-slider-top-27122025-2_nx7tlu.png"
                  alt="Bàn phím"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>
            </div>
          </div>

          {/* Bottom horizontal banners */}
          <div className="hidden lg:grid grid-cols-4 gap-3">
            <Link
              to=""
              className="relative h-[139px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              <img
                src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1770023253/f211d09ae538f0998ee3f33314aaa8b7_n4uzoe.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link
              to=""
              className="relative h-[139px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              <img
                src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1770024330/huawei-mate-x7-home-0225_iyzqrf.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link
              to=""
              className="relative h-[139px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              <img
                src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1770023571/RightBanner_Apple-Watch_01.2026_lq1cyc.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <Link
              to=""
              className="relative h-[139px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              <img
                src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1770023571/galaxy-a17-5g-0126-RIGHT_uqddzu.webp"
                alt=""
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        </div>

        {/* Product sections */}
        <div className="space-y-10 lg:space-y-12">
          {/* Promotions section */}
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

          {/* Best sellers section */}
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

          {/* Accessories section */}
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

          {/* Components section */}
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

        {/* 5T experience section */}
        <section className="mt-12 md:mt-16 py-8 md:py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50 rounded-3xl border border-primary-200 shadow-lg">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FiDollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tốt hơn về giá</h3>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FiUsers className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thành viên - HSSV</h3>
                  <p className="text-sm text-gray-600 mt-1">Ưu đãi riêng tới 5%</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <FiRefreshCw className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thu cũ đổi mới</h3>
                  <p className="text-sm text-gray-600 mt-1">Thu cũ giá cao, trợ giá lên đời</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <FiCreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thanh toán - Trả góp</h3>
                  <p className="text-sm text-gray-600 mt-1">Dễ dàng</p>
                </div>
              </div>

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

