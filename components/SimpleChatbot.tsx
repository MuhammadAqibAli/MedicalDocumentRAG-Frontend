"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '@/hooks/useSimpleChatbot';
import { MessageCircle, X, Send } from 'lucide-react';

export const SimpleChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    handleButtonClick,
    handleQuickReply,
    clearConversation,
    addInitialGreeting
  } = useChatbot();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show initial greeting when chat is opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addInitialGreeting();
    }
  }, [isOpen, messages.length, addInitialGreeting]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Medical Assistant</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearConversation}
                className="text-white hover:text-gray-200 text-sm"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                <div className="animate-pulse">
                  <p className="mb-2">Loading medical assistant...</p>
                  <div className="flex justify-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Buttons */}
                  {message.buttons && message.buttons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.buttons.map((button, index) => (
                        <button
                          key={index}
                          onClick={() => handleButtonClick(button)}
                          className="block w-full text-left text-xs bg-white text-blue-600 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                        >
                          {button.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Replies */}
                  {message.quickReplies && message.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-1 hover:bg-blue-200 transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
