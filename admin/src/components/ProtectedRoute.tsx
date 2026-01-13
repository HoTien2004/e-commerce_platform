import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isInitialized, initialize, setAuth, logout } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(!isInitialized);

  useEffect(() => {
    // Initialize auth state on mount
    if (!isInitialized) {
      initialize();
      
      // Verify token by calling profile API
      const token = localStorage.getItem('accessToken');
      if (token) {
        api.get(API_ENDPOINTS.GET_PROFILE)
          .then((response) => {
            if (response.data.success && response.data.data.user) {
              const user = response.data.data.user;
              // Check if user is admin
              if (user.role !== 'admin') {
                logout();
                setIsVerifying(false);
                return;
              }
              // Set auth state
              const refreshToken = localStorage.getItem('refreshToken') || '';
              setAuth(user, token, refreshToken);
            } else {
              logout();
            }
          })
          .catch((error) => {
            // Token invalid or expired, clear auth
            console.error('Token verification failed:', error);
            logout();
          })
          .finally(() => {
            setIsVerifying(false);
          });
      } else {
        setIsVerifying(false);
      }
    }
  }, [isInitialized, initialize, setAuth, logout]);

  // Show loading while verifying
  if (isVerifying || !isInitialized) {
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

