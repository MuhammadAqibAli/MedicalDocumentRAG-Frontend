"use client"

import React, { useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { MessageListProps } from '@/types/chatbot';
import { cn } from '@/lib/utils';

export function MessageList({
  messages,
  isTyping = false,
  onQuickReply,
  onButtonClick,
  onRetry,
  className
}: MessageListProps & { className?: string }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = React.useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  // Handle scroll events to show/hide scroll button
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollButton(!isNearBottom && messages.length > 0);
    setIsAutoScrolling(isNearBottom);
  }, [messages.length]);

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (isAutoScrolling) {
      scrollToBottom();
    }
  }, [messages, isTyping, isAutoScrolling, scrollToBottom]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  const handleRetryMessage = useCallback((messageId: string) => {
    if (onRetry) {
      onRetry(messageId);
    }
  }, [onRetry]);

  const handleScrollButtonClick = useCallback(() => {
    scrollToBottom();
    setShowScrollButton(false);
    setIsAutoScrolling(true);
  }, [scrollToBottom]);

  // Render empty state
  if (messages.length === 0 && !isTyping) {
    return (
      <div className={cn("flex-1 flex items-center justify-center p-8", className)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Medical Assistant
            </h3>
            <p className="text-gray-600 max-w-sm">
              I'm here to help you with complaints, feedback, document uploads, and more.
              How can I assist you today?
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative flex-1", className)}>
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full w-full chatbot-scrollbar-always chatbot-smooth-scroll [&>div>div[style]]:!block"
        onScrollCapture={handleScroll}
      >
        <div className="p-4 space-y-2">
          {/* Welcome message for first interaction */}
          {messages.length === 1 && messages[0].sender === 'bot' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Medical Assistant Ready
                  </h4>
                  <p className="text-sm text-blue-700">
                    I can help you with medical complaints, feedback, document management,
                    and content generation. Just ask me anything!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
              onQuickReply={onQuickReply}
              onButtonClick={onButtonClick}
              onRetry={() => handleRetryMessage(message.id)}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <TypingIndicator
              visible={true}
              message="Assistant is thinking..."
            />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full w-10 h-10 p-0 shadow-lg bg-white hover:bg-gray-50 border-gray-300"
            onClick={handleScrollButtonClick}
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Message count indicator */}
      {messages.length > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full opacity-75">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Loading overlay for when messages are being processed */}
      {messages.some(msg => msg.status === 'sending') && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200">
          <div className="h-full bg-blue-600 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export default MessageList;
