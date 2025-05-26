// Enhanced Chatbot Types and Interfaces

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  session_id?: string;
  conversation_id?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: Record<string, any>;
    response_type?: string;
    quick_replies?: QuickReply[];
    buttons?: ChatbotButton[];
    form_fields?: FormField[];
    redirect_url?: string;
    api_endpoint?: string;
    method?: string;
    required_fields?: string[];
  };
}

export interface QuickReply {
  id?: string;
  text: string;
  intent?: string;
  payload?: Record<string, any>;
  icon?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  button_text: string;
  icon: string;
  intent_type: string;
  requires_auth: boolean;
}

export interface ChatbotButton {
  text: string;
  value: string;
  action?: 'redirect' | 'intent' | 'info' | 'input';
  icon?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ChatbotResponse {
  message: string;
  response_type: 'greeting' | 'form_guidance' | 'redirect' | 'error' | 'text';
  buttons?: ChatbotButton[];
  quick_replies?: string[];
  intent_detected: string;
  confidence_score: number;
  session_id: string;
  conversation_id: string;
  metadata?: {
    api_endpoint?: string;
    method?: string;
    required_fields?: string[];
    [key: string]: any;
  };
}

export interface IntentDetectionResponse {
  intent_type: string;
  confidence_score: number;
  intent_name: string;
  intent_description: string;
  api_endpoint?: string;
}

export interface ChatbotSession {
  session_id: string;
  conversation_id?: string;
  user_context?: {
    user_id?: string;
    preferences?: Record<string, any>;
  };
  created_at: Date;
  last_activity: Date;
  messages: ChatMessage[];
}

export interface ChatbotState {
  messages: ChatMessage[];
  session: ChatbotSession | null;
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  quickActions: QuickAction[];
  currentForm: {
    fields: FormField[];
    title?: string;
    description?: string;
  } | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  theme: 'light' | 'dark';
}

export interface ChatbotConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'fullscreen';
  theme?: 'light' | 'dark' | 'auto';
  width?: number;
  height?: number;
  minimized?: boolean;
  showQuickActions?: boolean;
  enableVoiceInput?: boolean;
  enableFileUpload?: boolean;
  confidenceThreshold?: number;
  typingDelay?: number;
  autoGreeting?: boolean;
  greetingMessage?: string;
  persistSession?: boolean;
  maxMessages?: number;
}

// API Request/Response Types
export interface ChatbotMessageRequest {
  message: string;
  session_id?: string;
  user_context?: {
    user_id?: string;
  };
}

export interface IntentDetectionRequest {
  message: string;
}

export interface HandleIntentRequest {
  intent_type: string;
  session_id?: string;
  parameters?: Record<string, any>;
}

export interface QuickActionsResponse {
  quick_actions: QuickAction[];
  count: number;
}

export interface ConversationResponse {
  id: string;
  session_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  status: 'active' | 'completed' | 'archived';
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  statistics?: {
    active_intents: number;
    active_responses: number;
    active_quick_actions: number;
  };
}

// Utility Types
export type ChatbotIntent =
  | 'greeting'
  | 'complaint_register'
  | 'complaint_status'
  | 'feedback_submit'
  | 'document_upload'
  | 'content_generate'
  | 'audit_questions'
  | 'general_inquiry'
  | 'help'
  | 'goodbye'
  | 'unknown';

export type MessageType = 'text' | 'quick_reply' | 'form_submission' | 'file_upload' | 'button_click';

export interface ChatbotError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Event Types for Analytics
export interface ChatbotEvent {
  type: 'message_sent' | 'intent_detected' | 'form_submitted' | 'quick_action_clicked' | 'session_started' | 'session_ended' | 'error_occurred';
  payload: Record<string, any>;
  timestamp: Date;
  session_id?: string;
  user_id?: string;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormSubmissionData {
  [fieldName: string]: any;
}

// Voice Input Types
export interface VoiceConfig {
  enabled: boolean;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

// Analytics Types
export interface ChatbotAnalytics {
  session_id: string;
  user_id?: string;
  messages_count: number;
  intents_detected: string[];
  forms_completed: number;
  session_duration: number;
  satisfaction_score?: number;
  completion_rate: number;
}

// Component Props Types
export interface ChatMessageProps {
  message: ChatMessage;
  isLatest?: boolean;
  onQuickReply?: (reply: QuickReply) => void;
  onButtonClick?: (button: ChatbotButton) => void;
  onRetry?: () => void;
}

export interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onQuickReply?: (reply: QuickReply) => void;
  onButtonClick?: (button: ChatbotButton) => void;
  onRetry?: (messageId: string) => void;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  loading?: boolean;
  userAuthenticated?: boolean;
}

export interface TypingIndicatorProps {
  visible: boolean;
  message?: string;
}

export interface DynamicFormProps {
  fields: FormField[];
  title?: string;
  description?: string;
  onSubmit: (data: FormSubmissionData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

// Hook Types
export interface UseChatbotReturn {
  state: ChatbotState;
  actions: {
    sendMessage: (message: string, type?: MessageType) => Promise<void>;
    sendQuickReply: (reply: QuickReply) => Promise<void>;
    clickButton: (button: ChatbotButton) => Promise<void>;
    submitForm: (data: FormSubmissionData) => Promise<void>;
    detectIntent: (message: string) => Promise<IntentDetectionResponse>;
    handleIntent: (intent: string, parameters?: Record<string, any>) => Promise<void>;
    loadQuickActions: () => Promise<void>;
    startSession: (userId?: string) => void;
    endSession: () => void;
    clearMessages: () => void;
    retryMessage: (messageId: string) => Promise<void>;
    toggleTheme: () => void;
    exportConversation: () => string;
  };
  utils: {
    generateSessionId: () => string;
    generateConversationId: () => string;
    formatMessage: (text: string) => string;
    validateForm: (data: FormSubmissionData, fields: FormField[]) => ValidationResult;
    saveSession: () => void;
    loadSession: () => ChatbotSession | null;
  };
}

// Constants
export const CHATBOT_INTENTS = {
  GREETING: 'greeting',
  COMPLAINT_REGISTER: 'complaint_register',
  COMPLAINT_STATUS: 'complaint_status',
  FEEDBACK_SUBMIT: 'feedback_submit',
  DOCUMENT_UPLOAD: 'document_upload',
  CONTENT_GENERATE: 'content_generate',
  AUDIT_QUESTIONS: 'audit_questions',
  GENERAL_INQUIRY: 'general_inquiry',
  HELP: 'help',
  GOODBYE: 'goodbye',
  UNKNOWN: 'unknown'
} as const;

export const RESPONSE_TYPES = {
  GREETING: 'greeting',
  FORM_GUIDANCE: 'form_guidance',
  REDIRECT: 'redirect',
  ERROR: 'error',
  TEXT: 'text'
} as const;

export const MESSAGE_SENDERS = {
  USER: 'user',
  BOT: 'bot'
} as const;

export const BUTTON_ACTIONS = {
  REDIRECT: 'redirect',
  INTENT: 'intent',
  INFO: 'info',
  INPUT: 'input'
} as const;
