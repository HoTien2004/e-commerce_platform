import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiSearch, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openAuthModal } = useModalStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // Close dropdown when authentication state changes (e.g., after login)
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [isAuthenticated]);

  const handleGoTo = (path: string) => {
    navigate(path);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    navigate('/');
    logout();
    toast.success('Đăng xuất thành công!');
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
            <Link to="/" className="text-2xl md:text-3xl font-extrabold text-primary-600 tracking-tight">
              TechStore
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl hidden md:flex">
              <form className="w-full">
                <div className="relative flex items-center">
                  <input
                    type="text"
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
                  <div className="relative">
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
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 translate-x-2">
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
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  0
                </span>
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

