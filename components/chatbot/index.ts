// Enhanced Chatbot Components Export Index

export { default as Chatbot } from './Chatbot';
export { default as ClientChatbot } from './ClientChatbot';
export { default as ChatMessage } from './ChatMessage';
export { default as MessageList } from './MessageList';
export { default as ChatInput } from './ChatInput';
export { default as QuickActionsPanel } from './QuickActionsPanel';
export { default as DynamicForm } from './DynamicForm';
export { default as TypingIndicator } from './TypingIndicator';

// Re-export types for convenience
export type {
  ChatMessage as ChatMessageType,
  QuickReply,
  QuickAction,
  ChatbotButton,
  FormField,
  FormSubmissionData,
  ChatbotResponse,
  IntentDetectionResponse,
  ChatbotSession,
  ChatbotState,
  ChatbotConfig,
  ChatbotIntent,
  MessageType,
  ChatbotError,
  ChatbotEvent,
  ValidationResult,
  VoiceConfig,
  ChatbotAnalytics,
  ChatMessageProps,
  MessageListProps,
  ChatInputProps,
  QuickActionsProps,
  DynamicFormProps,
  TypingIndicatorProps,
  UseChatbotReturn,
  ConversationResponse,
  HealthResponse
} from '@/types/chatbot';

// Re-export hook and context
export { useChatbot } from '@/hooks/useChatbot';
export { ChatbotProvider, useChatbotContext } from '@/contexts/ChatbotContext';

// Re-export constants
export {
  CHATBOT_INTENTS,
  RESPONSE_TYPES,
  MESSAGE_SENDERS,
  BUTTON_ACTIONS
} from '@/types/chatbot';
