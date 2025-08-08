
'use client';

import { useState, useEffect } from 'react';

const AI_MODELS = [
  { id: 'fluxytools/2.4/free', name: 'FluxyTools', provider: 'FluxyTools', isFree: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', isFree: false },
  { id: 'openai/gpt-4o', name: 'GPT-4O', provider: 'OpenAI', isFree: false },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', isFree: false },
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', isFree: false },
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

interface ModelApiKey {
  modelId: string;
  apiKey: string;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [apiKeys, setApiKeys] = useState<ModelApiKey[]>([]);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('model_api_keys');
      if (stored) {
        setApiKeys(JSON.parse(stored));
      }
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveApiKey = (modelId: string) => {
    if (!tempApiKey.trim()) return;

    const updatedKeys = [...apiKeys];
    const existingIndex = updatedKeys.findIndex(k => k.modelId === modelId);

    if (existingIndex >= 0) {
      updatedKeys[existingIndex].apiKey = tempApiKey.trim();
    } else {
      updatedKeys.push({ modelId, apiKey: tempApiKey.trim() });
    }

    setApiKeys(updatedKeys);
    localStorage.setItem('model_api_keys', JSON.stringify(updatedKeys));
    setEditingModel(null);
    setTempApiKey('');

    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemoveApiKey = (modelId: string) => {
    const updatedKeys = apiKeys.filter(k => k.modelId !== modelId);
    setApiKeys(updatedKeys);
    localStorage.setItem('model_api_keys', JSON.stringify(updatedKeys));

    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  const startEditing = (modelId: string) => {
    const existing = apiKeys.find(k => k.modelId === modelId);
    setTempApiKey(existing?.apiKey || '');
    setEditingModel(modelId);
  };

  const cancelEditing = () => {
    setEditingModel(null);
    setTempApiKey('');
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{user.name || 'User'}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model API Keys</h3>
            <p className="text-gray-600 text-sm mb-6">
              Configure your API keys to access premium AI models. The free model doesn't require an API key.
            </p>

            <div className="space-y-4">
              {AI_MODELS.map((model) => {
                const hasApiKey = apiKeys.some(k => k.modelId === model.id);
                const apiKeyData = apiKeys.find(k => k.modelId === model.id);
                const isEditing = editingModel === model.id;

                return (
                  <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">{model.name}</h4>
                            {model.isFree && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded font-medium whitespace-nowrap">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">{model.provider}</p>
                        
                        {hasApiKey && !isEditing && (
                          <div className="mt-2 text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">API Key:</span> {maskApiKey(apiKeyData!.apiKey)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {!model.isFree && (
                          <>
                            {isEditing ? (
                              <div className="flex items-center space-x-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  value={tempApiKey}
                                  onChange={(e) => setTempApiKey(e.target.value)}
                                  placeholder="Enter API key"
                                  className="flex-1 sm:w-32 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => handleSaveApiKey(model.id)}
                                  disabled={!tempApiKey.trim()}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 cursor-pointer whitespace-nowrap"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(model.id)}
                                  className="px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                                >
                                  {hasApiKey ? 'Edit' : 'Add Key'}
                                </button>
                                {hasApiKey && (
                                  <button
                                    onClick={() => handleRemoveApiKey(model.id)}
                                    className="px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 cursor-pointer whitespace-nowrap"
                                  >
                                    Remove
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                        
                        {model.isFree && (
                          <span className="text-xs sm:text-sm text-green-600 font-medium">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className="ri-information-line text-blue-600"></i>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">How to get API keys:</p>
                  <ul className="text-xs space-y-1">
                    <li>• OpenAI: Visit platform.openai.com</li>
                    <li>• Anthropic: Visit console.anthropic.com</li>
                    <li>• Google: Visit aistudio.google.com</li>
                    <li>• Or get unified access at openrouter.ai</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}