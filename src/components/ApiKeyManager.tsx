import React, { useState, useEffect } from 'react';
import { ApiKeyItem } from '../types';
import { Key, Plus, Trash2, ShieldCheck, Copy, Check } from 'lucide-react';

export const ApiKeyManager: React.FC = () => {
  const [keys, setKeys] = useState<Record<string, ApiKeyItem>>({
    'studio-demo-key-001': {
      project: 'Default Project',
      rpm_limit: 15,
      created_at: '2026-09-20',
      status: 'Active'
    }
  });
  const [projectName, setProjectName] = useState('');
  const [rpmLimit, setRpmLimit] = useState(15);
  const [createdNotification, setCreatedNotification] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/keys')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setKeys(data);
        }
      })
      .catch(() => {});
  }, []);

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let res = '';
    for (let i = 0; i < 32; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `studio-live-${res}`;
  };

  const handleCreateKey = async () => {
    if (!projectName.trim()) return;
    const newKey = generateRandomKey();

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, project: projectName.trim(), rpm_limit: rpmLimit })
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
      } else {
        setKeys(prev => ({
          ...prev,
          [newKey]: {
            project: projectName.trim(),
            rpm_limit: rpmLimit,
            created_at: new Date().toISOString().split('T')[0],
            status: 'Active'
          }
        }));
      }
    } catch {
      setKeys(prev => ({
        ...prev,
        [newKey]: {
          project: projectName.trim(),
          rpm_limit: rpmLimit,
          created_at: new Date().toISOString().split('T')[0],
          status: 'Active'
        }
      }));
    }

    setCreatedNotification(newKey);
    setProjectName('');
  };

  const handleRevoke = async (key: string) => {
    try {
      await fetch(`/api/keys/${encodeURIComponent(key)}`, { method: 'DELETE' });
    } catch {}
    setKeys(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Key size={22} className="text-amber-600" />
          Studio API Key Management Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Generate unique enterprise API keys for external applications, webhooks, and monitor rate limits.
        </p>
      </div>

      {/* Create New Key Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Generate New API Key
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-600 block mb-1">Project Name:</label>
            <input
              type="text"
              placeholder="e.g. Mobile App Production, Dropship Automation"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Rate Limit (RPM):</label>
            <input
              type="number"
              value={rpmLimit}
              onChange={e => setRpmLimit(parseInt(e.target.value, 10) || 15)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCreateKey}
            disabled={!projectName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>✨ Create Secret API Key</span>
          </button>
        </div>

        {createdNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
            <div>
              <span className="font-bold">Key Generated: </span>
              <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono text-emerald-950">
                {createdNotification}
              </code>
            </div>
            <button
              onClick={() => handleCopy(createdNotification)}
              className="font-semibold underline ml-3"
            >
              Copy Key
            </button>
          </div>
        )}
      </div>

      {/* Active Keys List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            📋 Active API Keys & Projects ({Object.keys(keys).length})
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" /> Enterprise Secure
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {Object.entries(keys).map(([key, meta]) => (
            <div
              key={key}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    {key.slice(0, 20)}...
                  </span>
                  <button
                    onClick={() => handleCopy(key)}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Copy full key"
                  >
                    {copiedKey === key ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {meta.project}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Created on: {meta.created_at} | Status:{' '}
                  <strong className="text-emerald-600">{meta.status}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-600">
                  Limit: <strong className="text-slate-800">{meta.rpm_limit} RPM</strong>
                </span>
                <button
                  onClick={() => handleRevoke(key)}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Revoke</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Google AI Studio Endpoints */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <span>🌐</span> Standard Google AI Studio Endpoints:
        </h3>
        <p className="text-xs text-slate-400">
          Use your generated secret key to execute inference against standard Google AI Studio v1beta routes:
        </p>
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400">
          POST /v1beta/models/&#123;model&#125;:generateContent<br />
          Headers: x-goog-api-key: studio-live-xxxx
        </div>
      </div>
    </div>
  );
};
