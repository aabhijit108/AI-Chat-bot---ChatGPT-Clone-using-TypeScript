
'use client';

import { useState, useRef, useEffect } from 'react';

const AI_MODELS = [
  { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'FluxyTools-2.4', provider: 'FluxyTools', isFree: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', isFree: false },
  { id: 'openai/gpt-4o', name: 'GPT-4O', provider: 'OpenAI', isFree: false },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', isFree: false },
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta', isFree: false },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userModelApiKeys?: any[];
}

export default function ModelSelector({ selectedModel, onModelChange, userModelApiKeys = [] }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canUseModel = (modelId: string) => {
    if (modelId === 'tngtech/deepseek-r1t2-chimera:free') return true;
    return userModelApiKeys.some(key => key.modelId === modelId);
  };

  const availableModels = AI_MODELS.filter(model => canUseModel(model.id));
  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-2 h-2 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <span className="truncate">
            {selectedModelData?.name || 'Select Model'}
          </span>
          {selectedModelData?.isFree && (
            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded font-medium whitespace-nowrap">
              FREE
            </span>
          )}
        </div>
        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0 ml-2">
          <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-xs`}></i>
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {availableModels.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedModel === model.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-2 h-2 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedModel === model.id ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.provider}</div>
                  </div>
                </div>
                {model.isFree && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded font-medium whitespace-nowrap ml-2">
                    FREE
                  </span>
                )}
              </div>
            </button>
          ))}
          
          {availableModels.length === 1 && availableModels[0].isFree && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
              Add API keys in Profile for more models
            </div>
          )}
        </div>
      )}
    </div>
  );
}