import { ReactNode, useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Global flags to ensure verification only happens once per session
let hasVerifiedGlobally = false;
let isVerifyingGlobally = false;

// Reset verification flag (call when logout)
export const resetVerification = () => {
  hasVerifiedGlobally = false;
  isVerifyingGlobally = false;
  (window as any).__hasVerifiedGlobally = false;
};

// Mark as verified (call after successful login)
export const markAsVerified = () => {
  hasVerifiedGlobally = true;
  isVerifyingGlobally = false;
  (window as any).__hasVerifiedGlobally = true;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isInitialized, initialize, setAuth, logout } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(!isInitialized);
  const verificationStarted = useRef(false);

  useEffect(() => {
    // Initialize store first
    if (!isInitialized) {
      initialize();
      return; // Wait for initialization to complete
    }

    // Check if already verified via window object (set after login)
    if ((window as any).__hasVerifiedGlobally) {
      hasVerifiedGlobally = true;
      isVerifyingGlobally = false;
      setIsVerifying(false);
      return;
    }

    // If already authenticated and verified, skip verification
    // This prevents unnecessary verification on every render
    if (isAuthenticated && isAdmin && hasVerifiedGlobally) {
      setIsVerifying(false);
      return;
    }

    // If already authenticated from persisted state, verify in background without blocking
    // This allows user to stay logged in while verification happens
    if (isAuthenticated && isAdmin && !hasVerifiedGlobally && !isVerifyingGlobally) {
      // Verify in background without showing loading
      isVerifyingGlobally = true;
      verificationStarted.current = true;

      const token = localStorage.getItem('accessToken');
      if (token) {
        // Verify silently in background
        api.get(API_ENDPOINTS.GET_PROFILE)
          .then((response) => {
            if (response.data.success && response.data.data.user) {
              const user = response.data.data.user;
              if (user.role !== 'admin') {
                // Only logout if role changed
                logout();
                hasVerifiedGlobally = true;
                isVerifyingGlobally = false;
                (window as any).__hasVerifiedGlobally = false;
                return;
              }
              // Update user info if changed
              const refreshToken = localStorage.getItem('refreshToken') || '';
              setAuth(user, token, refreshToken);
              hasVerifiedGlobally = true;
              isVerifyingGlobally = false;
              (window as any).__hasVerifiedGlobally = true;
            }
          })
          .catch((error) => {
            // Only logout on real auth errors
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.error('Token verification failed (auth error):', error);
              logout();
              hasVerifiedGlobally = true;
              isVerifyingGlobally = false;
              (window as any).__hasVerifiedGlobally = false;
            } else {
              // Network error - keep current state
              console.warn('Token verification error (non-auth, keeping state):', error);
              hasVerifiedGlobally = true;
              isVerifyingGlobally = false;
              // Keep authenticated state
              (window as any).__hasVerifiedGlobally = true;
            }
          });
      } else {
        hasVerifiedGlobally = true;
        isVerifyingGlobally = false;
      }
      return; // Don't show loading, user can continue using app
    }

    // Verify token when not authenticated (first load or after logout)
    if (!hasVerifiedGlobally && !isVerifyingGlobally) {
      isVerifyingGlobally = true;
      verificationStarted.current = true;

      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsVerifying(true);
        api.get(API_ENDPOINTS.GET_PROFILE)
          .then((response) => {
            if (response.data.success && response.data.data.user) {
              const user = response.data.data.user;
              if (user.role !== 'admin') {
                logout();
                setIsVerifying(false);
                hasVerifiedGlobally = true;
                isVerifyingGlobally = false;
                (window as any).__hasVerifiedGlobally = false;
                return;
              }
              const refreshToken = localStorage.getItem('refreshToken') || '';
              setAuth(user, token, refreshToken);
              hasVerifiedGlobally = true;
              isVerifyingGlobally = false;
              (window as any).__hasVerifiedGlobally = true;
            } else {
              logout();
              hasVerifiedGlobally = true;
              isVerifyingGlobally = false;
              (window as any).__hasVerifiedGlobally = false;
            }
          })
          .catch((error) => {
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.error('Token verification failed (auth error):', error);
              logout();
              hasVerifiedGlobally = true;
              isVerifyingGlobally = false;
              (window as any).__hasVerifiedGlobally = false;
            } else {
              // Network error - if we have persisted state, keep it
              console.warn('Token verification error (non-auth):', error);
              const storedUser = useAuthStore.getState().user;
              if (storedUser && storedUser.role === 'admin') {
                // Keep persisted state if available
                hasVerifiedGlobally = true;
                isVerifyingGlobally = false;
                (window as any).__hasVerifiedGlobally = true;
              } else {
                // No valid state, logout
                logout();
                hasVerifiedGlobally = true;
                isVerifyingGlobally = false;
                (window as any).__hasVerifiedGlobally = false;
              }
            }
          })
          .finally(() => {
            setIsVerifying(false);
          });
      } else {
        setIsVerifying(false);
        hasVerifiedGlobally = true;
        isVerifyingGlobally = false;
        (window as any).__hasVerifiedGlobally = false;
      }
    } else if (hasVerifiedGlobally && isInitialized) {
      setIsVerifying(false);
    } else if (isVerifyingGlobally) {
      setIsVerifying(true);
    }
  }, [isInitialized, isAuthenticated, isAdmin, initialize, setAuth, logout]);

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

