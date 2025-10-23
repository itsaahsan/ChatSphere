import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chatStore';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const store = useChatStore();

  useEffect(() => {
    if (socket) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      if (store.user) {
        socket?.emit('setup', store.user);
      }
    });

    socket.on('connected', () => {
      console.log('Socket authenticated');
    });

    socket.on('message received', (message) => {
      store.addMessage(message);
      toast.success(`New message from ${message.sender.name}`);
    });

    socket.on('typing', ({ room, userName }) => {
      store.addTypingUser(room, userName);
    });

    socket.on('stop typing', (room) => {
      store.removeTypingUser(room);
    });

    socket.on('online users', (userId) => {
      store.setOnlineUsers([...store.onlineUsers, userId]);
    });

    socket.on('offline users', (userId) => {
      store.setOnlineUsers(store.onlineUsers.filter((id) => id !== userId));
    });

    socket.on('all online users', (users) => {
      store.setOnlineUsers(users);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      // Cleanup on unmount but keep socket alive for the app
    };
  }, [store.user, store]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return { socket: socketRef.current, emit, on, off };
};
