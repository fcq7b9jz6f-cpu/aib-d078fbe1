'use client';

import { createContext, ReactNode, useContext } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import { Chat } from '@/lib/types';

interface ChatContextType {
  chats: Record<string, Chat>;
  setChats: (value: Record<string, Chat> | ((val: Record<string, Chat>) => Record<string, Chat>)) => void;
  createNewChat: () => void;
  deleteChat: (chatId: string) => void;
}

export const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useLocalStorage<Record<string, Chat>>('chats', {});
  const router = useRouter();

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setChats(prev => ({ ...prev, [newChatId]: { id: newChatId, title: "محادثة جديدة", messages: [] } }));
    router.push(`/chat/${newChatId}`);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => {
      const newChats = { ...prev };
      delete newChats[chatId];
      return newChats;
    });
    router.push(`/`);
  };

  return (
    <ChatContext.Provider value={{ chats, setChats, createNewChat, deleteChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);