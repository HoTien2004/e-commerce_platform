import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ChatLayout from './components/Layout/ChatLayout';
import Home from './pages/Home';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Store from './pages/Store';
import Help from './pages/Help';
import Warranty from './pages/Warranty';
import Shipping from './pages/Shipping';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import VnpayResult from './pages/VnpayResult';
import News from './pages/News';
import Promotions from './pages/Promotions';
import LaptopGuide from './pages/LaptopGuide';
import BuildPCGuide from './pages/BuildPCGuide';
import FAQ from './pages/FAQ';
import { useAuthStore } from './store/authStore';
import { useModalStore } from './store/modalStore';

// Scroll to top on route change (and disable browser scroll restoration)
const ScrollToTop = () => {
  const location = useLocation();

  // Disable browser's automatic scroll restoration so our logic always applies
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để truy cập trang này</p>
          <button
            onClick={() => openAuthModal('login')}
            className="btn-primary"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ChatLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/news" element={<News />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/guides/laptop" element={<LaptopGuide />} />
          <Route path="/guides/build-pc" element={<BuildPCGuide />} />
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/vnpay/result"
            element={
              <ProtectedRoute>
                <VnpayResult />
              </ProtectedRoute>
            }
          />
          <Route path="/store" element={<Store />} />
          <Route path="/help" element={<Help />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderNumber"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ChatLayout>
    </BrowserRouter>
  );
}

export default App;
