'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import { User, Bot } from 'lucide-react';
import type { Message as MessageType } from '@/lib/types';

export const Message = ({ message }: { message: MessageType }) => {
  const isUser = message.role === 'user';
  // In a real Next.js app, consider server-side parsing or a safer client-side library like DOMPurify.
  const sanitizedHtml = useMemo(() => marked.parse(message.content || '', { gfm: true, breaks: true }), [message.content]);

  return (
    <motion.div
      className={`message ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
    >
      <div className="message-icon">
        {isUser ? <User size={24} /> : <Bot size={24} />}
      </div>
      <div className="message-content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </motion.div>
  );
};

export const TypingIndicator = () => (
    <motion.div className="message assistant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="message-icon"><Bot size={24} /></div>
        <div className="message-content">
            <div className="typing-dots">
                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }} />
                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }} />
            </div>
        </div>
    </motion.div>
);