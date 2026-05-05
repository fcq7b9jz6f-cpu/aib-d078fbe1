'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot } from 'lucide-react';
import { ChatContext } from '@/components/providers/ChatProvider';
import { Message, TypingIndicator } from '@/components/Message';

export function ChatScreen({ chatId }: { chatId: string }) {
  const { chats, setChats } = useContext(ChatContext);
  const router = useRouter();
  const chat = chats[chatId];
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!chat) {
      // This might happen if the chat was deleted, or on first load before context is ready
      // router.push('/');
    }
  }, [chat, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages, isStreaming]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: 'user' as const, content: input };
    const currentMessages = [...(chat.messages || []), userMessage];
    
    const newTitle = chat.messages.length === 0 ? input.split(' ').slice(0, 5).join(' ') : chat.title;

    setChats(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], title: newTitle, messages: currentMessages }
    }));
    setInput('');
    setIsStreaming(true);

    setChats(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], messages: [...currentMessages, { role: 'assistant' as const, content: '' }] }
    }));

    try {
      const response = await fetch('/api/chat', { // using Next.js API route proxy
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages.slice(-10) }),
      });
      // ... streaming logic similar to the single-file app ...
    } catch (error) {
      console.error('API route error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  if (!chat) return null; // Or a loading/error state

  return (
    <div className="chat-screen">
      <div className="messages-container">
        {chat.messages.length === 0 ? (
            <div className="empty-chat-placeholder">
                <Bot size={40} className="text-slate-500" />
                <p className="text-lg text-slate-400">ابدأ المحادثة بإرسال رسالة.</p>
            </div>
        ) : (
            chat.messages.map((msg, index) => <Message key={index} message={msg} />)
        )}
        {isStreaming && chat.messages[chat.messages.length - 1]?.content === '' && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <form onSubmit={handleSend} className="input-form">
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
            placeholder="اكتب رسالتك هنا..." rows={1} className="chat-input" disabled={isStreaming}
          />
          <button type="submit" className="send-btn" disabled={isStreaming || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}