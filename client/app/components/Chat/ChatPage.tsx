'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { chatAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import ChatSidebar from './ChatSidebar';
import ChatBox from './ChatBox';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user, chats, setChats, selectedChat, setSelectedChat } = useChatStore();
  const { socket, emit } = useSocket();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && socket) {
      emit('setup', user);
      loadChats();
    }
  }, [user, socket]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getAllChats();
      setChats(response.data);
    } catch (error: any) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex bg-dark">
      {/* Sidebar */}
      <div className="w-80 bg-darker border-r border-gray-800 flex flex-col overflow-hidden">
        <ChatSidebar chats={chats} onRefresh={loadChats} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-dark">
        {selectedChat ? (
          <ChatBox chat={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
