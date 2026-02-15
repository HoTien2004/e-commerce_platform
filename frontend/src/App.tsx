import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout/Layout';
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

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();

  if (!isAuthenticated) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/products" element={<Layout><ProductList /></Layout>} />
        <Route path="/products/:slug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/promotions" element={<Layout><Promotions /></Layout>} />
        <Route path="/guides/laptop" element={<Layout><LaptopGuide /></Layout>} />
        <Route path="/guides/build-pc" element={<Layout><BuildPCGuide /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Layout>
                <Checkout />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute>
              <Layout>
                <CheckoutSuccess />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/vnpay/result"
          element={
            <ProtectedRoute>
              <Layout>
                <VnpayResult />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/store" element={<Layout><Store /></Layout>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/warranty" element={<Layout><Warranty /></Layout>} />
        <Route path="/shipping" element={<Layout><Shipping /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderNumber"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
