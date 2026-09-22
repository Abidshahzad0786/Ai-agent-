import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Volume2, VolumeX, Terminal } from 'lucide-react';

interface FormattedAiResponseProps {
  content: string;
}

export const FormattedAiResponse: React.FC<FormattedAiResponseProps> = ({ content }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for pleasant speech
    const cleanSpeech = content
      .replace(/[*#`_~>]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative group/content text-slate-800 text-[13px] md:text-[14px] leading-relaxed space-y-3">
      {/* Top micro toolbar for listening & readability */}
      <div className="flex items-center justify-end gap-2 pb-1 text-[11px] text-slate-400 select-none">
        <button
          onClick={handleToggleSpeech}
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
            isPlayingAudio
              ? 'bg-amber-100 text-amber-900 font-semibold'
              : 'hover:bg-slate-100 text-slate-500'
          }`}
          title={isPlayingAudio ? 'Stop reading' : 'Awaz mein sunein (Text-to-Speech)'}
        >
          {isPlayingAudio ? <VolumeX size={13} className="text-amber-700" /> : <Volume2 size={13} />}
          <span>{isPlayingAudio ? 'Awaz Rokein' : 'Sunein'}</span>
        </button>
      </div>

      {/* Render Markdown */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-lg md:text-xl font-bold text-slate-900 tracking-tight mt-4 mb-2 pb-1 border-b border-slate-200"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-base md:text-lg font-bold text-slate-900 mt-3.5 mb-2 flex items-center gap-1.5"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-sm md:text-base font-bold text-slate-800 mt-3 mb-1.5 text-indigo-950 flex items-center gap-1"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-xs md:text-sm font-bold text-slate-800 mt-2.5 mb-1"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="my-2 leading-relaxed text-slate-700" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-slate-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-700 font-serif" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-2.5 space-y-1.5 pl-4 list-disc text-slate-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-2.5 space-y-1.5 pl-4 list-decimal text-slate-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-0.5" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-3 pl-3.5 py-2 border-l-4 border-amber-500 bg-amber-50/70 rounded-r-lg text-slate-800 text-xs md:text-sm italic shadow-2xs"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-100 font-semibold text-slate-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 font-bold text-slate-800 tracking-wide" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-t border-slate-100" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-t border-slate-200" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && typeof children === 'string' && !children.includes('\n');
            const codeString = String(children).replace(/\n$/, '');
            const codeId = 'code-' + codeString.slice(0, 10).replace(/\s/g, '');

            if (isInline) {
              return (
                <code
                  className="bg-slate-100 text-pink-700 px-1.5 py-0.5 rounded font-mono text-[11px] md:text-xs font-medium border border-slate-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
                <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                    <Terminal size={12} className="text-emerald-400" />
                    <span>{match ? match[1] : 'code'}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(codeString, codeId)}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedCodeId === codeId ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-normal text-emerald-300">
                  <code>{children}</code>
                </pre>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
