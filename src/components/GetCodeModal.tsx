import React, { useState } from 'react';
import { exportCodeSnippets } from '../utils/codeExport';
import { X, Copy, Check, Code } from 'lucide-react';

interface GetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
}

export const GetCodeModal: React.FC<GetCodeModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  temperature,
  maxTokens,
  systemPrompt,
  userPrompt
}) => {
  const [targetLang, setTargetLang] = useState<string>('Python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const languages = ['Python', 'JavaScript (Node.js)', 'cURL', 'Swift', 'Kotlin (Android)'];
  const snippet = exportCodeSnippets(
    selectedModel,
    temperature,
    maxTokens,
    systemPrompt,
    userPrompt || 'Your query here...',
    targetLang
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-800">⚡ Get Code (5 Enterprise Languages)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Target Language:</label>
              <div className="flex flex-wrap gap-1.5">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setTargetLang(lang)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      targetLang === lang
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
            <pre className="whitespace-pre">{snippet}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
