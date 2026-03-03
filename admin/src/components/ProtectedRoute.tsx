import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isInitialized, initialize, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Khởi tạo state từ localStorage/persist một lần
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Hiển thị loading trong lúc khởi tạo từ storage
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-4">Bạn không phải là quản trị viên</p>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

