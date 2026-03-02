import { useState, useEffect, useRef } from 'react';
import { FiX, FiMaximize2, FiMinimize2, FiSend, FiPlus, FiTrash2, FiMessageCircle } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useModalStore } from '../store/modalStore';
import { chatService, type ChatMessage, type ConversationSummary } from '../services/chatService';
import toast from 'react-hot-toast';

interface ChatPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

const ChatPanel = ({ isExpanded, onToggleExpand, onClose }: ChatPanelProps) => {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentId(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentId && isAuthenticated) {
      loadConversation(currentId);
    } else {
      setMessages([]);
    }
  }, [currentId, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoadingList(true);
      const res = await chatService.getConversations();
      if (res.success && res.data) {
        setConversations(res.data.conversations);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không tải được danh sách hội thoại');
    } finally {
      setLoadingList(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const res = await chatService.getConversation(id);
      if (res.success && res.data) {
        setMessages(res.data.conversation.messages);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không tải được hội thoại');
    }
  };

  const handleNewConversation = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await chatService.createConversation();
      if (res.success && res.data) {
        setConversations((prev) => [
          { _id: res.data!.conversation._id, title: res.data!.conversation.title, updatedAt: res.data!.conversation.updatedAt },
          ...prev,
        ]);
        setCurrentId(res.data.conversation._id);
        setMessages([]);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không tạo được hội thoại mới');
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await chatService.deleteConversation(id);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (currentId === id) {
          const next = conversations.find((c) => c._id !== id);
          setCurrentId(next ? next._id : null);
          setMessages(next ? [] : []);
        }
        toast.success('Đã xóa hội thoại');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không xóa được hội thoại');
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    let convId = currentId;
    if (!convId) {
      try {
        const res = await chatService.createConversation();
        if (!res.success || !res.data) return;
        convId = res.data.conversation._id;
        setConversations((prev) => [
          { _id: convId!, title: res.data!.conversation.title, updatedAt: res.data!.conversation.updatedAt },
          ...prev,
        ]);
        setCurrentId(convId);
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Không tạo được hội thoại');
        return;
      }
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await chatService.sendMessage(convId, text);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!.modelReply]);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === convId ? { ...c, title: text.length > 40 ? text.slice(0, 37) + '...' : text, updatedAt: new Date().toISOString() } : c
          )
        );
      }
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => !(m.role === 'user' && m.text === text)));
      toast.error(e.response?.data?.message || 'Gửi tin nhắn thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className={`fixed right-6 bottom-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isExpanded ? 'w-[min(90vw,560px)] h-[min(75vh,640px)]' : 'w-[340px] h-[455px]'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm">HD</div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">HDQTShop</span>
              <span className="text-xs text-primary-100">Chat với chúng tôi</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="p-1 rounded-full hover:bg-primary-500" onClick={onToggleExpand} aria-label="Thu nhỏ/Phóng to">
              {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
            </button>
            <button type="button" className="p-1 rounded-full hover:bg-primary-500" onClick={onClose} aria-label="Đóng">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-3">Vui lòng đăng nhập để sử dụng chatbot</p>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
        isExpanded ? 'w-[min(90vw,560px)] h-[min(75vh,640px)]' : 'w-[340px] h-[455px]'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-sm">HD</div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">HDQTShop</span>
            <span className="text-xs text-primary-100">Chat với chúng tôi</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="p-1 rounded-full hover:bg-primary-500" onClick={onToggleExpand} aria-label="Thu nhỏ/Phóng to">
            {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
          </button>
          <button type="button" className="p-1 rounded-full hover:bg-primary-500" onClick={onClose} aria-label="Đóng">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar: danh sách hội thoại (chỉ khi expanded) */}
        {isExpanded && (
          <div className="w-48 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
            <button
              type="button"
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 border-b border-gray-200"
            >
              <FiPlus className="w-4 h-4" />
              Hội thoại mới
            </button>
            <div className="flex-1 overflow-y-auto">
              {loadingList ? (
                <p className="p-3 text-xs text-gray-500">Đang tải...</p>
              ) : conversations.length === 0 ? (
                <p className="p-3 text-xs text-gray-500">Chưa có hội thoại</p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => setCurrentId(c._id)}
                    className={`group flex items-center gap-2 px-3 py-2 text-left cursor-pointer border-b border-gray-100 ${
                      currentId === c._id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <FiMessageCircle className="w-4 h-4 shrink-0 text-gray-400" />
                    <span className="flex-1 truncate text-sm">{c.title}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(c._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-600 shrink-0"
                      aria-label="Xóa hội thoại"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 min-w-0">
          {/* Khu vực tin nhắn */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm bg-gray-50">
            {messages.length === 0 && !currentId && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm border border-gray-200">
                  <p className="text-gray-800">Xin chào! HDQTShop có thể hỗ trợ gì cho bạn hôm nay?</p>
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary-600 text-white px-3 py-2">
                    <p className="text-sm">{m.text}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              )
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm bg-amber-50 px-3 py-2 border border-amber-200">
                  <span className="text-amber-800 text-xs">Đang trả lời</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Nút hội thoại mới khi chưa expand */}
          {!isExpanded && (
            <div className="px-3 pb-1">
              <button
                type="button"
                onClick={handleNewConversation}
                className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                <FiPlus className="w-3.5 h-3.5" />
                Hội thoại mới
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-2 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Nhập tin nhắn..."
              disabled={loading}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Gửi"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
