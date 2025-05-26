"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Loader2,
  AlertCircle,
  Settings,
  Trash2,
  Moon,
  Sun,
  Download,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Expand,
  Shrink
} from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { ChatbotConfig, QuickAction } from '@/types/chatbot';
import { cn } from '@/lib/utils';

// Import chatbot components
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuickActionsPanel from './QuickActionsPanel';
import DynamicForm from './DynamicForm';

interface ChatbotProps {
  config?: ChatbotConfig;
  userId?: string;
  className?: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
  onError?: (error: string) => void;
  userAuthenticated?: boolean;
}

export function Chatbot({
  config = {},
  userId,
  className,
  onSessionStart,
  onSessionEnd,
  onError,
  userAuthenticated = false
}: ChatbotProps) {
  // Configuration with defaults
  const {
    position = 'bottom-right',
    theme = 'light',
    width = 400,
    height = 600,
    minimized: defaultMinimized = false,
    showQuickActions = true,
    confidenceThreshold = 0.5,
    autoGreeting = true,
    greetingMessage = "Hello! I'm your medical assistant. How can I help you today?",
    enableVoiceInput = false,
    enableFileUpload = true
  } = config;

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(position === 'fullscreen');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs
  const chatbotRef = useRef<HTMLDivElement>(null);

  // Chatbot hook
  const { state, actions, utils } = useChatbot({
    userId,
    autoGreeting,
    confidenceThreshold
  });

  // Position classes
  const getPositionClasses = () => {
    if (isFullscreen) {
      return 'inset-0';
    }

    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'fullscreen': 'inset-0'
    };
    return positions[position];
  };

  // Theme classes
  const getThemeClasses = () => {
    const currentTheme = state.theme || theme;
    return currentTheme === 'dark'
      ? 'bg-gray-900 border-gray-700 text-white'
      : 'bg-white border-gray-200 text-gray-900';
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    switch (state.connectionStatus) {
      case 'connected':
        return { icon: Wifi, color: 'text-green-500', text: 'Connected' };
      case 'connecting':
        return { icon: Loader2, color: 'text-yellow-500', text: 'Connecting' };
      default:
        return { icon: WifiOff, color: 'text-red-500', text: 'Disconnected' };
    }
  };

  // Handle message sending
  const handleSendMessage = async (message: string) => {
    try {
      await actions.sendMessage(message);

      // Play sound notification if enabled
      if (soundEnabled) {
        // You could add sound effects here
        console.log('Message sent sound');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle quick action clicks
  const handleQuickAction = async (action: QuickAction) => {
    try {
      await actions.handleIntent(action.intent_type);
    } catch (error) {
      console.error('Failed to handle quick action:', error);
    }
  };

  // Handle quick reply clicks
  const handleQuickReply = async (reply: any) => {
    try {
      await actions.sendQuickReply(reply);
    } catch (error) {
      console.error('Failed to send quick reply:', error);
    }
  };

  // Handle button clicks
  const handleButtonClick = async (button: any) => {
    try {
      await actions.clickButton(button);
    } catch (error) {
      console.error('Failed to handle button click:', error);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    try {
      await actions.submitForm(data);
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  // Handle session management
  const handleStartNewSession = () => {
    actions.startSession(userId);
  };

  const handleEndSession = () => {
    actions.endSession();
    if (onSessionEnd) {
      onSessionEnd();
    }
  };

  const handleClearMessages = () => {
    actions.clearMessages();
  };

  const handleExportConversation = () => {
    const conversation = actions.exportConversation();
    const blob = new Blob([conversation], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle session events
  useEffect(() => {
    if (state.session?.session_id && onSessionStart) {
      onSessionStart(state.session.session_id);
    }
  }, [state.session?.session_id, onSessionStart]);

  useEffect(() => {
    if (state.error && onError) {
      onError(state.error);
    }
  }, [state.error, onError]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      if (e.ctrlKey && e.key === 'm' && isOpen) {
        setIsMinimized(!isMinimized);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized]);

  // Render floating button when closed
  if (!isOpen) {
    return (
      <div className={cn("fixed z-50", getPositionClasses(), className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg relative"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {state.messages.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
              {state.messages.filter(m => m.sender === 'bot' && m.status !== 'delivered').length || ''}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  const connectionStatus = getConnectionStatus();

  return (
    <div className={cn(
      "fixed z-50 flex flex-col",
      isFullscreen ? "inset-0" : getPositionClasses(),
      className
    )}>
      <Card
        ref={chatbotRef}
        className={cn(
          "shadow-xl border transition-all duration-300 flex flex-col overflow-hidden",
          getThemeClasses(),
          isMinimized ? 'h-auto' : '',
          isFullscreen ? 'h-full w-full rounded-none' : '',
          // Custom scrollbar styles
          "[&_.scroll-area]:scrollbar-thin [&_.scroll-area]:scrollbar-track-gray-100 [&_.scroll-area]:scrollbar-thumb-gray-300 [&_.scroll-area]:hover:scrollbar-thumb-gray-400"
        )}
        style={{
          width: isFullscreen ? '100%' : width,
          height: isMinimized ? 'auto' : isFullscreen ? '100%' : height
        }}
      >
        {/* Header */}
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              Medical Assistant
              {state.session && (
                <Badge variant="outline" className="text-xs">
                  {state.session.session_id.slice(-6)}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-1">
              {/* Connection status */}
              <div className="flex items-center gap-1" title={connectionStatus.text}>
                <connectionStatus.icon className={cn("h-3 w-3", connectionStatus.color)} />
              </div>

              {/* Sound toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Disable sound" : "Enable sound"}
              >
                {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </Button>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={actions.toggleTheme}
                title="Toggle theme"
              >
                {state.theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              </Button>

              {/* Fullscreen toggle */}
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={toggleFullscreen}
                  title="Fullscreen"
                >
                  <Expand className="h-3 w-3" />
                </Button>
              )}

              {isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={toggleFullscreen}
                  title="Exit fullscreen"
                >
                  <Shrink className="h-3 w-3" />
                </Button>
              )}

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings className="h-3 w-3" />
              </Button>

              {/* Minimize/Maximize */}
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
              )}

              {/* Close */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && !isMinimized && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearMessages}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartNewSession}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  New Session
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportConversation}
                  className="text-xs"
                  disabled={state.messages.length === 0}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Content */}
        {!isMinimized && (
          <>
            {/* Quick Actions (show when no messages or only greeting) */}
            {showQuickActions && state.messages.length <= 1 && state.quickActions.length > 0 && (
              <div className="px-4 pb-2 flex-shrink-0">
                <QuickActionsPanel
                  actions={state.quickActions}
                  onActionClick={handleQuickAction}
                  loading={state.isLoading}
                  userAuthenticated={userAuthenticated}
                />
              </div>
            )}

            {/* Messages Area */}
            <MessageList
              messages={state.messages}
              isTyping={state.isTyping}
              onQuickReply={handleQuickReply}
              onButtonClick={handleButtonClick}
              onRetry={actions.retryMessage}
              className="flex-1"
            />

            {/* Error Alert */}
            {state.error && (
              <div className="px-4 pb-2 flex-shrink-0">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {state.error}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto ml-2 text-red-600"
                      onClick={() => actions.retryMessage('')}
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Dynamic Form */}
            {state.currentForm && (
              <div className="p-4 border-t flex-shrink-0">
                <DynamicForm
                  fields={state.currentForm.fields}
                  title={state.currentForm.title}
                  description={state.currentForm.description}
                  onSubmit={handleFormSubmit}
                  onCancel={() => actions.clearMessages()}
                  loading={state.isLoading}
                />
              </div>
            )}

            {/* Input Area */}
            <div className="flex-shrink-0">
              <ChatInput
                onSendMessage={handleSendMessage}
                disabled={state.isLoading}
                placeholder="Type your message..."
                enableVoice={enableVoiceInput}
                enableFileUpload={enableFileUpload}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default Chatbot;
