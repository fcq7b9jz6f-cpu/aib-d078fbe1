'use client';

import { ChatScreen } from '@/components/ChatScreen';

export default function ChatPage({ params }: { params: { id: string } }) {
  return <ChatScreen chatId={params.id} />;
}