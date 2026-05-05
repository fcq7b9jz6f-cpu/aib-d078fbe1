'use client';

import { useContext } from 'react';
import { Bot, Plus } from 'lucide-react';
import { ChatContext } from '@/components/providers/ChatProvider';

export default function WelcomePage() {
  const { createNewChat } = useContext(ChatContext);
  
  return (
    <div className="welcome-screen">
      <div className="logo-container">
          <Bot size={48} className="logo-icon" />
      </div>
      <h1 className="welcome-title">كيف يمكنني مساعدتك <em>اليوم</em>؟</h1>
      <button onClick={createNewChat} className="start-chat-btn">
          <Plus size={20} />
          <span>ابدأ محادثة جديدة</span>
      </button>
    </div>
  );
}