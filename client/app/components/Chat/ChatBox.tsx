'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { messageAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { FiSend, FiMic, FiSmile } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ChatBoxProps {
  chat: any;
}

export default function ChatBox({ chat }: ChatBoxProps) {
  const { user, messages, setMessages, addMessage, typing } = useChatStore();
  const { socket, emit } = useSocket();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    loadMessages();
    if (socket) {
      emit('join chat', chat._id);
    }
  }, [chat._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getMessages(chat._id);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      const response = await messageAPI.sendMessage({
        content: input,
        chatId: chat._id,
      });

      const newMessage = response.data;
      addMessage(newMessage);

      if (socket) {
        emit('new message', {
          ...newMessage,
          chat: chat,
        });
      }

      setInput('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socket) {
      emit('typing', { room: chat._id, userName: user?.name });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        // Send voice message
        toast.success('Voice message recorded');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-darker">
        <h2 className="text-xl font-bold">{chat.chatName || chat.users[0]?.name}</h2>
        <p className="text-xs text-gray-400">
          {chat.users.length} participant{chat.users.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender._id === user?._id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {message.sender._id !== user?._id && (
                    <p className="text-xs font-semibold mb-1 opacity-70">{message.sender.name}</p>
                  )}
                  <p className="break-words">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {typing[chat._id] && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <p className="text-xs italic text-gray-400">{typing[chat._id]} is typing...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-darker">
        <div className="flex gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition ${
              isRecording ? 'bg-red-600 text-white' : 'hover:bg-gray-700'
            }`}
          >
            <FiMic size={20} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
