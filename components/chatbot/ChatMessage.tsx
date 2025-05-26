"use client"

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Bot,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  Send,
  Loader2
} from 'lucide-react';
import { ChatMessage as ChatMessageType, QuickReply, ChatbotButton } from '@/types/chatbot';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
  onQuickReply?: (reply: QuickReply) => void;
  onButtonClick?: (button: ChatbotButton) => void;
  onRetry?: () => void;
  className?: string;
}

export function ChatMessage({
  message,
  isLatest = false,
  onQuickReply,
  onButtonClick,
  onRetry,
  className
}: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isError = message.metadata?.response_type === 'error';
  const isFailed = message.status === 'failed';
  const isSending = message.status === 'sending';
  const hasQuickReplies = message.metadata?.quick_replies && message.metadata.quick_replies.length > 0;
  const hasButtons = message.metadata?.buttons && message.metadata.buttons.length > 0;

  const formatTimestamp = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'sent':
        return <Send className="h-3 w-3" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    // Handle different response types
    switch (message.metadata?.response_type) {
      case 'error':
        return (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm prose prose-sm max-w-none">
                <ReactMarkdown>
                  {message.message}
                </ReactMarkdown>
              </div>
              {message.metadata?.entities?.error_code && (
                <p className="text-xs text-red-400 mt-1">
                  Error Code: {message.metadata.entities.error_code}
                </p>
              )}
            </div>
          </div>
        );

      case 'form_guidance':
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm prose prose-sm max-w-none">
                <ReactMarkdown>
                  {message.message}
                </ReactMarkdown>
              </div>
            </div>
            {message.metadata?.required_fields && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-2">
                  Required information:
                </p>
                <div className="flex flex-wrap gap-1">
                  {message.metadata.required_fields.map((field, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {field.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'redirect':
        return (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm prose prose-sm max-w-none">
                <ReactMarkdown>
                  {message.message}
                </ReactMarkdown>
              </div>
            </div>
            {message.metadata?.api_endpoint && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-700">
                  Redirecting to: {message.metadata.api_endpoint}
                </p>
              </div>
            )}
          </div>
        );

      case 'greeting':
        return (
          <div className="flex items-start gap-2">
            <Bot className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown>
                {message.message}
              </ReactMarkdown>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-start gap-2">
            {!isUser && (
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-sm prose prose-sm max-w-none">
              <ReactMarkdown>
                {message.message}
              </ReactMarkdown>
            </div>
          </div>
        );
    }
  };

  const renderButtons = () => {
    if (!hasButtons || !onButtonClick) return null;

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-500 font-medium">Actions:</p>
        <div className="flex flex-wrap gap-2">
          {message.metadata!.buttons!.map((button, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              className="text-xs h-7 px-3 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => onButtonClick(button)}
            >
              {button.text}
              {button.action === 'redirect' && <ArrowRight className="h-3 w-3 ml-1" />}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickReplies = () => {
    if (!hasQuickReplies || !onQuickReply) return null;

    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-gray-500 font-medium">Quick replies:</p>
        <div className="flex flex-wrap gap-2">
          {message.metadata!.quick_replies!.map((reply, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300"
              onClick={() => onQuickReply(reply)}
            >
              {reply.icon && <span className="mr-1">{reply.icon}</span>}
              {reply.text}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderMetadata = () => {
    if (!message.metadata || isUser) return null;

    const { intent, confidence, entities } = message.metadata;

    return (
      <div className="mt-2 space-y-1">
        {intent && (
          <Badge variant="secondary" className="text-xs">
            Intent: {intent}
          </Badge>
        )}
        {confidence !== undefined && confidence < 0.8 && (
          <Badge variant="outline" className="text-xs text-orange-600">
            Low confidence: {Math.round(confidence * 100)}%
          </Badge>
        )}
        {entities?.reference_number && (
          <Badge variant="outline" className="text-xs">
            Ref: {entities.reference_number}
          </Badge>
        )}
        {entities?.status && (
          <Badge
            variant={entities.status === 'resolved' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {entities.status}
          </Badge>
        )}
      </div>
    );
  };

  const renderRetryButton = () => {
    if (!isFailed || !onRetry) return null;

    return (
      <div className="mt-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-6 px-2 text-red-600 border-red-300 hover:bg-red-50"
          onClick={onRetry}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex mb-4",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%] space-y-1",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message bubble */}
        <Card className={cn(
          "shadow-sm border transition-all duration-200",
          isUser
            ? "bg-blue-600 text-white border-blue-600"
            : isError
            ? "bg-red-50 text-red-800 border-red-200"
            : "bg-white text-gray-800 border-gray-200",
          isSending && "opacity-70",
          isFailed && "border-red-300 bg-red-50"
        )}>
          <CardContent className="p-3">
            {renderMessageContent()}
          </CardContent>
        </Card>

        {/* Buttons */}
        {renderButtons()}

        {/* Quick replies */}
        {renderQuickReplies()}

        {/* Metadata */}
        {renderMetadata()}

        {/* Retry button */}
        {renderRetryButton()}

        {/* Timestamp and sender info */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-gray-500",
          isUser ? "justify-end" : "justify-start"
        )}>
          {isUser ? (
            <User className="h-3 w-3" />
          ) : (
            <Bot className="h-3 w-3" />
          )}
          <span>{isUser ? 'You' : 'Assistant'}</span>
          <Clock className="h-3 w-3" />
          <span>{formatTimestamp(message.timestamp)}</span>
          {isUser && getStatusIcon()}
        </div>

        {/* Session info for debugging (only show for latest message in dev) */}
        {process.env.NODE_ENV === 'development' && isLatest && (
          <div className="text-xs text-gray-400 space-y-1">
            {message.session_id && (
              <div>Session: {message.session_id.slice(-8)}</div>
            )}
            {message.conversation_id && (
              <div>Conversation: {message.conversation_id.slice(-8)}</div>
            )}
            {message.metadata?.confidence && (
              <div>Confidence: {Math.round(message.metadata.confidence * 100)}%</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
