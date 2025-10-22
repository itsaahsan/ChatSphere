export interface User {
  _id: string;
  name: string;
  email: string;
  pic: string;
  about: string;
  isOnline?: boolean;
  lastSeen?: Date;
  status?: 'Available' | 'Busy' | 'Away' | 'Do Not Disturb';
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    sound: boolean;
    desktop: boolean;
  };
  blockedUsers?: string[];
  privacy?: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePic: 'everyone' | 'contacts' | 'nobody';
    about: 'everyone' | 'contacts' | 'nobody';
  };
  token?: string;
}

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: User[];
  latestMessage?: Message;
  groupAdmin?: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Reaction {
  user: User | string;
  emoji: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat | string;
  readBy: User[] | string[];
  messageType: 'text' | 'image' | 'document' | 'audio' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reactions?: Reaction[];
  replyTo?: Message | string;
  isDeleted?: boolean;
  deletedAt?: Date;
  isEdited?: boolean;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Status {
  _id: string;
  user: User;
  content: string;
  mediaType: 'text' | 'image' | 'video';
  mediaUrl?: string;
  backgroundColor?: string;
  viewers: {
    user: User;
    viewedAt: Date;
  }[];
  expiresAt: Date;
  createdAt: Date;
}

export interface Call {
  _id: string;
  caller: User;
  receiver: User;
  callType: 'voice' | 'video';
  status: 'missed' | 'rejected' | 'completed' | 'cancelled';
  duration?: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ChatState {
  selectedChat: Chat | null;
  chats: Chat[];
  notification: Message[];
  onlineUsers: string[];
}
