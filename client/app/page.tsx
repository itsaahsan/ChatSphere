'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import LoginPage from '@/app/components/Auth/LoginPage';
import ChatPage from '@/app/components/Chat/ChatPage';

export default function Home() {
  const router = useRouter();
  const { user } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      useChatStore.setState({ user: userData });
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden">
      {user ? <ChatPage /> : <LoginPage />}
    </main>
  );
}
