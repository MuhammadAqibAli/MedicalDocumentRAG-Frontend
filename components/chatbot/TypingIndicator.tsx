"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  visible: boolean;
  message?: string;
  className?: string;
  variant?: 'default' | 'thinking' | 'processing';
}

export function TypingIndicator({ 
  visible, 
  message,
  className,
  variant = 'default'
}: TypingIndicatorProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  // Dynamic messages based on variant
  const defaultMessages = {
    default: [
      "Assistant is typing...",
      "Thinking...",
      "Processing your request..."
    ],
    thinking: [
      "Analyzing your message...",
      "Understanding your request...",
      "Preparing response..."
    ],
    processing: [
      "Processing...",
      "Working on it...",
      "Almost ready..."
    ]
  };

  // Cycle through messages if no specific message provided
  useEffect(() => {
    if (!visible || message) return;

    const messages = defaultMessages[variant];
    let index = 0;

    const interval = setInterval(() => {
      setCurrentMessage(messages[index]);
      index = (index + 1) % messages.length;
    }, 2000);

    // Set initial message
    setCurrentMessage(messages[0]);

    return () => clearInterval(interval);
  }, [visible, message, variant]);

  // Use provided message or current cycling message
  const displayMessage = message || currentMessage;

  const getIcon = () => {
    switch (variant) {
      case 'thinking':
        return <Brain className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Zap className="h-4 w-4 text-orange-500 animate-pulse" />;
      default:
        return <Bot className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'thinking':
        return "bg-blue-50 border-blue-200";
      case 'processing':
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!visible) return null;

  return (
    <div className={cn("flex justify-start mb-4", className)}>
      <div className="max-w-[80%] flex items-start space-x-2">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <Card className={cn("shadow-sm transition-all duration-300", getCardStyle())}>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              {/* Animated typing dots */}
              <div className="flex space-x-1">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full animate-bounce",
                    variant === 'thinking' ? "bg-blue-400" :
                    variant === 'processing' ? "bg-orange-400" : "bg-gray-400"
                  )}
                  style={{ animationDelay: '0ms' }}
                />
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full animate-bounce",
                    variant === 'thinking' ? "bg-blue-400" :
                    variant === 'processing' ? "bg-orange-400" : "bg-gray-400"
                  )}
                  style={{ animationDelay: '150ms' }}
                />
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full animate-bounce",
                    variant === 'thinking' ? "bg-blue-400" :
                    variant === 'processing' ? "bg-orange-400" : "bg-gray-400"
                  )}
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              
              {/* Dynamic message */}
              {displayMessage && (
                <span className={cn(
                  "text-sm ml-2 transition-opacity duration-300",
                  variant === 'thinking' ? "text-blue-700" :
                  variant === 'processing' ? "text-orange-700" : "text-gray-600"
                )}>
                  {displayMessage}
                </span>
              )}
            </div>

            {/* Progress bar for processing variant */}
            {variant === 'processing' && (
              <div className="mt-2 w-full bg-orange-200 rounded-full h-1">
                <div className="bg-orange-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TypingIndicator;
