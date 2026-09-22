import React, { useState } from 'react';
import { countTokens } from '../utils/tokenCounter';
import { executeAiQuery } from '../utils/aiEngine';
import { GetCodeModal } from './GetCodeModal';
import { Play, Code2, Loader2, Copy, Check, Sparkles } from 'lucide-react';

interface FreeformCanvasProps {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  groqKey: string;
  openRouterKey: string;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  selectedModel,
  temperature,
  maxTokens,
  topP,
  systemPrompt,
  groqKey,
  openRouterKey
}) => {
  const [canvasInput, setCanvasInput] = useState('');
  const [canvasResponse, setCanvasResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalTokens = countTokens(canvasInput + (systemPrompt || ''));

  const handleRunPrompt = async () => {
    if (!canvasInput.trim() || loading) return;
    setLoading(true);
    setCanvasResponse(null);

    try {
      const { reply } = await executeAiQuery(canvasInput, [], {
        model: selectedModel,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        systemPrompt,
        customGroq: groqKey,
        customOpenRouter: openRouterKey
      });
      setCanvasResponse(reply);
    } catch (err: any) {
      setCanvasResponse(`Execution Error: ${err?.message || 'Something went wrong.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!canvasResponse) return;
    navigator.clipboard.writeText(canvasResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>📝</span> Freeform Prompt Workspace
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Mix open-ended context, code blocks, instructions, and test completions directly with token counters.
        </p>
      </div>

      {/* Canvas Textarea */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <label className="text-xs font-semibold text-slate-700 block">
          Canvas Input (System Prompt, Context or Code):
        </label>
        <textarea
          value={canvasInput}
          onChange={e => setCanvasInput(e.target.value)}
          rows={10}
          placeholder="Write your full system prompt, context, or code to execute..."
          className="w-full text-xs md:text-sm p-3 font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 resize-y"
        />

        {/* Token Counter Badge & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span>🔢 Active Tokens:</span>
            <span className="font-mono text-emerald-700 font-bold">{totalTokens}</span>
            <span className="text-slate-400">/ {maxTokens}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Code2 size={15} />
              <span>⚡ Get Code (5 Languages)</span>
            </button>

            <button
              onClick={handleRunPrompt}
              disabled={!canvasInput.trim() || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              <span>{loading ? 'Executing...' : '▶ Run Prompt (Execute Model)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Response Card */}
      {canvasResponse && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles size={14} className="text-emerald-600" />
              Canvas Execution Response
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors p-1"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-sans text-xs md:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {canvasResponse}
          </div>
        </div>
      )}

      {/* Get Code Modal */}
      <GetCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        selectedModel={selectedModel}
        temperature={temperature}
        maxTokens={maxTokens}
        systemPrompt={systemPrompt}
        userPrompt={canvasInput}
      />
    </div>
  );
};
