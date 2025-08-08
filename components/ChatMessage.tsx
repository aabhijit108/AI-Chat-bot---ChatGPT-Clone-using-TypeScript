'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FC } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const cleanContent = (text: string) =>
    text
      .replace(/<\|User\|>/g, '')
      .replace(/<\|Assistant\|>/g, '')
      .replace(/<\|end▁of▁sentence\|>/g, '')
      .trim();

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const CopyButton: FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-full sm:max-w-3xl w-full`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`}>
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md ${
              isUser ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
            }`}
          >
            {isUser ? (
              <i className="ri-user-line text-sm sm:text-base" />
            ) : (
              <i className="ri-robot-line text-sm sm:text-base" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base shadow-md ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-500 underline hover:text-blue-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                code({ node, inline, className, children, ...props }) {
                  const codeText = String(children).trim();
                  const isFencedBlockWithLang = !inline && className?.startsWith('language-');

                  if (inline || !isFencedBlockWithLang) {
                    return (
                      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-sm">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative group">
                      <pre className="bg-gray-900 text-white p-4 rounded-xl overflow-x-auto text-sm">
                        <code className={className} {...props}>
                          {codeText}
                        </code>
                      </pre>
                      <CopyButton code={codeText} />
                    </div>
                  );
                },
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                li: ({ node, ...props }) => <li className="list-disc ml-5 mb-1" {...props} />,
              }}
            >
              {cleanContent(message.content)}
            </ReactMarkdown>
          </div>

          {/* Timestamp */}
          <div
            className={`text-xs text-gray-500 mt-1 px-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
