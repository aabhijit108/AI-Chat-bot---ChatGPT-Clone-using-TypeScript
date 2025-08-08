
'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import ProfileModal from '../components/ProfileModal';
import ModelSelector from '../components/ModelSelector';
import ChatSidebar from '../components/ChatSidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const FREE_MODEL = 'tngtech/deepseek-r1t2-chimera:free';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(FREE_MODEL);
  const [userModelApiKeys, setUserModelApiKeys] = useState<any[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const storedSessions = localStorage.getItem('chat_sessions');
    const storedApiKeys = localStorage.getItem('model_api_keys');

    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions);
      setSessions(parsedSessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        messages: session.messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }))
      })));
    }
    if (storedApiKeys) {
      setUserModelApiKeys(JSON.parse(storedApiKeys));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedApiKeys = localStorage.getItem('model_api_keys');
      if (storedApiKeys) {
        setUserModelApiKeys(JSON.parse(storedApiKeys));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false); // Close sidebar on mobile after creating chat
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSidebarOpen(false); // Close sidebar on mobile after selecting
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }

    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  };

  const canUseModel = (modelId: string) => {
    if (modelId === FREE_MODEL) return true;
    return userModelApiKeys.some(key => key.modelId === modelId);
  };

  const handleModelChange = (modelId: string) => {
    if (!canUseModel(modelId)) {
      setSelectedModel(FREE_MODEL);
      setShowProfileModal(true);
      return;
    }
    setSelectedModel(modelId);
  };

  const getApiKeyForModel = (modelId: string) => {
  if (modelId === FREE_MODEL) return null;
  return process.env.OPENROUTER_API_KEY;
  };


  const handleSendMessage = async (content: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // Auto-switch to free model if current model doesn't have API key
    let modelToUse = selectedModel;
    if (!canUseModel(selectedModel)) {
      modelToUse = FREE_MODEL;
      setSelectedModel(FREE_MODEL);
    }

    let sessionId = currentSessionId;
    if (!sessionId) {
      createNewChat();
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? {
          ...session,
          messages: [...session.messages, userMessage],
          title: session.messages.length === 0 ? (content.length > 30 ? content.substring(0, 30) + '...' : content) : session.title
        }
        : session
    ));

    setLoading(true);

    try {
      let response;

      if (modelToUse === FREE_MODEL) {
        // Call your backend API for free model
        response = await fetch('/api/chat/free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              ...currentSession?.messages.map(msg => ({ role: msg.role, content: msg.content })) || [],
              { role: 'user', content }
            ]
          })
        });
      } else {
        // Use user's API key for premium models
        const apiKey = getApiKeyForModel(modelToUse);
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'ChatAI'
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              ...currentSession?.messages.map(msg => ({ role: msg.role, content: msg.content })) || [],
              { role: 'user', content }
            ]
          })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let assistantContent = 'No response from model.';
      if (Array.isArray(data.choices) && data.choices[0]?.message?.content) {
        assistantContent = data.choices[0].message.content;
      } else if (data.text) {
        assistantContent = data.text;
      } else {
        console.error('Unexpected API response:', data);
      }


      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setSessions(prev => {
        const updated = prev.map(session =>
          session.id === sessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        );
        localStorage.setItem('chat_sessions', JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };

      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        onOpenProfile={() => setShowProfileModal(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:relative z-20 lg:z-0`}>
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewChat={createNewChat}
            onDeleteSession={handleDeleteSession}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {currentSession?.messages.length === 0 || !currentSession ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-chat-3-line text-2xl text-blue-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to ChatAI
                </h2>
                <p className="text-gray-600 mb-6 max-w-md text-sm sm:text-base">
                  Start a conversation with AI. Use the free model or add your API keys in Profile for premium models.
                </p>
                {!user && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Sign In to Get Started
                  </button>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
                {currentSession.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {loading && (
                  <div className="flex justify-start mb-6">
                    <div className="flex flex-row max-w-3xl w-full">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-robot-line text-sm"></i>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!user}
            loading={loading}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            userModelApiKeys={userModelApiKeys}
          />
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </div>
  );
}
