import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import AuthModal from '../Modal/AuthModal';
import CartSuccessModalStack from '../CartSuccessModalStack';
import { useModalStore } from '../../store/modalStore';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useModalStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster position="top-right" />
      <CartSuccessModalStack />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default Layout;

