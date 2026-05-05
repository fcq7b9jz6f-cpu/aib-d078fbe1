'use client';

import { useMemo, useContext } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { ChatContext } from '@/components/providers/ChatProvider';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { chats, createNewChat, deleteChat } = useContext(ChatContext);
  const pathname = usePathname();

  const handleCreateNewChat = () => {
    createNewChat();
    setIsOpen(false);
  };

  const sortedChats = useMemo(() => {
    return Object.values(chats).sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
  }, [chats]);

  return (
    <motion.div 
      className="sidebar"
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      // variants={{ open: { x: 0 }, closed: { x: '100%' } }} animate={isOpen ? 'open' : 'closed'} 
      // className='sidebar fixed ... md:relative md:translate-x-0'
    >
      <div className="sidebar-header">
        <button onClick={() => setIsOpen(false)} className="sidebar-close-btn"><X size={24} /></button>
        <button onClick={handleCreateNewChat} className="new-chat-btn">
          <span>محادثة جديدة</span>
          <Plus size={20} />
        </button>
      </div>
      <nav className="chat-history">
        {sortedChats.map(chat => (
          <Link 
            key={chat.id} 
            href={`/chat/${chat.id}`} 
            onClick={() => setIsOpen(false)} 
            className={`chat-link ${pathname === `/chat/${chat.id}` ? 'active' : ''}`}>
              <MessageSquare size={18} />
              <span className="truncate">{chat.title}</span>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteChat(chat.id); }} className="delete-chat-btn">
                  <Trash2 size={16} />
              </button>
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}