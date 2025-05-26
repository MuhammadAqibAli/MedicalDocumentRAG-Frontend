"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Loader2,
  Smile,
  X
} from 'lucide-react';
import { ChatInputProps } from '@/types/chatbot';
import { cn } from '@/lib/utils';

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  enableVoice = false,
  enableFileUpload = false,
  className
}: ChatInputProps & { className?: string }) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Handle message change
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, disabled, onSendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Voice recording functions
  const startRecording = useCallback(async () => {
    if (!enableVoice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        console.log('Audio recorded:', audioBlob);

        // For demo purposes, we'll just add a placeholder message
        setMessage(prev => prev + '[Voice message recorded]');

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [enableVoice]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // File upload functions
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Here you would upload the file to your backend
      console.log('Uploading file:', selectedFile);

      // For demo purposes, we'll just add a message about the file
      const fileMessage = `📎 Uploaded: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`;
      onSendMessage(fileMessage);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onSendMessage]);

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Adjust height on mount
  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={cn("border-t bg-white p-4", className)}>
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleFileUpload}
              disabled={isUploading}
              className="h-6 px-2 text-xs"
            >
              {isUploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Upload'
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={removeSelectedFile}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-2">
        {/* File upload button */}
        {enableFileUpload && (
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-10 w-10"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Please wait..." : placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none pr-12 py-2 chatbot-scrollbar chatbot-scroll-area"
            rows={1}
          />

          {/* Emoji button (placeholder for future emoji picker) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            disabled={disabled}
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice recording button */}
        {enableVoice && (
          <div className="flex-shrink-0">
            <Button
              variant={isRecording ? "destructive" : "ghost"}
              size="icon"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={disabled}
              className="h-10 w-10"
              title={isRecording ? "Release to stop recording" : "Hold to record"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Send button */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleSendMessage}
            disabled={!canSend}
            size="icon"
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            title="Send message"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Character count and hints */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          {message.length > 0 && (
            <span>{message.length} characters</span>
          )}
          {enableVoice && (
            <span>Hold mic to record</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Press Enter to send</span>
          {message.length > 500 && (
            <span className="text-orange-500">
              Long message ({message.length}/1000)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
