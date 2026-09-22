import React, { useState } from 'react';
import { FewShotRow } from '../types';
import { executeAiQuery } from '../utils/aiEngine';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';

interface FewShotModeProps {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  groqKey: string;
  openRouterKey: string;
}

export const FewShotMode: React.FC<FewShotModeProps> = ({
  selectedModel,
  temperature,
  maxTokens,
  topP,
  systemPrompt,
  groqKey,
  openRouterKey
}) => {
  const [rows, setRows] = useState<FewShotRow[]>([
    { id: '1', input: 'Apple', output: 'Category: Fruit | Taste: Sweet' },
    { id: '2', input: 'Broccoli', output: 'Category: Vegetable | Taste: Earthy' }
  ]);
  const [testQuery, setTestQuery] = useState('');
  const [inferenceResult, setInferenceResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { id: String(Date.now()), input: '', output: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const handleRowChange = (id: string, field: 'input' | 'output', value: string) => {
    setRows(rows.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleExecute = async () => {
    if (!testQuery.trim() || loading) return;

    let assembled = 'Follow the exact pattern shown in these examples:\n\n';
    for (const r of rows) {
      if (r.input.trim() && r.output.trim()) {
        assembled += `Input: ${r.input.trim()}\nOutput: ${r.output.trim()}\n\n`;
      }
    }
    assembled += `Input: ${testQuery.trim()}\nOutput:`;

    setLoading(true);
    setInferenceResult(null);

    try {
      const { reply } = await executeAiQuery(assembled, [], {
        model: selectedModel,
        temperature,
        top_p: topP,
        max_tokens: maxTokens,
        systemPrompt,
        customGroq: groqKey,
        customOpenRouter: openRouterKey
      });
      setInferenceResult(reply);
    } catch (e: any) {
      setInferenceResult(`Inference failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>📊</span> Structured Few-Shot Prompt Learning
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Teach the model your exact pattern using dynamic input-output training pairs.
        </p>
      </div>

      {/* Few Shot Dynamic Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Training Examples ({rows.length})
          </span>
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors"
          >
            <Plus size={14} />
            <span>Add Pair</span>
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 w-5">#{index + 1}</span>
              <input
                type="text"
                placeholder="Input example (e.g. Apple)"
                value={row.input}
                onChange={e => handleRowChange(row.id, 'input', e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 font-mono"
              />
              <span className="text-slate-400 font-mono text-xs">➔</span>
              <input
                type="text"
                placeholder="Output example (e.g. Category: Fruit | Taste: Sweet)"
                value={row.output}
                onChange={e => handleRowChange(row.id, 'output', e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 font-mono"
              />
              <button
                onClick={() => handleRemoveRow(row.id)}
                disabled={rows.length <= 1}
                title="Remove pair"
                className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Query Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <label className="text-xs font-semibold text-slate-700 block">
          Test Query (Naya sawal):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Orange, Mango, Carrot..."
            value={testQuery}
            onChange={e => setTestQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExecute()}
            className="flex-1 text-xs md:text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800"
          />
          <button
            onClick={handleExecute}
            disabled={!testQuery.trim() || loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{loading ? 'Inferring...' : '✨ Execute Few-Shot Inference'}</span>
          </button>
        </div>
      </div>

      {/* Inference Output */}
      {inferenceResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-xs uppercase tracking-wide">
            <Sparkles size={15} /> Few-Shot Model Completion Result:
          </div>
          <div className="font-mono text-xs md:text-sm text-emerald-950 whitespace-pre-wrap font-semibold">
            {inferenceResult}
          </div>
        </div>
      )}
    </div>
  );
};
