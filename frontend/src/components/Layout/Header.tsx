import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiSearch } from 'react-icons/fi';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Top ticker bar with shop address */}
      <div className="bg-secondary-900 text-white text-sm">
        <div className="max-w-[1600px] mx-auto overflow-hidden">
          <div className="px-6 py-2 whitespace-nowrap ticker">
            Địa chỉ cửa hàng: 123 Tech Street, Quận 1, TP. Hồ Chí Minh · Hotline: 0909 999 999 ·
            Mở cửa: 8:30 - 21:30 (Thứ 2 - Chủ nhật)
          </div>
        </div>
      </div>

      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-[1600px] w-full mx-auto px-0">
          <div className="flex items-center justify-between h-24 gap-8">
            {/* Logo */}
            <Link to="/" className="text-4xl font-extrabold text-primary-600 tracking-tight">
              TechStore
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-3xl hidden md:flex">
              <form className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm laptop, PC, chuột..."
                    className="w-full pl-6 pr-14 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-1 right-1 flex items-center justify-center w-11 h-11 rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-md transition-colors"
                  >
                    <FiSearch className="w-6 h-6" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right side: user + cart */}
            <div className="flex items-center space-x-6 text-lg">
              {/* User */}
              {isAuthenticated ? (
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
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <FiUser className="w-7 h-7 text-primary-600" />
                      </div>
                    )}
                    <span className="hidden md:block">{user?.firstName}</span>
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Thông tin tài khoản
                      </Link>
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
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-6 py-3 text-gray-700 hover:text-primary-600 transition font-semibold"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-3.5 text-gray-700 hover:text-primary-600 transition"
              >
                <FiShoppingCart className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[11px] rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                  0
                </span>
              </Link>

              {/* Mobile menu button */}
              <button className="md:hidden p-3.5 text-gray-700">
                <FiMenu className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

