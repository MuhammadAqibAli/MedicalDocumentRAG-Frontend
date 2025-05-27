import { useState, useCallback } from 'react';
import { SIMPLE_CHATBOT_CONFIG } from '@/lib/chatbot-config';

// Mock responses for when backend is not available
const getMockResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('complaint') || lowerMessage.includes('register')) {
    return {
      message: "I understand you'd like to register a complaint. I can help guide you to the complaint form where you can provide all the necessary details.",
      buttons: [
        { text: 'Register Complaint', value: 'complaint_form', action: 'redirect', url: '/patient-management/add' },
        { text: 'Learn More', value: 'complaint_info', action: 'intent' }
      ],
      quick_replies: ['Register Complaint', 'Check Status', 'Submit Feedback']
    };
  }

  if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
    return {
      message: "I can help you check the status of your complaint. You can search by reference number or patient details.",
      buttons: [
        { text: 'Check Status', value: 'status_check', action: 'redirect', url: '/patient-management' },
        { text: 'Help', value: 'help', action: 'intent' }
      ],
      quick_replies: ['Check Status', 'Register Complaint', 'Submit Feedback']
    };
  }

  if (lowerMessage.includes('feedback') || lowerMessage.includes('review')) {
    return {
      message: "Thank you for wanting to provide feedback! Your feedback helps us improve our healthcare services.",
      buttons: [
        { text: 'Submit Feedback', value: 'feedback_form', action: 'redirect', url: '/patient-management/add' },
        { text: 'View Guidelines', value: 'feedback_info', action: 'intent' }
      ],
      quick_replies: ['Submit Feedback', 'Register Complaint', 'Check Status']
    };
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return {
      message: "Hello! I'm your medical assistant. I can help you with:\n\n• Register medical complaints\n• Check complaint status\n• Submit feedback about healthcare services\n\nHow can I assist you today?",
      buttons: [
        { text: 'Register Complaint', value: 'complaint', action: 'intent' },
        { text: 'Check Status', value: 'status', action: 'intent' },
        { text: 'Submit Feedback', value: 'feedback', action: 'intent' }
      ],
      quick_replies: ['Register Complaint', 'Check Status', 'Submit Feedback']
    };
  }

  // Default response
  return {
    message: "I'm here to help with medical complaints, status checks, and feedback submission. Could you please clarify what you'd like to do?",
    buttons: [
      { text: 'Register Complaint', value: 'complaint', action: 'intent' },
      { text: 'Check Status', value: 'status', action: 'intent' },
      { text: 'Submit Feedback', value: 'feedback', action: 'intent' }
    ],
    quick_replies: ['Help', 'Register Complaint', 'Check Status']
  };
};

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  buttons?: Array<{
    text: string;
    value: string;
    action: 'intent' | 'redirect' | 'input';
    url?: string;
  }>;
  quickReplies?: string[];
  metadata?: any;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() =>
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Add initial greeting message
  const addInitialGreeting = useCallback(() => {
    if (messages.length === 0) {
      const greetingResponse = getMockResponse('hello');
      const greetingMessage: ChatMessage = {
        id: `greeting-${Date.now()}`,
        type: 'bot',
        content: greetingResponse.message,
        timestamp: new Date(),
        buttons: greetingResponse.buttons || [],
        quickReplies: greetingResponse.quick_replies || []
      };
      setMessages([greetingMessage]);
    }
  }, [messages.length]);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const apiUrl = `${SIMPLE_CHATBOT_CONFIG.apiBaseUrl}${SIMPLE_CHATBOT_CONFIG.endpoints.message}`;
      console.log('Sending message to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          session_id: sessionId
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Check if it's a network error or server error
        if (response.status === 0 || !response.status) {
          throw new Error('Network error - Backend server may not be running');
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Add bot response
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: data.message || 'I received your message but had trouble processing it.',
        timestamp: new Date(),
        buttons: data.buttons || [],
        quickReplies: data.quick_replies || [],
        metadata: data.metadata || {}
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);

      // Determine error type and provide appropriate response
      let errorContent = 'I apologize, but I encountered an error. ';
      let buttons = [];

      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Backend is offline - use mock response instead
        console.log('Backend offline, using mock response for:', content);
        const mockResponse = getMockResponse(content);

        const mockMessage: ChatMessage = {
          id: `mock-${Date.now()}`,
          type: 'bot',
          content: `🔧 Backend Offline - Demo Mode\n\n${mockResponse.message}`,
          timestamp: new Date(),
          buttons: mockResponse.buttons || [],
          quickReplies: mockResponse.quick_replies || []
        };

        setMessages(prev => [...prev, mockMessage]);
        return; // Exit early, don't show error message
      } else if (error instanceof Error && error.message.includes('Network error')) {
        errorContent += 'Cannot connect to the backend server. Using demo mode for now.';

        // Also provide mock response
        const mockResponse = getMockResponse(content);
        const mockMessage: ChatMessage = {
          id: `mock-${Date.now()}`,
          type: 'bot',
          content: `🔧 Demo Mode\n\n${mockResponse.message}`,
          timestamp: new Date(),
          buttons: mockResponse.buttons || [],
          quickReplies: mockResponse.quick_replies || []
        };

        setMessages(prev => [...prev, mockMessage]);
        return; // Exit early
      } else {
        errorContent += 'Please try again or contact support.';
        buttons = [
          { text: 'Try Again', value: content, action: 'intent' },
          { text: 'Contact Support', value: 'support', action: 'redirect', url: '/support' }
        ];
      }

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
        buttons: buttons
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const handleButtonClick = useCallback((button: any) => {
    if (button.action === 'redirect' && button.url) {
      window.location.href = button.url;
    } else if (button.action === 'intent') {
      sendMessage(button.value);
    }
  }, [sendMessage]);

  const handleQuickReply = useCallback((reply: string) => {
    sendMessage(reply);
  }, [sendMessage]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    handleButtonClick,
    handleQuickReply,
    clearConversation,
    addInitialGreeting,
    sessionId
  };
};
