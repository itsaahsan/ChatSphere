'use client';

import { useState } from 'react';
import { aiAPI } from '@/lib/api';
import { FiSend, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface AIChatAssistantProps {
  onClose: () => void;
  currentMessages?: any[];
}

export default function AIChatAssistant({ onClose, currentMessages = [] }: AIChatAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.generateReply(input, messages);
      const aiReply = { role: 'assistant', content: response.data.reply };
      setMessages((prev) => [...prev, aiReply]);

      // Get smart replies for the last message
      if (currentMessages.length > 0) {
        const lastMsg = currentMessages[currentMessages.length - 1];
        const repliesResponse = await aiAPI.getSmartReplies(lastMsg.content);
        setSmartReplies(repliesResponse.data.replies);
      }
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartReply = (reply: string) => {
    setInput(reply);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-darker border border-gray-700 rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-green-500">AI Assistant</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-4">
            <p>Ask me anything!</p>
            <p className="text-xs mt-2">I can help with suggestions, summaries, and more.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Smart Replies */}
      {smartReplies.length > 0 && (
        <div className="p-2 border-t border-gray-700 bg-gray-900">
          <p className="text-xs text-gray-400 mb-2">Quick replies:</p>
          <div className="space-y-1">
            {smartReplies.slice(0, 2).map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSmartReply(reply)}
                className="w-full text-left px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded truncate transition"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI..."
          className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:border-green-500 focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          className="p-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded transition"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}
