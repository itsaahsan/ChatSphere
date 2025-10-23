'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { userAPI, chatAPI } from '@/lib/api';
import { FiSearch, FiPlus, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ChatSidebarProps {
  chats: any[];
  onRefresh: () => void;
}

export default function ChatSidebar({ chats, onRefresh }: ChatSidebarProps) {
  const { user, selectedChat, setSelectedChat, setUser, logout } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleUserClick = async (clickedUser: any) => {
    try {
      const response = await chatAPI.accessOrCreateChat(clickedUser._id);
      const newChat = response.data;
      setSelectedChat(newChat);
      setSearchTerm('');
      setSearchResults([]);
      setShowSearch(false);
      onRefresh();
    } catch (error) {
      toast.error('Failed to open chat');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    setUser(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-green-500">ChatSphere</h1>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <FiSearch size={20} />
          </button>
        </div>

        {showSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto z-10">
                {searchResults.map((result) => (
                  <button
                    key={result._id}
                    onClick={() => handleUserClick(result)}
                    className="w-full px-3 py-2 hover:bg-gray-700 text-left transition flex items-center gap-3 border-b border-gray-700 last:border-0"
                  >
                    {result.pic && (
                      <img src={result.pic} alt={result.name} className="w-8 h-8 rounded-full" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{result.name}</p>
                      <p className="text-xs text-gray-400">{result.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No chats yet</p>
            <p className="text-sm mt-2">Search for users to start chatting</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-3 text-left hover:bg-gray-800 transition ${
                  selectedChat?._id === chat._id ? 'bg-gray-800' : ''
                }`}
              >
                <p className="font-semibold truncate">{chat.chatName || chat.users[0]?.name}</p>
                {chat.latestMessage && (
                  <p className="text-sm text-gray-400 truncate">{chat.latestMessage.content}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          {user?.pic && <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full" />}
          <div className="flex-1 px-3">
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 hover:bg-gray-800 rounded-lg transition text-sm"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
