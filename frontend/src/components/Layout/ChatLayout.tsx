import type { ReactNode } from 'react';
import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import AuthModal from '../Modal/AuthModal';
import CartSuccessModalStack from '../CartSuccessModalStack';
import { useModalStore } from '../../store/modalStore';
import ChatPanel from '../ChatPanel';

interface ChatLayoutProps {
  children: ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useModalStore();
  const [showChatHint, setShowChatHint] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster position="top-right" />
      <CartSuccessModalStack />
      {/* Floating action buttons (bottom-right) */}
      {!isChatOpen && (
        <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-5">
          {/* Chatbot button + tooltip */}
          <div className="relative flex items-end justify-end">
            {showChatHint && (
              <div className="absolute bottom-full right-20 -mb-10 bg-white shadow-lg border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setShowChatHint(false)}
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs"
                  aria-label="Ẩn gợi ý chat"
                >
                  ×
                </button>
                <span className="block text-left">
                  Bạn cần hỗ trợ gì?
                </span>
              </div>
            )}
            <button
              type="button"
              className="w-16 h-16 rounded-full bg-primary-600 shadow-xl hover:bg-primary-700 transition-colors flex items-center justify-center"
              onClick={() => {
                setIsChatOpen(true);
                setShowChatHint(false);
              }}
              aria-label="Chatbot hỗ trợ"
            >
              <img
                src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1772269843/10061872_t2yxyz.png"
                alt="Chatbot"
                className="w-12 h-12 object-contain"
              />
            </button>
          </div>

          {/* Zalo button - open Zalo chat page */}
          <a
            href="http://zaloapp.com/qr/p/xzb8bp2cfbqz"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-full bg-white text-[#1DA1F2] shadow-xl hover:bg-blue-50 transition-colors border border-blue-100 overflow-hidden flex items-center justify-center"
            aria-label="Chat Zalo"
          >
            <img
              src="https://res.cloudinary.com/dxf5tsrif/image/upload/v1772267579/Icon_of_Zalo.svg_chwraq.webp"
              alt="Zalo"
              className="w-full h-full object-contain"
            />
          </a>

        </div>
      )}
      {/* Chatbot chat window */}
      {isChatOpen && (
        <ChatPanel
          isExpanded={isChatExpanded}
          onToggleExpand={() => setIsChatExpanded((v) => !v)}
          onClose={() => {
            setIsChatOpen(false);
            setIsChatExpanded(false);
          }}
        />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default ChatLayout;

