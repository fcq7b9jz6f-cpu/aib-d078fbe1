import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Send, User, Bot, Trash2, Menu, X } from "lucide-react";
import { marked } from "marked";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const App = () => {
  const [chats, setChats] = useLocalStorage("chats", {});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setChats(prev => ({ ...prev, [newChatId]: { id: newChatId, title: "محادثة جديدة", messages: [] } }));
    navigate(`/chat/${newChatId}`);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId) => {
    setChats(prev => {
      const newChats = { ...prev };
      delete newChats[chatId];
      return newChats;
    });
    navigate(`/`);
  };

  const sortedChats = useMemo(() => {
    return Object.values(chats).sort((a, b) => b.id - a.id);
  }, [chats]);

  return (
    <div className="app-container">
      <AnimatePresence>
        {sidebarOpen && (
            <motion.div 
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} 
              className="sidebar-backdrop"
            />
        )}
      </AnimatePresence>
      <motion.div 
        className="sidebar"
        initial={{ x: "100%" }}
        animate={{ x: sidebarOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      >
        <div className="sidebar-header">
            <button onClick={() => setSidebarOpen(false)} className="sidebar-close-btn"><X size={24} /></button>
            <button onClick={createNewChat} className="new-chat-btn">
              <span>محادثة جديدة</span>
              <Plus size={20} />
            </button>
        </div>
        <nav className="chat-history">
          {sortedChats.map(chat => (
            <Link key={chat.id} to={`/chat/${chat.id}`} onClick={() => setSidebarOpen(false)} className="chat-link">
                <MessageSquare size={18} />
                <span className="truncate">{chat.title}</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteChat(chat.id); }} className="delete-chat-btn">
                    <Trash2 size={16} />
                </button>
            </Link>
          ))}
        </nav>
      </motion.div>

      <main className="main-content">
        <button onClick={() => setSidebarOpen(true)} className="menu-btn">
            <Menu size={24} />
        </button>
        <Routes>
          <Route path="/" element={<WelcomeScreen createNewChat={createNewChat} />} />
          <Route path="/chat/:chatId" element={<ChatScreen chats={chats} setChats={setChats} />} />
        </Routes>
      </main>
    </div>
  );
};

const WelcomeScreen = ({ createNewChat }) => (
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

const ChatScreen = ({ chats, setChats }) => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const chat = chats[chatId];
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!chat) {
      navigate("/");
    }
  }, [chat, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages, isStreaming]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: "user", content: input };
    const currentMessages = [...(chat.messages || []), userMessage];
    
    const newTitle = chat.messages.length === 0 ? input.split(' ').slice(0, 5).join(' ') : chat.title;

    setChats(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], title: newTitle, messages: currentMessages }
    }));
    setInput("");
    setIsStreaming(true);

    setChats(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], messages: [...currentMessages, { role: "assistant", content: "" }] }
    }));

    try {
      const response = await fetch(window.__AI_ENDPOINT__, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages.slice(-10) }), // Send last 10 messages for context
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setChats(prev => {
          const currentChat = prev[chatId];
          const lastMessage = currentChat.messages[currentChat.messages.length - 1];
          const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
          const updatedMessages = [...currentChat.messages.slice(0, -1), updatedLastMessage];
          return { ...prev, [chatId]: { ...currentChat, messages: updatedMessages } };
        });
      }
    } catch (error) {
      console.error("Streaming error:", error);
        setChats(prev => {
          const currentChat = prev[chatId];
          const lastMessage = currentChat.messages[currentChat.messages.length - 1];
          const updatedLastMessage = { ...lastMessage, content: "عذرًا، حدث خطأ ما. يرجى المحاولة مرة أخرى." };
          const updatedMessages = [...currentChat.messages.slice(0, -1), updatedLastMessage];
          return { ...prev, [chatId]: { ...currentChat, messages: updatedMessages } };
        });
    } finally {
      setIsStreaming(false);
    }
  };

  if (!chat) return null;

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
        {isStreaming && chat.messages[chat.messages.length-1].content === '' && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <form onSubmit={handleSend} className="input-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                }
            }}
            placeholder="اكتب رسالتك هنا..."
            rows="1"
            className="chat-input"
            disabled={isStreaming}
          />
          <button type="submit" className="send-btn" disabled={isStreaming || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
    <motion.div 
        className="message assistant"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="message-icon"><Bot size={24} /></div>
        <div className="message-content">
            <div className="typing-dots">
                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                <motion.span animate={{ y: [-2, 2, -2] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
            </div>
        </div>
    </motion.div>
);

const Message = ({ message }) => {
  const isUser = message.role === "user";
  const sanitizedHtml = useMemo(() => marked.parse(message.content || "", { gfm: true, breaks: true, sanitize: false }), [message.content]);

  return (
    <AnimatePresence>
      <motion.div
        className={`message ${isUser ? "user" : "assistant"}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="message-icon">
          {isUser ? <User size={24} /> : <Bot size={24} />}
        </div>
        <div className="message-content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </motion.div>
    </AnimatePresence>
  );
};

const Root = () => (
  <HashRouter>
    <App />
  </HashRouter>
);

createRoot(document.getElementById("root")).render(<Root />);