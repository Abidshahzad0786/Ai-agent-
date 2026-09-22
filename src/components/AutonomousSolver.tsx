import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Compass,
  Layers,
  ShieldCheck,
  Zap,
  Play,
  Copy,
  Check,
  Download,
  Terminal,
  RefreshCw,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { executeAiQuery } from '../utils/aiEngine';
import { FormattedAiResponse } from './FormattedAiResponse';

interface AutonomousSolverProps {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  groqKey: string;
  openRouterKey: string;
}

export const AutonomousSolver: React.FC<AutonomousSolverProps> = ({
  selectedModel,
  temperature,
  maxTokens,
  topP,
  systemPrompt,
  groqKey,
  openRouterKey
}) => {
  const [goalInput, setGoalInput] = useState('');
  const [domain, setDomain] = useState('Software Engineering & Architecture');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'exhaustive'>('deep');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    {
      title: 'Private Automation Bot',
      prompt: 'Mujhe apne zati computer ke liye ek autonomous script/bot banana hai jo folder mein aane wali files ko read kare, categorize kare aur summary generate kare.'
    },
    {
      title: 'High-Performance API Backend',
      prompt: '100,000 daily active users ke liye scalable Node.js/TypeScript REST API architecture design karein jisme caching, rate limiting aur database pooling shaamil ho.'
    },
    {
      title: 'Offline Local AI Agent Setup',
      prompt: 'Apne laptop par bina kisi internet ya external API ke DeepSeek ya Llama 3 model run karne ka step-by-step local setup aur Python agent framework.'
    },
    {
      title: 'Real-Time Data Pipeline',
      prompt: 'PostgreSQL database se data stream kar ke real-time analytics dashboard tak pohnchane ka sab se sasta aur stable rasta.'
    }
  ];

  const handleSolve = async (overridePrompt?: string) => {
    const text = overridePrompt || goalInput;
    if (!text.trim() || loading) return;

    setLoading(true);
    setSolution(null);

    const solverPrompt = `[DOMAIN: ${domain}] [REASONING DEPTH: ${depth.toUpperCase()}]
USER GOAL / PROBLEM:
"${text}"

HIDAYAT:
Aap ek Supreme Autonomous Solutions Architect hain. Is masle ka rasta khud nikal kar darj zail 4 marhalon mein complete solution pesh karein:
1. 🎯 **Asal Maqsad aur Chhupe Huye Masail (Goal & Constraints):** Root problem kya hai aur aam tor par log kahan phanstay hain.
2. 🗺️ **Autonomous Pathways (Mutabadil Raste & Strategy):** Is kaam ko karne ke 2 behtareen raste, aur sab se solid/practical rasta konsa hai aur kyun.
3. ⚡ **Step-by-Step Blueprint & Actionable Code (Amali Marhalay):** Ready-to-use clean code, configuration, terminal commands, ya architecture structure.
4. 🛡️ **Edge Cases, Risk & Verification (Khud-Ahtisabi & Testing):** Kya ghalat ho sakta hai aur system ko break hone se kaise bachana hai.`;

    try {
      const res = await executeAiQuery(solverPrompt, [], {
        model: selectedModel,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        systemPrompt,
        customGroq: groqKey,
        customOpenRouter: openRouterKey,
        autonomousReasoning: true
      });

      setSolution(res.reply);
      setSource(res.source);
    } catch (err: any) {
      setSolution(`Error while reasoning: ${err?.message || 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!solution) return;
    const blob = new Blob([solution], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autonomous-solution-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Top Header */}
      <div className="py-3 px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
            <Brain size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Autonomous Problem Solver & Pathway Finder</span>
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                Self-Reasoning Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Apna koi bhi challenge dein — yeh system khud rasta nikal kar step-by-step practical blueprint tayaar karega.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Model: <strong className="text-slate-800">{selectedModel}</strong>
          </span>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full space-y-5">
        {/* Input Configuration Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Domain Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Layers size={13} className="text-slate-400" /> Domain:
              </span>
              <select
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option>Software Engineering & Architecture</option>
                <option>Private Automation & Bot Development</option>
                <option>Data Pipelines & Database Logic</option>
                <option>Local AI & Self-Hosted Infrastructure</option>
                <option>Complex Algorithm & Problem Solving</option>
                <option>Strategic Business Roadmap</option>
              </select>
            </div>

            {/* Depth Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 text-[11px] font-semibold mr-1">Reasoning Depth:</span>
              {(['standard', 'deep', 'exhaustive'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                    depth === d
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Compass size={14} className="text-indigo-600" />
              <span>Apna Task, Goal ya Masla Likhein:</span>
            </label>
            <textarea
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              rows={3}
              placeholder="Maslan: 'Mujhe ek aisi script chahiye jo files ko automatically clean kare', 'Node.js mein custom caching system banana hai'..."
              className="w-full text-xs md:text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none font-sans"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Sample Prompts Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500 max-w-full">
              <span className="font-semibold text-slate-400 shrink-0">Try:</span>
              {samplePrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setGoalInput(sp.prompt);
                    handleSolve(sp.prompt);
                  }}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors cursor-pointer border border-slate-200"
                >
                  ⚡ {sp.title}
                </button>
              ))}
            </div>

            {/* Execute Button */}
            <button
              onClick={() => handleSolve()}
              disabled={!goalInput.trim() || loading}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Rasta Talaash Kar Raha Hai...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Khud Rasta Nikalo (Solve)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4-Phase Autonomous Reasoning Process Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs select-none">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Goal Deconstruction</span>
            </div>
            <p className="text-[11px] text-slate-500">Root cause aur constraints ko samajhna.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Pathway Discovery</span>
            </div>
            <p className="text-[11px] text-slate-500">Mutabadil raste aur sab se solid strategy.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Actionable Blueprint</span>
            </div>
            <p className="text-[11px] text-slate-500">Ready code, commands aur step-by-step amal.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Risk & Verification</span>
            </div>
            <p className="text-[11px] text-slate-500">Edge cases aur ghalati se bachne ka tareeqa.</p>
          </div>
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
            <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">
              Autonomous Intelligence Engine Masle Ka Rasta Nikal Raha Hai...
            </div>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Mukhtalif pathways ka tajziya ho raha hai taake sab se asaan, taiz aur mustahkam solution banaya ja sake.
            </p>
          </div>
        )}

        {/* Generated Solution Display */}
        {solution && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            {/* Solution Header Bar */}
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span className="font-semibold tracking-wide">Autonomous Solution Blueprint</span>
                {source && (
                  <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
                    Source: {source}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors cursor-pointer border border-slate-700 text-slate-200"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded transition-colors cursor-pointer text-white font-medium"
                >
                  <Download size={12} />
                  <span>Download .MD</span>
                </button>
              </div>
            </div>

            {/* Solution Content Area */}
            <div className="p-6">
              <FormattedAiResponse content={solution} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
