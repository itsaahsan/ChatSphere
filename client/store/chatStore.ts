import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
  pic?: string;
  isOnline: boolean;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: string;
  createdAt: string;
  readBy: string[];
  deliveredTo: string[];
  reactions?: Array<{ user: string; emoji: string }>;
  replyTo?: string;
  isDeleted?: boolean;
}

interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  isPinned?: boolean;
  isArchived?: boolean;
  groupAdmin?: User;
}

interface ChatStore {
  user: User | null;
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  onlineUsers: string[];
  typing: { [key: string]: string };
  searchResults: User[];

  setUser: (user: User | null) => void;
  setChats: (chats: Chat[]) => void;
  setSelectedChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: string[]) => void;
  addTypingUser: (chatId: string, userName: string) => void;
  removeTypingUser: (chatId: string) => void;
  setSearchResults: (results: User[]) => void;
  logout: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  user: null,
  chats: [],
  selectedChat: null,
  messages: [],
  onlineUsers: [],
  typing: {},
  searchResults: [],

  setUser: (user: User | null) => set({ user }),
  setChats: (chats) => set({ chats }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addTypingUser: (chatId, userName) =>
    set((state) => ({
      typing: { ...state.typing, [chatId]: userName },
    })),
  removeTypingUser: (chatId) =>
    set((state) => {
      const newTyping = { ...state.typing };
      delete newTyping[chatId];
      return { typing: newTyping };
    }),
  setSearchResults: (results) => set({ searchResults: results }),
  logout: () =>
    set({
      user: null,
      chats: [],
      selectedChat: null,
      messages: [],
      onlineUsers: [],
      typing: {},
      searchResults: [],
    }),
}));
