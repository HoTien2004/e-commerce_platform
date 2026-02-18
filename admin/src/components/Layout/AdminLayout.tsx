import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiTag,
  FiMessageSquare,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { resetVerification } from '../ProtectedRoute';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
      resetVerification(); // Reset verification flag
      logout();
      toast.success('Đăng xuất thành công!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      resetVerification(); // Reset verification flag
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: FiHome, label: 'Tổng quan', path: '/' },
    { icon: FiPackage, label: 'Sản phẩm', path: '/products' },
    { icon: FiShoppingBag, label: 'Đơn hàng', path: '/orders' },
    { icon: FiUsers, label: 'Người dùng', path: '/users' },
    { icon: FiMessageSquare, label: 'Đánh giá', path: '/reviews' },
    { icon: FiTag, label: 'Mã khuyến mãi', path: '/promo-codes' },
    { icon: FiSettings, label: 'Cài đặt', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <h1 className="text-xl font-extrabold" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <span style={{ color: '#ef4444' }}>H</span>
              <span style={{ color: '#22c55e' }}>D</span>
              <span style={{ color: '#f97316' }}>Q</span>
              <span style={{ color: '#06b6d4' }}>T</span>
              <span style={{ color: '#1f2937' }}>Shop</span>
              <span className="ml-2 text-primary-600">Admin</span>
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
              </h2>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-primary-600" />
                  </div>
                )}
                {sidebarOpen && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                title="Đăng xuất"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

