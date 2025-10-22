import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Backend server might not be running on http://localhost:5000');
      console.error('Please start the backend server with: cd server && npm run dev');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
    } else if (error.response) {
      // Server responded with error
      console.error('Server Error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (name: string, email: string, password: string, pic?: string) => {
  const { data } = await api.post('/user/register', { name, email, password, pic });
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data } = await api.post('/user/login', { email, password });
  return data;
};

export const searchUsers = async (search: string) => {
  const { data } = await api.get(`/user?search=${search}`);
  return data;
};

export const getUserProfile = async () => {
  const { data } = await api.get('/user/profile');
  return data;
};

export const updateUserProfile = async (userData: any) => {
  const { data } = await api.put('/user/profile', userData);
  return data;
};

export const accessChat = async (userId: string) => {
  const { data } = await api.post('/chat', { userId });
  return data;
};

export const fetchChats = async () => {
  const { data } = await api.get('/chat');
  return data;
};

export const createGroupChat = async (name: string, users: string[]) => {
  const { data } = await api.post('/chat/group', {
    name,
    users: JSON.stringify(users),
  });
  return data;
};

export const renameGroup = async (chatId: string, chatName: string) => {
  const { data } = await api.put('/chat/rename', { chatId, chatName });
  return data;
};

export const addToGroup = async (chatId: string, userId: string) => {
  const { data } = await api.put('/chat/groupadd', { chatId, userId });
  return data;
};

export const removeFromGroup = async (chatId: string, userId: string) => {
  const { data } = await api.put('/chat/groupremove', { chatId, userId });
  return data;
};

export const sendMessage = async (messageData: any) => {
  const { data } = await api.post('/message', messageData);
  return data;
};

export const fetchMessages = async (chatId: string) => {
  const { data } = await api.get(`/message/${chatId}`);
  return data;
};

export const markMessageAsRead = async (messageId: string) => {
  const { data } = await api.put('/message/read', { messageId });
  return data;
};

export const addReaction = async (messageId: string, emoji: string) => {
  const { data } = await api.post('/message/reaction', { messageId, emoji });
  return data;
};

export const removeReaction = async (messageId: string) => {
  const { data } = await api.delete('/message/reaction', {
    data: { messageId },
  });
  return data;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}').token}`,
    },
  });
  return data;
};

export const fetchContacts = async () => {
  const { data } = await api.get('/user/contacts');
  return data;
};

export const addContact = async (contactId: string) => {
  const { data } = await api.post('/user/contacts', { contactId });
  return data;
};

export const removeContact = async (contactId: string) => {
  const { data } = await api.post('/user/contacts/remove', { contactId });
  return data;
};

export const createCall = async (receiver: string, callType: 'voice' | 'video') => {
  const { data } = await api.post('/call', { receiver, callType });
  return data;
};

export interface CallStatusUpdate {
  callId: string;
  status: 'missed' | 'rejected' | 'completed' | 'cancelled';
  duration?: number;
  startedAt?: string;
  endedAt?: string;
}

export const updateCallStatus = async (payload: CallStatusUpdate) => {
  const { data } = await api.put('/call/update', payload);
  return data;
};

export default api;
