"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import {
  ChatbotState,
  ChatMessage,
  ChatbotSession,
  QuickAction,
  QuickReply,
  ChatbotButton,
  FormSubmissionData,
  ChatbotEvent,
  MessageType,
  ChatbotConfig,
  MESSAGE_SENDERS,
  CHATBOT_INTENTS
} from '@/types/chatbot';

// Action Types
type ChatbotAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_SESSION'; payload: ChatbotSession | null }
  | { type: 'SET_QUICK_ACTIONS'; payload: QuickAction[] }
  | { type: 'SET_CURRENT_FORM'; payload: ChatbotState['currentForm'] }
  | { type: 'SET_CONNECTION_STATUS'; payload: ChatbotState['connectionStatus'] }
  | { type: 'TOGGLE_THEME' }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'CLEAR_ERROR' };

// Initial State
const initialState: ChatbotState = {
  messages: [],
  session: null,
  isLoading: false,
  isTyping: false,
  error: null,
  quickActions: [],
  currentForm: null,
  connectionStatus: 'disconnected',
  theme: 'light'
};

// Reducer
function chatbotReducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'SET_SESSION':
      return { ...state, session: action.payload };

    case 'SET_QUICK_ACTIONS':
      return { ...state, quickActions: action.payload };

    case 'SET_CURRENT_FORM':
      return { ...state, currentForm: action.payload };

    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };

    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], currentForm: null, error: null };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// Context Interface
interface ChatbotContextType {
  state: ChatbotState;
  dispatch: React.Dispatch<ChatbotAction>;

  // Utility functions
  generateSessionId: () => string;
  generateMessageId: () => string;
  formatMessage: (text: string) => string;
  saveSession: (session: ChatbotSession) => void;
  loadSession: () => ChatbotSession | null;
  trackEvent: (event: ChatbotEvent) => void;

  // Message helpers
  addMessage: (message: string, sender: 'user' | 'bot', metadata?: ChatMessage['metadata']) => ChatMessage;
  updateMessageStatus: (messageId: string, status: ChatMessage['status']) => void;

  // Session helpers
  createSession: (userId?: string) => ChatbotSession;
  updateSession: (updates: Partial<ChatbotSession>) => void;

  // Storage helpers
  persistState: () => void;
  restoreState: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'chatbot_session',
  MESSAGES: 'chatbot_messages',
  THEME: 'chatbot_theme',
  CONFIG: 'chatbot_config'
};

// Provider Component
interface ChatbotProviderProps {
  children: ReactNode;
  config?: ChatbotConfig;
}

export function ChatbotProvider({ children, config = {} }: ChatbotProviderProps) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // Utility functions
  const generateSessionId = () => {
    // Use crypto.randomUUID() if available, fallback to custom implementation
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateMessageId = () => generateSessionId();

  const formatMessage = (text: string) => {
    return text.trim();
  };

  const saveSession = (session: ChatbotSession) => {
    if (typeof window === 'undefined' || config.persistSession === false) return;

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
        ...session,
        created_at: session.created_at.toISOString(),
        last_activity: session.last_activity.toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save session to localStorage:', error);
    }
  };

  const loadSession = (): ChatbotSession | null => {
    if (typeof window === 'undefined' || config.persistSession === false) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          created_at: new Date(parsed.created_at),
          last_activity: new Date(parsed.last_activity)
        };
      }
    } catch (error) {
      console.warn('Failed to load session from localStorage:', error);
    }
    return null;
  };

  const trackEvent = (event: ChatbotEvent) => {
    // Analytics tracking - can be extended with external services
    console.log('Chatbot Event:', event);

    // Could integrate with analytics services here
    // Example: analytics.track(event.type, event.payload);
  };

  // Message helpers
  const addMessage = (
    message: string,
    sender: 'user' | 'bot',
    metadata?: ChatMessage['metadata']
  ): ChatMessage => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      message: formatMessage(message),
      sender,
      timestamp: new Date(),
      session_id: state.session?.session_id,
      conversation_id: state.session?.conversation_id,
      status: sender === 'user' ? 'sending' : 'delivered',
      metadata
    };

    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });

    // Track event
    trackEvent({
      type: 'message_sent',
      payload: {
        sender,
        message_length: message.length,
        has_metadata: !!metadata
      },
      timestamp: new Date(),
      session_id: state.session?.session_id,
      user_id: state.session?.user_context?.user_id
    });

    return newMessage;
  };

  const updateMessageStatus = (messageId: string, status: ChatMessage['status']) => {
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: { id: messageId, updates: { status } }
    });
  };

  // Session helpers
  const createSession = (userId?: string): ChatbotSession => {
    const session: ChatbotSession = {
      session_id: generateSessionId(),
      conversation_id: generateSessionId(),
      user_context: userId ? { user_id: userId } : undefined,
      created_at: new Date(),
      last_activity: new Date(),
      messages: []
    };

    dispatch({ type: 'SET_SESSION', payload: session });
    saveSession(session);

    // Track session start
    trackEvent({
      type: 'session_started',
      payload: { user_id: userId },
      timestamp: new Date(),
      session_id: session.session_id,
      user_id: userId
    });

    return session;
  };

  const updateSession = (updates: Partial<ChatbotSession>) => {
    if (!state.session) return;

    const updatedSession = {
      ...state.session,
      ...updates,
      last_activity: new Date()
    };

    dispatch({ type: 'SET_SESSION', payload: updatedSession });
    saveSession(updatedSession);
  };

  // Storage helpers
  const persistState = () => {
    if (typeof window === 'undefined') return;

    try {
      if (config.persistSession !== false) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(
          state.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          }))
        ));
        localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
      }
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  };

  const restoreState = () => {
    // Only run on client side to avoid hydration mismatches
    if (typeof window === 'undefined') return;

    try {
      if (config.persistSession === false) return;

      // Restore session
      const session = loadSession();
      if (session) {
        dispatch({ type: 'SET_SESSION', payload: session });
      }

      // Restore messages
      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (storedMessages) {
        const messages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        dispatch({ type: 'SET_MESSAGES', payload: messages });
      }

      // Restore theme
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        dispatch({ type: 'TOGGLE_THEME' });
      }
    } catch (error) {
      console.warn('Failed to restore state:', error);
    }
  };

  // Auto-save state changes
  useEffect(() => {
    persistState();
  }, [state.messages, state.theme, state.session]);

  // Initialize state on mount
  useEffect(() => {
    restoreState();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.session) {
        trackEvent({
          type: 'session_ended',
          payload: {
            duration: Date.now() - state.session.created_at.getTime(),
            messages_count: state.messages.length
          },
          timestamp: new Date(),
          session_id: state.session.session_id,
          user_id: state.session.user_context?.user_id
        });
      }
    };
  }, []);

  const contextValue: ChatbotContextType = {
    state,
    dispatch,
    generateSessionId,
    generateMessageId,
    formatMessage,
    saveSession,
    loadSession,
    trackEvent,
    addMessage,
    updateMessageStatus,
    createSession,
    updateSession,
    persistState,
    restoreState
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
}

// Hook to use chatbot context
export function useChatbotContext() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
}

export default ChatbotContext;
