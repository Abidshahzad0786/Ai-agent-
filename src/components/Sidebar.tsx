import React, { useState } from 'react';
import { StudioMode } from '../types';
import {
  MessageSquare,
  FileText,
  Table2,
  Key,
  Dna,
  Brain,
  PhoneCall,
  Sliders,
  Shield,
  Bookmark,
  Paperclip,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentMode: StudioMode;
  onSelectMode: (mode: StudioMode) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  groqKey: string;
  setGroqKey: (key: string) => void;
  openRouterKey: string;
  setOpenRouterKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  temperature: number;
  setTemperature: (val: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  maxTokens: number;
  setMaxTokens: (val: number) => void;
  savedPrompts: Record<string, string>;
  onSavePrompt: (name: string, prompt: string) => void;
  onSelectSavedPrompt: (prompt: string) => void;
  onFileUpload: (file: File) => void;
  attachedFileName: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentMode,
  onSelectMode,
  systemPrompt,
  setSystemPrompt,
  groqKey,
  setGroqKey,
  openRouterKey,
  setOpenRouterKey,
  selectedModel,
  setSelectedModel,
  availableModels,
  temperature,
  setTemperature,
  topP,
  setTopP,
  maxTokens,
  setMaxTokens,
  savedPrompts,
  onSavePrompt,
  onSelectSavedPrompt,
  onFileUpload,
  attachedFileName
}) => {
  const [showSystemExpander, setShowSystemExpander] = useState(false);
  const [showSafetyExpander, setShowSafetyExpander] = useState(false);
  const [showPromptsExpander, setShowPromptsExpander] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOrKey, setShowOrKey] = useState(false);

  const modes: { id: StudioMode; label: string; icon: React.ReactNode }[] = [
    { id: '💬 Chat Prompt Mode', label: 'Chat Prompt Mode', icon: <MessageSquare size={17} /> },
    { id: '📞 Live AI Voice Call', label: 'Live AI Voice Call', icon: <PhoneCall size={17} className="text-emerald-600" /> },
    { id: '🧠 Autonomous Problem Solver', label: 'Autonomous Problem Solver', icon: <Brain size={17} /> },
    { id: '📝 Freeform Canvas', label: 'Freeform Canvas', icon: <FileText size={17} /> },
    { id: '📊 Structured Few-Shot', label: 'Structured Few-Shot', icon: <Table2 size={17} /> },
    { id: '⚙️ API Key & Developer Manager', label: 'API Key & Dev Manager', icon: <Key size={17} /> },
    { id: '🧬 Model Fine-Tuning Pipeline', label: 'Fine-Tuning Pipeline', icon: <Dna size={17} /> }
  ];

  return (
    <aside
      className={`h-screen flex flex-col bg-white border-r border-slate-200 overflow-y-auto shrink-0 select-none transition-all duration-300 ease-in-out ${
        isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none border-none'
      }`}
    >
      <div className="w-80 flex flex-col h-full">
        {/* Brand Header with Collapse Arrow */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shadow-xs">
              👑
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-tight">
                Google AI Studio
              </h1>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Enterprise Suite
              </span>
            </div>
          </div>

          {/* Arrow button to collapse sidebar inside */}
          <button
            onClick={onToggle}
            title="Functions panel ko andar bhejein (Collapse Sidebar)"
            className="flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors group cursor-pointer border border-transparent hover:border-slate-200"
          >
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-800">
              Chhupayein
            </span>
            <ChevronLeft size={18} className="text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Workspace Mode Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Workspace Mode
            </label>
            <div className="space-y-1">
              {modes.map(m => {
                const active = currentMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMode(m.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className={active ? 'text-white' : 'text-slate-500'}>{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* System Instructions Expander */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowSystemExpander(!showSystemExpander)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <span>🧠</span> System Instructions
              </span>
              {showSystemExpander ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showSystemExpander && (
              <div className="p-3 bg-white border-t border-slate-200">
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700 font-mono resize-y"
                  placeholder="Persona and rules..."
                />
              </div>
            )}
          </div>

          {/* API Key Inputs */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              API Keys (Optional)
            </label>

            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-slate-600 block mb-1">Groq API Key:</span>
                <div className="relative">
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    value={groqKey}
                    onChange={e => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full text-xs px-2.5 py-1.5 pr-8 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showGroqKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-600 block mb-1">OpenRouter Key (Backup):</span>
                <div className="relative">
                  <input
                    type={showOrKey ? 'text' : 'password'}
                    value={openRouterKey}
                    onChange={e => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full text-xs px-2.5 py-1.5 pr-8 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOrKey(!showOrKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOrKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              *Keys are stored securely. Without keys, the free high-speed neural engine automatically handles all queries!
            </p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Model Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Sliders size={13} className="text-slate-500" />
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Model Parameters
              </label>
            </div>

            <div>
              <span className="text-xs text-slate-600 font-medium block mb-1">Foundation / Custom Model:</span>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-700"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Temperature:</span>
                <span className="font-mono font-medium">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Top-P:</span>
                <span className="font-mono font-medium">{topP.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={topP}
                onChange={e => setTopP(parseFloat(e.target.value))}
                className="w-full accent-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Max Tokens:</span>
                <span className="font-mono font-medium">{maxTokens}</span>
              </div>
              <input
                type="range"
                min={512}
                max={8192}
                step={512}
                value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-slate-800"
              />
            </div>
          </div>

          {/* Safety Filters */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowSafetyExpander(!showSafetyExpander)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Shield size={13} className="text-slate-500" />
                Safety Filters
              </span>
              {showSafetyExpander ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showSafetyExpander && (
              <div className="p-3 bg-white border-t border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-600 block mb-1">Harassment:</span>
                  <select className="w-full text-xs p-1 border border-slate-200 rounded text-slate-700">
                    <option>Block None</option>
                    <option>Block Few</option>
                    <option>Block Some</option>
                    <option>Block Most</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-600 block mb-1">Hate Speech:</span>
                  <select className="w-full text-xs p-1 border border-slate-200 rounded text-slate-700">
                    <option>Block None</option>
                    <option>Block Few</option>
                    <option>Block Some</option>
                    <option>Block Most</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Saved Prompts Manager */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowPromptsExpander(!showPromptsExpander)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Bookmark size={13} className="text-slate-500" />
                Saved Prompts Manager
              </span>
              {showPromptsExpander ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showPromptsExpander && (
              <div className="p-3 bg-white border-t border-slate-200 space-y-2.5 text-xs">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Template Name..."
                    value={newPromptName}
                    onChange={e => setNewPromptName(e.target.value)}
                    className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newPromptName.trim()) {
                        onSavePrompt(newPromptName.trim(), systemPrompt);
                        setNewPromptName('');
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 cursor-pointer"
                  >
                    Save
                  </button>
                </div>

                <div className="space-y-1 pt-1 max-h-36 overflow-y-auto">
                  {Object.entries(savedPrompts).map(([name, prompt]) => (
                    <button
                      key={name}
                      onClick={() => onSelectSavedPrompt(prompt)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 group text-xs cursor-pointer"
                      title={prompt}
                    >
                      <span className="text-slate-400">📁</span>
                      <span className="truncate flex-1 font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Media Attachment */}
          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Paperclip size={13} className="text-slate-500" /> Media Attachment
              </span>
            </div>
            <label className="cursor-pointer block text-center p-2 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
              <span>{attachedFileName ? `📎 ${attachedFileName}` : 'Choose Image, Audio or PDF'}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    onFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};
