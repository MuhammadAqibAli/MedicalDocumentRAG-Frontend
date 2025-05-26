import { useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { useChatbotContext } from '@/contexts/ChatbotContext';
import {
  ChatbotResponse,
  IntentDetectionResponse,
  QuickReply,
  ChatbotButton,
  FormSubmissionData,
  FormField,
  ValidationResult,
  UseChatbotReturn,
  MessageType,
  CHATBOT_INTENTS,
  MESSAGE_SENDERS,
  BUTTON_ACTIONS
} from '@/types/chatbot';

const CONFIDENCE_THRESHOLD = 0.5;
const TYPING_DELAY = 1500;
const MAX_RETRY_ATTEMPTS = 3;

export function useChatbot(config?: {
  userId?: string;
  autoGreeting?: boolean;
  confidenceThreshold?: number;
}): UseChatbotReturn {
  const {
    state,
    dispatch,
    addMessage,
    updateMessageStatus,
    createSession,
    updateSession,
    trackEvent,
    generateSessionId,
    generateMessageId,
    formatMessage
  } = useChatbotContext();

  const router = useRouter();
  const retryMessageRef = useRef<string | null>(null);
  const retryCountRef = useRef<number>(0);
  const confidenceThreshold = config?.confidenceThreshold ?? CONFIDENCE_THRESHOLD;

  // Connection status check
  const checkConnection = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
      await apiService.chatbotHealth();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
      return false;
    }
  }, [dispatch]);

  // Show typing indicator
  const showTypingIndicator = useCallback(() => {
    dispatch({ type: 'SET_TYPING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_TYPING', payload: false });
    }, TYPING_DELAY);
  }, [dispatch]);

  // Form validation
  const validateForm = useCallback((data: FormSubmissionData, fields: FormField[]): ValidationResult => {
    const errors: Record<string, string> = {};

    fields.forEach(field => {
      const value = data[field.name];

      // Required field validation
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field.name] = `${field.label} is required`;
        return;
      }

      // Skip validation if field is empty and not required
      if (!value) return;

      // Type-specific validation
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.name] = 'Please enter a valid email address';
          }
          break;

        case 'tel':
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            errors[field.name] = 'Please enter a valid phone number';
          }
          break;

        case 'text':
        case 'textarea':
          if (field.validation?.minLength && value.length < field.validation.minLength) {
            errors[field.name] = `Minimum ${field.validation.minLength} characters required`;
          }
          if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            errors[field.name] = `Maximum ${field.validation.maxLength} characters allowed`;
          }
          if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
            errors[field.name] = 'Please enter a valid format';
          }
          break;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Handle button clicks
  const handleButtonAction = useCallback(async (button: ChatbotButton) => {
    switch (button.action) {
      case BUTTON_ACTIONS.REDIRECT:
        // Handle navigation based on button value
        switch (button.value) {
          case 'start_complaint_form':
            router.push('/complaints/new');
            break;
          case 'start_feedback_form':
            router.push('/feedback/new');
            break;
          case 'start_upload':
            router.push('/upload');
            break;
          default:
            console.log('Unknown redirect:', button.value);
        }
        break;

      case BUTTON_ACTIONS.INTENT:
        await handleIntent(button.value);
        break;

      case BUTTON_ACTIONS.INFO:
        // Show info modal or message
        addMessage(`Here's more information about: ${button.text}`, MESSAGE_SENDERS.BOT);
        break;

      case BUTTON_ACTIONS.INPUT:
        // Request specific input
        addMessage(`Please provide: ${button.text}`, MESSAGE_SENDERS.BOT);
        break;

      default:
        console.log('Unknown button action:', button.action);
    }
  }, [router, addMessage]);

  // Send message to backend
  const sendMessage = useCallback(async (message: string, type: MessageType = 'text') => {
    if (!state.session) {
      createSession(config?.userId);
      return;
    }

    const userMessage = addMessage(message, MESSAGE_SENDERS.USER);
    retryMessageRef.current = message;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    showTypingIndicator();

    try {
      const response = await apiService.chatbotMessage({
        message: formatMessage(message),
        session_id: state.session.session_id,
        user_context: state.session.user_context
      });

      const botResponse: ChatbotResponse = response.data;

      // Update session with response data
      updateSession({
        conversation_id: botResponse.conversation_id,
        last_activity: new Date()
      });

      // Convert backend buttons to quick replies format
      const quickReplies = botResponse.buttons?.map(button => ({
        id: button.value,
        text: button.text,
        intent: button.value,
        payload: { action: button.action }
      })) || [];

      // Add quick replies from backend
      if (botResponse.quick_replies) {
        botResponse.quick_replies.forEach(reply => {
          quickReplies.push({
            id: reply,
            text: reply,
            intent: reply.toLowerCase().replace(/\s+/g, '_')
          });
        });
      }

      // Add bot message with backend response format
      const botMessage = addMessage(botResponse.message, MESSAGE_SENDERS.BOT, {
        response_type: botResponse.response_type,
        quick_replies: quickReplies,
        buttons: botResponse.buttons,
        intent: botResponse.intent_detected,
        confidence: botResponse.confidence_score,
        entities: botResponse.metadata
      });

      // Handle different response types
      switch (botResponse.response_type) {
        case 'form_guidance':
          if (botResponse.metadata?.required_fields) {
            // Convert required fields to form fields format
            const formFields = botResponse.metadata.required_fields.map(fieldName => ({
              name: fieldName,
              type: 'text' as const,
              label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              required: true,
              placeholder: `Enter ${fieldName.replace(/_/g, ' ')}`
            }));

            dispatch({
              type: 'SET_CURRENT_FORM',
              payload: {
                fields: formFields,
                title: 'Required Information',
                description: botResponse.message
              }
            });
          }
          break;

        case 'redirect':
          if (botResponse.metadata?.api_endpoint) {
            console.log('Redirect to:', botResponse.metadata.api_endpoint);
            // Could implement navigation logic here
          }
          break;
      }

      // Update message status
      updateMessageStatus(userMessage.id, 'delivered');
      retryMessageRef.current = null;
      retryCountRef.current = 0;

      // Track successful message
      trackEvent({
        type: 'message_sent',
        payload: {
          intent: botResponse.intent_detected,
          confidence: botResponse.confidence_score,
          response_type: botResponse.response_type
        },
        timestamp: new Date(),
        session_id: state.session.session_id,
        user_id: state.session.user_context?.user_id
      });

    } catch (error: any) {
      console.error('Chatbot message error:', error);
      const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      
      addMessage(errorMessage, MESSAGE_SENDERS.BOT, {
        response_type: 'error'
      });

      updateMessageStatus(userMessage.id, 'failed');
      dispatch({ type: 'SET_ERROR', payload: errorMessage });

      // Track error
      trackEvent({
        type: 'error_occurred',
        payload: {
          error_message: errorMessage,
          original_message: message
        },
        timestamp: new Date(),
        session_id: state.session?.session_id,
        user_id: state.session?.user_context?.user_id
      });

    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.session, addMessage, updateMessageStatus, updateSession, showTypingIndicator, formatMessage, config?.userId, createSession, dispatch, trackEvent]);

  // Detect intent
  const detectIntent = useCallback(async (message: string): Promise<IntentDetectionResponse> => {
    const response = await apiService.chatbotIntentDetect({
      message: formatMessage(message)
    });

    return response.data;
  }, [formatMessage]);

  // Handle specific intent
  const handleIntent = useCallback(async (intentType: string, parameters?: Record<string, any>) => {
    if (!state.session) {
      createSession(config?.userId);
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    showTypingIndicator();

    try {
      const response = await apiService.chatbotHandleIntent({
        intent_type: intentType,
        session_id: state.session.session_id,
        parameters
      });

      const botResponse: ChatbotResponse = response.data;

      // Update session
      updateSession({
        conversation_id: botResponse.conversation_id,
        last_activity: new Date()
      });

      // Convert backend buttons to quick replies format
      const quickReplies = botResponse.buttons?.map(button => ({
        id: button.value,
        text: button.text,
        intent: button.value,
        payload: { action: button.action }
      })) || [];

      // Add bot message
      addMessage(botResponse.message, MESSAGE_SENDERS.BOT, {
        response_type: botResponse.response_type,
        quick_replies: quickReplies,
        buttons: botResponse.buttons,
        intent: botResponse.intent_detected,
        confidence: botResponse.confidence_score,
        entities: botResponse.metadata
      });

      // Handle response types
      switch (botResponse.response_type) {
        case 'form_guidance':
          if (botResponse.metadata?.required_fields) {
            const formFields = botResponse.metadata.required_fields.map(fieldName => ({
              name: fieldName,
              type: 'text' as const,
              label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              required: true,
              placeholder: `Enter ${fieldName.replace(/_/g, ' ')}`
            }));

            dispatch({
              type: 'SET_CURRENT_FORM',
              payload: {
                fields: formFields,
                title: 'Required Information',
                description: botResponse.message
              }
            });
          }
          break;

        case 'redirect':
          if (botResponse.metadata?.api_endpoint) {
            console.log('Redirect to:', botResponse.metadata.api_endpoint);
          }
          break;
      }

      // Track intent handling
      trackEvent({
        type: 'intent_detected',
        payload: {
          intent: intentType,
          confidence: botResponse.confidence_score
        },
        timestamp: new Date(),
        session_id: state.session.session_id,
        user_id: state.session.user_context?.user_id
      });

    } catch (error: any) {
      console.error('Handle intent error:', error);
      const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error handling your request.';
      
      addMessage(errorMessage, MESSAGE_SENDERS.BOT, {
        response_type: 'error'
      });

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.session, addMessage, updateSession, showTypingIndicator, config?.userId, createSession, dispatch, trackEvent]);

  // Send quick reply
  const sendQuickReply = useCallback(async (reply: QuickReply) => {
    // Add user message for the quick reply
    addMessage(reply.text, MESSAGE_SENDERS.USER);

    // Handle the intent if available
    if (reply.intent) {
      await handleIntent(reply.intent, reply.payload);
    }
  }, [addMessage, handleIntent]);

  // Click button
  const clickButton = useCallback(async (button: ChatbotButton) => {
    // Add user message for button click
    addMessage(button.text, MESSAGE_SENDERS.USER);

    // Handle button action
    await handleButtonAction(button);
  }, [addMessage, handleButtonAction]);

  // Submit form
  const submitForm = useCallback(async (data: FormSubmissionData) => {
    if (!state.currentForm) return;

    // Validate form
    const validation = validateForm(data, state.currentForm.fields);
    if (!validation.isValid) {
      dispatch({ type: 'SET_ERROR', payload: 'Please correct the form errors and try again.' });
      return;
    }

    // Clear current form
    dispatch({ type: 'SET_CURRENT_FORM', payload: null });

    // Send form data as message
    const formMessage = `Form submitted with: ${Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}`;

    await sendMessage(formMessage, 'form_submission');

    // Track form submission
    trackEvent({
      type: 'form_submitted',
      payload: {
        form_fields: Object.keys(data),
        field_count: Object.keys(data).length
      },
      timestamp: new Date(),
      session_id: state.session?.session_id,
      user_id: state.session?.user_context?.user_id
    });
  }, [state.currentForm, validateForm, sendMessage, dispatch, trackEvent, state.session]);

  // Load quick actions
  const loadQuickActions = useCallback(async () => {
    try {
      const response = await apiService.chatbotQuickActions();
      // Convert backend quick actions to frontend format
      const quickActions = response.data.quick_actions?.map((action: any) => ({
        id: action.id,
        title: action.title,
        description: action.description,
        button_text: action.button_text,
        icon: action.icon,
        intent_type: action.intent_type,
        requires_auth: action.requires_auth
      })) || [];

      dispatch({ type: 'SET_QUICK_ACTIONS', payload: quickActions });
    } catch (error) {
      console.error('Failed to load quick actions:', error);
    }
  }, [dispatch]);

  // Start session
  const startSession = useCallback((userId?: string) => {
    const session = createSession(userId);
    
    // Auto-greeting if enabled
    if (config?.autoGreeting !== false) {
      setTimeout(() => {
        handleIntent(CHATBOT_INTENTS.GREETING);
      }, 500);
    }
  }, [createSession, handleIntent, config?.autoGreeting]);

  // End session
  const endSession = useCallback(() => {
    dispatch({ type: 'SET_SESSION', payload: null });
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_CURRENT_FORM', payload: null });
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  // Clear messages
  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, [dispatch]);

  // Retry message
  const retryMessage = useCallback(async (messageId: string) => {
    if (retryMessageRef.current && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
      retryCountRef.current++;
      await sendMessage(retryMessageRef.current);
    }
  }, [sendMessage]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, [dispatch]);

  // Export conversation
  const exportConversation = useCallback(() => {
    const conversation = {
      session_id: state.session?.session_id,
      created_at: state.session?.created_at,
      messages: state.messages,
      exported_at: new Date()
    };
    
    return JSON.stringify(conversation, null, 2);
  }, [state.session, state.messages]);

  // Initialize connection check and load quick actions
  useEffect(() => {
    checkConnection();
    loadQuickActions();
  }, [checkConnection, loadQuickActions]);

  // Auto-start session if none exists
  useEffect(() => {
    if (!state.session) {
      startSession(config?.userId);
    }
  }, [state.session, startSession, config?.userId]);

  return {
    state,
    actions: {
      sendMessage,
      sendQuickReply,
      clickButton,
      submitForm,
      detectIntent,
      handleIntent,
      loadQuickActions,
      startSession,
      endSession,
      clearMessages,
      retryMessage,
      toggleTheme,
      exportConversation
    },
    utils: {
      generateSessionId,
      generateConversationId: generateSessionId, // Same implementation
      formatMessage,
      validateForm,
      saveSession: () => {}, // Handled by context
      loadSession: () => null // Handled by context
    }
  };
}
