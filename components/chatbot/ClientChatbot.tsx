"use client"

import { useEffect, useState } from 'react';
import { Chatbot } from './Chatbot';
import { ChatbotConfig } from '@/types/chatbot';

interface ClientChatbotProps {
  config?: ChatbotConfig;
  userId?: string;
  className?: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onError?: (error: string) => void;
  userAuthenticated?: boolean;
}

export function ClientChatbot(props: ClientChatbotProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client side to avoid hydration mismatches
  if (!isClient) {
    return null;
  }

  return <Chatbot {...props} />;
}

export default ClientChatbot;
