import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  Send,
  Plus,
  Mic,
  MicOff,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Download,
  Maximize2,
  RefreshCw,
  X,
  Camera,
  ChevronRight,
  PanelLeftOpen,
  PanelLeftClose,
  Brain,
  Phone,
  PhoneCall,
  Wrench,
  Image as ImageIcon
} from 'lucide-react';
import { LiveCallView } from './LiveCallView';
import {
  isPhotoIntent,
  generateFluxImageUrl,
  STYLE_OPTIONS,
  ImageStyle
} from '../utils/imageGen';
import { executeAiQuery } from '../utils/aiEngine';
import { FormattedAiResponse } from './FormattedAiResponse';

interface ChatModeProps {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  groqKey: string;
  openRouterKey: string;
  attachedFile: File | null;
  onClearAttachment: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const ChatMode: React.FC<ChatModeProps> = ({
  selectedModel,
  temperature,
  maxTokens,
  topP,
  systemPrompt,
  groqKey,
  openRouterKey,
  attachedFile,
  onClearAttachment,
  sidebarOpen,
  onToggleSidebar
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content:
        `### 👋 Assalam-o-Alaikum! Google AI Studio Supreme Copilot Haazir Hai!

Main bilkul **taza tareen real-time updates (Live Clock, Tareekh, Din, Saal 2026)** se fully synchronized hoon, aur **har sawal ka khul kar, bina kisi censorship ya "privacy" ke bahane ke mukammal aur be-khof jawab** deta hoon:

- 🕒 **Live Real-Time Awareness:** Dunya ke kisi bhi mulk (Pakistan, Dubai, Saudi, UK, USA) ka live waqt, tareekh ya din poochein.
- 💡 **Open & Candid Advice (Achi aur Buri Baat):** Har faislay, shakhsiyat, karobar ya mozoo ka 100% imandari se dono pehlu (Faide vs Nuqsanat & Harsh Realities) samjhaunga.
- 📸 **Universal Image Generator:** Asli Camera (DSLR), Real Human Portraits, 2D Cartoons, 3D Pixar, Anime aur 8K pictures!

Aapka jo bhi sawal ho, bina kisi jhijhak ke puchiye!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [activeStyle, setActiveStyle] = useState<ImageStyle>('auto');
  const [autonomousMode, setAutonomousMode] = useState<boolean>(true);
  const [showTools, setShowTools] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Thinking...');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);

  // Full Screen Preview Modal State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleEndLiveCall = (transcripts: { role: 'user' | 'assistant'; text: string }[]) => {
    setIsLiveCallOpen(false);
    if (transcripts.length > 1) {
      const newMsgs: ChatMessage[] = transcripts.slice(1).map((t, idx) => ({
        id: `call-${Date.now()}-${idx}`,
        role: t.role,
        content: t.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'groq'
      }));
      setMessages(prev => [...prev, ...newMsgs]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadImage = async (url: string, filename = 'studio-ai-photo.jpg') => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleRegenerateVariant = (msg: ChatMessage) => {
    if (!msg.imagePrompt) return;
    const newSeed = Math.floor(Math.random() * 900000) + 10000;
    const generated = generateFluxImageUrl(msg.imagePrompt, (msg.imageStyle as ImageStyle) || 'auto', newSeed);

    const variantMsg: ChatMessage = {
      id: 'ai-var-' + Date.now(),
      role: 'assistant',
      content: `Aapki request par **'${msg.imagePrompt}'** ka naya variant tayar hai:`,
      imageUrl: generated.url,
      imagePrompt: msg.imagePrompt,
      imageStyle: generated.styleLabel,
      imageSeed: generated.seed
    };
    setMessages(prev => [...prev, variantMsg]);
  };

  const startVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Your browser does not support voice input. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ur-PK'; // Urdu / English dual recognition
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(prev => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMessageId = 'u-' + Date.now();
    const newMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query
    };

    const newHistory = [...messages, newMsg];
    setMessages(newHistory);
    setInputValue('');
    setLoading(true);

    try {
      const photoRequested = isPhotoIntent(query) || activeStyle !== 'auto';

      if (photoRequested) {
        setLoadingText('🎨 Asli Shakl & Original Features Analyse Ho Rahe Hain...');

        let resolvedSubject = query;
        // LLM smart translation to ensure any Roman Urdu, Urdu, or colloquial request is converted to high-definition authentic prompt
        try {
          const enrichRes = await executeAiQuery(
            `You are a photorealistic vision prompt specialist.
The user wants an authentic, true-to-life image of: "${query}"
Task: Extract and describe the core subject in English for an 8k realistic camera photo.
Strict rules:
1. If a person, celebrity, animal, vehicle, or landmark is mentioned, describe their exact recognizable authentic likeness, face, hair, and clothing.
2. Specify authentic natural human facial structure, natural symmetrical eyes, realistic skin texture, correct physical proportions.
3. No distorted shapes, no cartoonish artifacts, clean visible form.
4. Output ONLY 1 concise English descriptive sentence describing the subject. No quotes, no preamble.`,
            [],
            {
              model: 'llama-3.3-70b-versatile',
              temperature: 0.2,
              top_p: 0.9,
              max_tokens: 150,
              autonomousReasoning: false
            }
          );
          if (enrichRes.reply && enrichRes.reply.length > 8 && !enrichRes.reply.includes('<think>')) {
            resolvedSubject = enrichRes.reply.replace(/["\n]/g, ' ').trim();
          }
        } catch (e) {
          // fallback to smart dictionary
        }

        setLoadingText('🍌 Nano Banana (gemini-3.1-flash-image) Asli Shakl & Features Analyze Kar Raha Hai...');

        let finalImageUrl = '';
        let finalModelLabel = '';
        let finalSeed = Math.floor(Math.random() * 900000) + 10000;

        // Try Nano Banana server-side generation first
        try {
          const nbRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: resolvedSubject,
              aspectRatio: '1:1',
              imageSize: '1K'
            })
          });
          if (nbRes.ok) {
            const nbData = await nbRes.json();
            if (nbData.imageUrl) {
              finalImageUrl = nbData.imageUrl;
              finalModelLabel = '🍌 Google Nano Banana 2 (gemini-3.1-flash-image)';
            }
          }
        } catch (e) {
          // fallback to FLUX Realism
        }

        // Fallback to FLUX Realism Engine if Nano Banana isn't returned
        if (!finalImageUrl) {
          setLoadingText('📸 FLUX Realism Engine Asli Tasweer Generate Kar Raha Hai...');
          const generated = generateFluxImageUrl(resolvedSubject, activeStyle);
          finalImageUrl = generated.url;
          finalModelLabel = generated.styleLabel;
          finalSeed = generated.seed;
          await new Promise(r => setTimeout(r, 800));
        }

        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: `Maine aapki request samajh kar **${finalModelLabel}** ke mutabiq asli shakl, qudrati symmetry aur mukammal visible features ke sath tasweer bana di hai:`,
          imageUrl: finalImageUrl,
          imagePrompt: query,
          imageStyle: finalModelLabel,
          imageSeed: finalSeed
        };
        setMessages([...newHistory, aiMsg]);
      } else {
        setLoadingText(`Running ${selectedModel}...`);
        const { reply, source } = await executeAiQuery(query, newHistory, {
          model: selectedModel,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
          systemPrompt,
          customGroq: groqKey,
          customOpenRouter: openRouterKey,
          autonomousReasoning: autonomousMode
        });

        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: reply,
          source
        };
        setMessages([...newHistory, aiMsg]);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        role: 'assistant',
        content: `Error processing query: ${err?.message || 'Please check your connection and try again.'}`
      };
      setMessages([...newHistory, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8F9FA] relative">
      {/* Clean Sleek Top Bar with Live Call Action */}
      <div className="py-2.5 px-4 md:px-6 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Sidebar Chhupayein' : 'Sidebar Kholein'}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-800">
              {selectedModel}
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              ⚡ Groq LPU Realtime
            </span>
          </div>
        </div>

        {/* Live Call Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveCallOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Start Live Voice Call with AI"
          >
            <PhoneCall size={14} className="animate-pulse" />
            <span>Live Call</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-5 max-w-4xl mx-auto w-full">
        {messages.map(msg => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-[#E7F8EC] border border-[#C2E7CB] text-[#0F5132] px-4 py-3 rounded-2xl rounded-tr-xs max-w-[85%] shadow-xs text-[13px] leading-relaxed break-words">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] text-[#0F5132]/70 mb-1">
                    <span>👤 You</span>
                  </div>
                  <div>{msg.content}</div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="bg-white border border-slate-200 text-slate-800 px-5 py-4 rounded-2xl rounded-tl-xs max-w-[88%] shadow-xs text-[13px] leading-relaxed break-words">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Sparkles size={14} />
                      <span>AI Studio Copilot</span>
                    </span>
                    {msg.source && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200">
                        {msg.source === 'realtime_clock'
                          ? '🕒 Live Clock'
                          : msg.source === 'groq'
                          ? '⚡ Groq LPU'
                          : msg.source === 'openrouter'
                          ? '🌐 OpenRouter'
                          : '🧠 Deep Neural Engine'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                {/* Formatted Rich Markdown Content */}
                <FormattedAiResponse content={msg.content} />

                {/* FLUX 8K Generated Image with Style Badge and Action Toolbar */}
                {msg.imageUrl && (
                  <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-950">
                    {/* Style Badge Banner */}
                    <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Camera size={13} />
                        {msg.imageStyle || '📸 Photorealistic 8K Output'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">FLUX.1 Engine</span>
                    </div>

                    {/* Image Preview Container */}
                    <div
                      className="relative group cursor-pointer overflow-hidden bg-black flex items-center justify-center min-h-[280px]"
                      onClick={() => {
                        setPreviewImageUrl(msg.imageUrl || null);
                        setPreviewImageTitle(msg.imagePrompt || 'AI Studio Photo');
                      }}
                    >
                      <img
                        src={msg.imageUrl}
                        alt={msg.imagePrompt || 'Generated Picture'}
                        className="w-full h-auto object-cover max-h-[520px] transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-slate-700">
                          <Maximize2 size={13} /> Full Screen / Zoom Kholein
                        </span>
                      </div>
                    </div>

                    {/* Image Action Toolbar */}
                    <div className="p-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        {/* Download Button */}
                        <button
                          onClick={() =>
                            handleDownloadImage(
                              msg.imageUrl!,
                              `studio-ai-${(msg.imagePrompt || 'photo').slice(0, 15).replace(/\s+/g, '-')}.jpg`
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-xs"
                          title="Download Image to Device"
                        >
                          <Download size={13} />
                          <span>Download Photo</span>
                        </button>

                        {/* Regenerate Variant Button */}
                        <button
                          onClick={() => handleRegenerateVariant(msg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-700"
                          title="Generate a new random variant of this picture"
                        >
                          <RefreshCw size={12} />
                          <span>Naya Variant Banao</span>
                        </button>
                      </div>

                      {/* Direct Full-Res Link */}
                      <a
                        href={msg.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white underline text-[11px]"
                      >
                        Original URL ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2.5 text-xs text-slate-600">
              <Loader2 size={16} className="animate-spin text-slate-700" />
              <span>{loadingText}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Tag if present */}
      {attachedFile && (
        <div className="max-w-4xl mx-auto w-full px-4 mb-2 flex items-center gap-2">
          <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
            📎 {attachedFile.name}
            <button
              onClick={onClearAttachment}
              className="hover:text-red-700 font-bold ml-1 cursor-pointer"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* SMS Input Dock & Under-Input Tools Panel */}
      <div className="p-4 bg-transparent max-w-4xl mx-auto w-full space-y-2">
        {/* WhatsApp Dock Style Input Bar */}
        <div className="bg-white border border-slate-200 rounded-full shadow-lg p-1.5 flex items-center gap-2">
          {/* Tools & Photo Functions Button */}
          <button
            onClick={() => setShowTools(!showTools)}
            title="AI Tools & Photo Studio (Tasweer aur doosray tools)"
            className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer relative ${
              showTools
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                : activeStyle !== 'auto'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wrench size={17} />
            {activeStyle !== 'auto' && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5"></span>
            )}
          </button>

          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach File / Photo"
            className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <Plus size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.mp3,.wav"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                alert(`Attached: ${e.target.files[0].name}`);
              }
            }}
          />

          {/* Textarea Input */}
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={
              activeStyle === 'camera'
                ? "Asli Camera Photo: (e.g. 'candid street photo of a man in Lahore', 'sunset on mountain')..."
                : activeStyle === 'cartoon2d'
                ? "2D Cartoon: (e.g. 'cute playful cat wearing glasses', 'superhero boy running')..."
                : activeStyle === 'render3d'
                ? "3D Pixar Render: (e.g. 'cute robotic puppy', 'smiling boy with backpack')..."
                : "Message ya prompt likhein..."
            }
            className="flex-1 text-xs md:text-sm py-2 px-3 bg-transparent border-none focus:outline-none resize-none max-h-24 text-slate-800 placeholder:text-slate-400"
          />

          {/* Live Call Button */}
          <button
            onClick={() => setIsLiveCallOpen(true)}
            title="Start Live Voice Call with AI"
            className="w-10 h-10 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs"
          >
            <Phone size={18} />
          </button>

          {/* Voice Input Mic Button */}
          <button
            onClick={startVoiceInput}
            title={isRecording ? 'Stop Recording' : 'Voice Input (Urdu/English)'}
            className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || loading}
            title="Send Message"
            className="w-10 h-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 flex items-center justify-center shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Selected Tool Active Indicator Chip */}
        {activeStyle !== 'auto' && !showTools && (
          <div className="flex items-center justify-between bg-indigo-50/80 border border-indigo-200 rounded-full px-3 py-1 text-xs text-indigo-900">
            <span className="flex items-center gap-1.5 font-medium">
              <span>{STYLE_OPTIONS.find(s => s.id === activeStyle)?.icon}</span>
              <span>Active Tool: <strong>{STYLE_OPTIONS.find(s => s.id === activeStyle)?.label}</strong></span>
            </span>
            <button
              onClick={() => setActiveStyle('auto')}
              className="text-xs text-indigo-600 hover:text-red-600 font-bold ml-2 cursor-pointer"
            >
              Hatao ✕
            </button>
          </div>
        )}

        {/* Tools Drawer Under SMS Typing Bar */}
        {showTools && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xl animate-in slide-in-from-bottom-2 fade-in duration-150 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wrench size={14} />
                </div>
                <span>AI & Photo Tools Panel</span>
              </div>
              <button
                onClick={() => setShowTools(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-semibold px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
              >
                Chhupayein ✕
              </button>
            </div>

            {/* Tool 1: Autonomous Problem Solver Mode */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Brain size={18} className={autonomousMode ? 'text-indigo-600' : 'text-slate-400'} />
                <div>
                  <div className="text-xs font-bold text-slate-800">Khud Rasta Nikalo (Deep Problem Solver)</div>
                  <div className="text-[10px] text-slate-500">AI khud soch kar mushkil masail ka step-by-step rasta nikalega</div>
                </div>
              </div>
              <button
                onClick={() => setAutonomousMode(!autonomousMode)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  autonomousMode
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {autonomousMode ? '🟢 Active' : '⚪ Off'}
              </button>
            </div>

            {/* Tool 2: Photo Styles & Generation Functions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={13} />
                  <span>Photo & Tasweer Tools:</span>
                </span>
                {activeStyle !== 'auto' && (
                  <button
                    onClick={() => setActiveStyle('auto')}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Reset Style
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                {STYLE_OPTIONS.map(st => {
                  const active = activeStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        setActiveStyle(st.id);
                        setShowTools(false);
                      }}
                      title={st.description}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer border ${
                        active
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-base">{st.icon}</span>
                      <div className="truncate">
                        <div className="truncate font-semibold">{st.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              onClick={e => {
                e.stopPropagation();
                handleDownloadImage(previewImageUrl, 'studio-ai-photo.jpg');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Download size={14} /> Download
            </button>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="p-1.5 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl border border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={previewImageUrl}
              alt="High-Res Preview"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>

          {previewImageTitle && (
            <p className="mt-3 text-xs text-slate-300 max-w-lg text-center font-medium">
              {previewImageTitle}
            </p>
          )}
        </div>
      )}

      {/* Live Audio Call Screen */}
      {isLiveCallOpen && (
        <LiveCallView
          onEndCall={handleEndLiveCall}
          selectedModel={selectedModel}
          systemPrompt={systemPrompt}
          groqKey={groqKey}
          openRouterKey={openRouterKey}
        />
      )}
    </div>
  );
};
