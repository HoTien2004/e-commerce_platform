import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useModalStore } from '../../store/modalStore';
import { productService } from '../../services/productService';
import { scrollToTop } from '../../utils/scrollToTop';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiSearch, FiMapPin } from 'react-icons/fi';
import type { Product } from '../../types/product';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { openAuthModal } = useModalStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isUserMenuClosing, setIsUserMenuClosing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when authentication state changes (e.g., after login)
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [isAuthenticated]);

  // Close dropdown when route changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Helper function to close user menu with fade out effect
  const closeUserMenuWithFade = () => {
    if (isUserMenuOpen) {
      setIsUserMenuClosing(true);
      setTimeout(() => {
        setIsUserMenuOpen(false);
        setIsUserMenuClosing(false);
      }, 200);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        closeUserMenuWithFade();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close user menu when scrolling with smooth fade out
  useEffect(() => {
    const handleScroll = () => {
      closeUserMenuWithFade();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isUserMenuOpen]);

  // Fetch suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoadingSuggestions(true);
        try {
          const response = await productService.getProducts({
            search: searchQuery.trim(),
            limit: 5,
            status: 'active',
          });
          setSuggestions(response.data?.products || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleGoTo = (path: string) => {
    navigate(path);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    navigate('/');
    logout();
    toast.success('Đăng xuất thành công!');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/products/${product.slug}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleLogoClick = () => {
    scrollToTop();
  };

  return (
    <>
      {/* Top ticker bar with shop address */}
      <div className="bg-secondary-900 text-white text-sm">
        <div className="max-w-[1200px] mx-auto overflow-hidden">
          <div className="px-6 py-2 whitespace-nowrap ticker">
            Địa chỉ cửa hàng: 123 Tech Street, Quận 1, TP. Hồ Chí Minh · 456 CMT8, Quận 7, TP. Hồ Chí Minh · Hotline: 0909 999 999 ·
            Mở cửa: 8:30 - 21:30 (Thứ 2 - Chủ nhật)
          </div>
        </div>
      </div>

      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-[1200px] w-full mx-auto px-0">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Logo */}
            <Link 
              to="/" 
              onClick={handleLogoClick}
              className="text-2xl md:text-3xl font-extrabold text-primary-600 tracking-tight"
            >
              TechStore
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl hidden md:flex" ref={searchRef}>
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Tìm kiếm laptop, PC, chuột..."
                    className="w-full pl-4 pr-32 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium"
                  />
                  <button
                    type="submit"
                    className="absolute right-[1.25px] top-[1px] bottom-[1px] flex items-center rounded-r-full hover:bg-primary-100 transition-colors group"
                  >
                    <div className="w-px h-7 bg-gray-300 group-hover:bg-primary-300 transition-colors" />
                    <div className="flex items-center gap-1.5 px-4 py-2 -mt-0.5">
                      <FiSearch className="w-4 h-4 text-primary-600 group-hover:text-primary-700 transition-colors" />
                      <span className="text-primary-600 group-hover:text-primary-700 text-sm font-medium transition-colors">Tìm kiếm</span>
                    </div>
                  </button>

                  {/* Suggestions dropdown */}
                  {showSuggestions && searchQuery.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[400px] overflow-y-auto">
                      {isLoadingSuggestions ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Đang tìm kiếm...</div>
                      ) : suggestions.length > 0 ? (
                        <div className="py-2">
                          {suggestions.map((product) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => handleSuggestionClick(product)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                            >
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <FiSearch className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate">{product.category}</p>
                              </div>
                              <div className="text-sm font-semibold text-primary-600">
                                {product.price.toLocaleString('vi-VN')}₫
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right side: user + cart */}
            <div className="flex items-center space-x-6 text-base">
              {/* User / account */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3 text-sm">
                  <Link
                    to="/store"
                    className="hidden md:inline-flex items-center space-x-2 px-2 py-1 text-gray-700 hover:text-primary-600 transition font-medium"
                  >
                    <FiMapPin className="w-4 h-4" />
                    <span>Cửa hàng</span>
                  </Link>
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition font-semibold"
                      onClick={() => setIsUserMenuOpen((prev: boolean) => !prev)}
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-primary-600" />
                        </div>
                      )}
                      <span className="hidden md:block">{user?.firstName}</span>
                    </button>

                    {/* Dropdown */}
                    {(isUserMenuOpen || isUserMenuClosing) && (
                      <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 translate-x-2 transition-all duration-200 ${isUserMenuClosing ? 'opacity-0 transform translate-y-[-10px]' : 'opacity-100 transform translate-y-0'}`}>
                        <button
                          type="button"
                          onClick={() => handleGoTo('/profile')}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Thông tin tài khoản
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGoTo('/orders')}
                          className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Tất cả đơn hàng
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-sm">
                  <Link
                    to="/store"
                    className="hidden md:inline-flex items-center space-x-2 px-2 py-1 text-gray-700 hover:text-primary-600 transition font-medium"
                  >
                    <FiMapPin className="w-4 h-4" />
                    <span>Cửa hàng</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center space-x-2 px-2 py-1 text-gray-700 hover:text-primary-600 transition font-medium"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Tài khoản</span>
                  </button>
                </div>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-gray-700 hover:text-primary-600 transition"
              >
                <FiShoppingCart className="w-6 h-6" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] rounded-full min-w-[20px] h-5 flex items-center justify-center font-semibold px-1">
                    {items.length > 99 ? '99+' : items.length}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button className="md:hidden p-2.5 text-gray-700">
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

