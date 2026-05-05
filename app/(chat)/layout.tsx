'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatProvider } from '@/components/providers/ChatProvider';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function ChatLayout({
  children,
}: { 
  children: React.ReactNode 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ChatProvider>
      <div className="app-container">
        <AnimatePresence>
          {sidebarOpen && (
              <motion.div 
                key="sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)} 
                className="sidebar-backdrop md:hidden"
              />
          )}
        </AnimatePresence>
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="main-content">
          <button onClick={() => setSidebarOpen(true)} className="menu-btn">
              <Menu size={24} />
          </button>
          {children}
        </main>
      </div>
    </ChatProvider>
  );
}