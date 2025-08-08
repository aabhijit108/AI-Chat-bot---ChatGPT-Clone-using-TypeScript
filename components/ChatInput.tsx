
'use client';

import { useState, KeyboardEvent } from 'react';
import ModelSelector from './ModelSelector';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  userModelApiKeys?: any[];
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  loading = false,
  selectedModel,
  onModelChange,
  userModelApiKeys = []
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !loading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1">
            <div className="relative border border-gray-300 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={disabled || loading}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed bg-transparent rounded-t-2xl text-sm sm:text-base"
                rows={1}
                style={{ 
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: 'auto',
                  overflowY: message.length > 100 ? 'auto' : 'hidden'
                }}
              />
              
              {/* Model Selector below text input */}
              <div className="px-3 sm:px-4 py-2 border-t border-gray-200">
                <div className="w-full sm:w-48">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                    userModelApiKeys={userModelApiKeys}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled || loading}
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <i className="ri-send-plane-line"></i>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
