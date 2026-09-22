import React, { useState, useEffect } from 'react';
import { StudioMode, FineTunedModel } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatMode } from './components/ChatMode';
import { LiveCallView } from './components/LiveCallView';
import { AutonomousSolver } from './components/AutonomousSolver';
import { FreeformCanvas } from './components/FreeformCanvas';
import { FewShotMode } from './components/FewShotMode';
import { ApiKeyManager } from './components/ApiKeyManager';
import { FineTuningPipeline } from './components/FineTuningPipeline';
import { MASTER_SYSTEM_INSTRUCTION } from './utils/aiEngine';
import { ChevronRight } from 'lucide-react';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<StudioMode>('💬 Chat Prompt Mode');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [systemPrompt, setSystemPrompt] = useState<string>(MASTER_SYSTEM_INSTRUCTION);
  const [groqKey, setGroqKey] = useState<string>('');
  const [openRouterKey, setOpenRouterKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.1-8b-instant');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [maxTokens, setMaxTokens] = useState<number>(2048);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [savedPrompts, setSavedPrompts] = useState<Record<string, string>>({
    'Senior Full-Stack Architect': 'Act as a Senior Software Architect. Provide clean, modular, production-ready code with error handling.',
    'CMO Viral Marketing': 'Act as a Chief Marketing Officer. Create a 30-day GTM roadmap with high-converting AIDA hooks.',
    'Academic Tutor': 'Act as a World-Class Professor. Explain complex topics using simple real-world analogies.'
  });

  const [fineTunedModels, setFineTunedModels] = useState<Record<string, FineTunedModel>>({});

  useEffect(() => {
    // Load prompts & fine-tuned models from backend
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setSavedPrompts(data);
      })
      .catch(() => {});

    fetch('/api/finetune')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') setFineTunedModels(data);
      })
      .catch(() => {});
  }, []);

  const baseModels = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'deepseek-r1-distill-llama-70b',
    'mixtral-8x7b-32768'
  ];

  const availableModels = [...baseModels, ...Object.keys(fineTunedModels)];

  const handleSavePrompt = async (name: string, prompt: string) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prompt })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPrompts(data.prompts);
      } else {
        setSavedPrompts(prev => ({ ...prev, [name]: prompt }));
      }
    } catch {
      setSavedPrompts(prev => ({ ...prev, [name]: prompt }));
    }
  };

  const handleModelCreated = (modelId: string) => {
    setFineTunedModels(prev => ({
      ...prev,
      [modelId]: {
        base: 'Llama-3.3-70B',
        status: 'Deployed & Live',
        created_at: new Date().toISOString().split('T')[0]
      }
    }));
    setSelectedModel(modelId);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] relative">
      {/* Sidebar with collapse state */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        groqKey={groqKey}
        setGroqKey={setGroqKey}
        openRouterKey={openRouterKey}
        setOpenRouterKey={setOpenRouterKey}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
        temperature={temperature}
        setTemperature={setTemperature}
        topP={topP}
        setTopP={setTopP}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        savedPrompts={savedPrompts}
        onSavePrompt={handleSavePrompt}
        onSelectSavedPrompt={setSystemPrompt}
        onFileUpload={setAttachedFile}
        attachedFileName={attachedFile?.name || null}
      />

      {/* Floating edge expander button when sidebar is collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          title="Functions panel ko bahir layein (Expand Sidebar)"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900 text-white shadow-2xl hover:bg-slate-800 px-1.5 py-3.5 rounded-r-xl flex flex-col items-center gap-2 border-y border-r border-slate-700 transition-all cursor-pointer group"
        >
          <ChevronRight size={17} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[9px] font-bold uppercase tracking-wider [writing-mode:vertical-lr] rotate-180 text-slate-300">
            Functions ▶
          </span>
        </button>
      )}

      {/* Main Workspace Modes */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {currentMode === '💬 Chat Prompt Mode' && (
          <ChatMode
            selectedModel={selectedModel}
            temperature={temperature}
            maxTokens={maxTokens}
            topP={topP}
            systemPrompt={systemPrompt}
            groqKey={groqKey}
            openRouterKey={openRouterKey}
            attachedFile={attachedFile}
            onClearAttachment={() => setAttachedFile(null)}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
        )}

        {currentMode === '📞 Live AI Voice Call' && (
          <LiveCallView
            onEndCall={() => setCurrentMode('💬 Chat Prompt Mode')}
            selectedModel={selectedModel}
            systemPrompt={systemPrompt}
            groqKey={groqKey}
            openRouterKey={openRouterKey}
          />
        )}

        {currentMode === '🧠 Autonomous Problem Solver' && (
          <AutonomousSolver
            selectedModel={selectedModel}
            temperature={temperature}
            maxTokens={maxTokens}
            topP={topP}
            systemPrompt={systemPrompt}
            groqKey={groqKey}
            openRouterKey={openRouterKey}
          />
        )}

        {currentMode === '📝 Freeform Canvas' && (
          <FreeformCanvas
            selectedModel={selectedModel}
            temperature={temperature}
            maxTokens={maxTokens}
            topP={topP}
            systemPrompt={systemPrompt}
            groqKey={groqKey}
            openRouterKey={openRouterKey}
          />
        )}

        {currentMode === '📊 Structured Few-Shot' && (
          <FewShotMode
            selectedModel={selectedModel}
            temperature={temperature}
            maxTokens={maxTokens}
            topP={topP}
            systemPrompt={systemPrompt}
            groqKey={groqKey}
            openRouterKey={openRouterKey}
          />
        )}

        {currentMode === '⚙️ API Key & Developer Manager' && <ApiKeyManager />}

        {currentMode === '🧬 Model Fine-Tuning Pipeline' && (
          <FineTuningPipeline
            onModelCreated={handleModelCreated}
            fineTunedModels={fineTunedModels}
          />
        )}
      </main>
    </div>
  );
};
