import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/user/register', data),
  login: (data: any) => api.post('/user/login', data),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  forgotPassword: (email: string) => api.post('/user/send-verification', { email }),
};

export const chatAPI = {
  getAllChats: () => api.get('/chat'),
  accessOrCreateChat: (userId: string) => api.post('/chat', { userId }),
  createGroup: (data: any) => api.post('/chat/group', data),
  renameGroup: (chatId: string, name: string) => api.put('/chat/rename', { chatId, chatName: name }),
  addToGroup: (chatId: string, userId: string) => api.put('/chat/groupadd', { chatId, userId }),
  removeFromGroup: (chatId: string, userId: string) => api.put('/chat/groupremove', { chatId, userId }),
  pinChat: (chatId: string) => api.put('/chat/pin', { chatId }),
  unpinChat: (chatId: string) => api.put('/chat/unpin', { chatId }),
  archiveChat: (chatId: string) => api.put('/chat/archive', { chatId }),
  unarchiveChat: (chatId: string) => api.put('/chat/unarchive', { chatId }),
};

export const messageAPI = {
  getMessages: (chatId: string) => api.get(`/message/${chatId}`),
  sendMessage: (data: any) => api.post('/message', data),
  editMessage: (messageId: string, content: string) =>
    api.put('/message/edit', { messageId, content }),
  deleteMessage: (messageId: string) => api.delete(`/message/delete/${messageId}`),
  markAsRead: (messageId: string, chatId: string) =>
    api.put('/message/read', { messageId, chatId }),
  searchMessages: (query: string, chatId?: string) =>
    api.get('/message/search', { params: { q: query, chatId } }),
  addReaction: (messageId: string, emoji: string) =>
    api.post('/message/reaction', { messageId, emoji }),
};

export const userAPI = {
  searchUsers: (query: string) => api.get('/user', { params: { search: query } }),
  blockUser: (userId: string) => api.post('/user/block', { userId }),
  unblockUser: (userId: string) => api.post('/user/unblock', { userId }),
};

export const aiAPI = {
  generateReply: (messageContent: string, context?: any[]) =>
    api.post('/ai/reply', { messageContent, conversationContext: context }),
  generateSummary: (messages: any[]) => api.post('/ai/summary', { messages }),
  getSmartReplies: (lastMessage: string) =>
    api.post('/ai/smart-replies', { lastMessage }),
};

export const speechAPI = {
  speechToText: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    return api.post('/speech/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  textToSpeech: (text: string, languageCode?: string) =>
    api.post('/speech/text-to-speech', { text, languageCode }, { responseType: 'blob' }),
};

export default api;
