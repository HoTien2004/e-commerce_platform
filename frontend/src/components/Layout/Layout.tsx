import type { ReactNode } from 'react';
import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import AuthModal from '../Modal/AuthModal';
import CartSuccessModalStack from '../CartSuccessModalStack';
import { useModalStore } from '../../store/modalStore';
import { FiX, FiMaximize2, FiMinimize2, FiSend } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
        <div
          className={`fixed right-6 bottom-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right ${
            isChatExpanded
              ? 'w-[min(90vw,560px)] h-[min(75vh,640px)]'
              : 'w-[340px] h-[455px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                HD
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">HDQTShop</span>
                <span className="text-xs text-primary-100">Chat với chúng tôi</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-1 rounded-full hover:bg-primary-500 transition-colors"
                aria-label={isChatExpanded ? 'Thu nhỏ cửa sổ chat' : 'Phóng to cửa sổ chat'}
                onClick={() => setIsChatExpanded((v) => !v)}
              >
                {isChatExpanded ? (
                  <FiMinimize2 className="w-4 h-4" />
                ) : (
                  <FiMaximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-primary-500 transition-colors"
                aria-label="Đóng cửa sổ chat"
                onClick={() => {
                  setIsChatOpen(false);
                  setIsChatExpanded(false);
                }}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 bg-gray-50 px-3 py-3 overflow-y-auto space-y-3 text-sm">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm border border-gray-200">
                <p className="text-gray-800">
                  Xin chào! HDQTShop có thể hỗ trợ gì cho bạn hôm nay?
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-amber-50 px-3 py-2 shadow-sm border border-amber-200">
                <p className="text-amber-800 text-xs font-medium">
                  Tính năng đang phát triển. Vui lòng liên hệ Zalo để được hỗ trợ.
                </p>
              </div>
            </div>
          </div>

          {/* Input area - disabled */}
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Tính năng đang phát triển"
              disabled
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
            />
            <button
              type="button"
              disabled
              className="w-9 h-9 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center cursor-not-allowed"
              aria-label="Gửi tin nhắn"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default Layout;

