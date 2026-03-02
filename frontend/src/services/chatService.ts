import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ConversationSummary {
  _id: string;
  title: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export const chatService = {
  async getConversations(): Promise<{ success: boolean; data?: { conversations: ConversationSummary[] } }> {
    const res = await api.get(API_ENDPOINTS.CHAT_CONVERSATIONS);
    return res.data;
  },

  async createConversation(): Promise<{ success: boolean; data?: { conversation: Conversation } }> {
    const res = await api.post(API_ENDPOINTS.CHAT_CONVERSATIONS);
    return res.data;
  },

  async getConversation(id: string): Promise<{ success: boolean; data?: { conversation: Conversation } }> {
    const res = await api.get(API_ENDPOINTS.CHAT_CONVERSATION_BY_ID(id));
    return res.data;
  },

  async sendMessage(conversationId: string, text: string): Promise<{
    success: boolean;
    data?: { userMessage: ChatMessage; modelReply: ChatMessage };
  }> {
    const res = await api.post(API_ENDPOINTS.CHAT_SEND_MESSAGE(conversationId), { text }, { timeout: 30000 });
    return res.data;
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(API_ENDPOINTS.CHAT_CONVERSATION_BY_ID(id));
    return res.data;
  },
};
