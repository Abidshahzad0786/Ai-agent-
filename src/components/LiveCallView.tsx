import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Minimize2,
  Maximize2,
  Radio,
  FileText,
  Clock,
  ArrowDownCircle,
  Copy,
  Check
} from 'lucide-react';
import { executeAiQuery } from '../utils/aiEngine';

interface LiveCallViewProps {
  onEndCall: (transcript: { role: 'user' | 'assistant'; text: string }[]) => void;
  selectedModel: string;
  systemPrompt: string;
  groqKey: string;
  openRouterKey: string;
}

export const LiveCallView: React.FC<LiveCallViewProps> = ({
  onEndCall,
  selectedModel,
  systemPrompt,
  groqKey,
  openRouterKey
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking'>('connecting');

  const [currentInterimText, setCurrentInterimText] = useState('');
  const [aiTypingResponse, setAiTypingResponse] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showTranscript, setShowTranscript] = useState(true);
  const [copied, setCopied] = useState(false);

  const [conversation, setConversation] = useState<{ id: string; role: 'user' | 'assistant'; text: string; time: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const isAiSpeakingRef = useRef(false);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Timer for Call Duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, currentInterimText, aiTypingResponse]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to clean speech from internal thoughts, tags, markdown, and emojis
  const cleanNaturalSpeech = (raw: string): string => {
    let text = raw;
    // Strip <think> and <thought> tags
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
    text = text.replace(/<thought>[\s\S]*?<\/thought>/gi, '');
    // Strip code blocks and links
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/https?:\/\/\S+/g, '');
    // Strip markdown formatting symbols
    text = text.replace(/[#*`_~[\]()<>]/g, ' ');
    // Strip stage/phase labels like "Phase 1:", "Marhala 1:", "Goal:"
    text = text.replace(/^(Phase\s+\d+:?|Marhala\s+\d+:?|\d+\.\s*|🎯|🗺️|⚡|🛡️)/gim, '');
    // Strip emojis
    text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    // Clean excessive spaces
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const pickBestNaturalVoice = (synth: SpeechSynthesis): SpeechSynthesisVoice | null => {
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Urdu native voice
    const urdu = voices.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu'));
    if (urdu) return urdu;

    // 2. Hindi voice (sounds 100% natural & native for Urdu/Hindustani speech)
    const hindi = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी'));
    if (hindi) return hindi;

    // 3. Indian subcontinent voice (handles Urdu pronunciations properly)
    const subcon = voices.find(v => v.lang.includes('IN') || v.name.toLowerCase().includes('india'));
    if (subcon) return subcon;

    // 4. Natural/Google/Neural voice
    const natural = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural')) && !v.name.includes('Desktop'));
    if (natural) return natural;

    return voices[0];
  };

  // Text-To-Speech Function
  const speakText = (text: string) => {
    if (!isSpeakerOn || !synthRef.current) return;
    try {
      synthRef.current.cancel(); // Stop ongoing speech

      const cleanSpeech = cleanNaturalSpeech(text);
      if (!cleanSpeech) return;

      const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 450)); // Natural conversational snippet
      utterance.rate = 0.98; // Relaxed natural speaking pace
      utterance.pitch = 1.0;

      const voice = pickBestNaturalVoice(synthRef.current);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'hi-IN';
      }

      isAiSpeakingRef.current = true;
      setIsAiSpeaking(true);
      setCallStatus('speaking');

      utterance.onend = () => {
        isAiSpeakingRef.current = false;
        setIsAiSpeaking(false);
        setCallStatus('listening');
        // Restart speech recognition if not muted
        restartRecognition();
      };

      utterance.onerror = () => {
        isAiSpeakingRef.current = false;
        setIsAiSpeaking(false);
        setCallStatus('listening');
        restartRecognition();
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsAiSpeaking(false);
    }
  };

  // Process User Speech / Question
  const handleUserQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    // Add user message to conversation
    const userMsg = {
      id: 'usr-' + Date.now(),
      role: 'user' as const,
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversation(prev => [...prev, userMsg]);
    setCurrentInterimText('');
    setCallStatus('thinking');

    // Stop recognition while thinking/speaking so it doesn't loop user's speakers
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    try {
      const historyContext = conversation.slice(-4).map(c => ({
        id: c.id,
        role: c.role,
        content: c.text
      }));

      // In live call, prefer fast natural conversational model
      const liveModel = selectedModel.includes('deepseek-r1')
        ? 'llama-3.3-70b-versatile'
        : selectedModel;

      const naturalLivePrompt = `Aap ek aam, samajhdar aur mukhlis dost/saathi ki tarah direct live phone call par user se baat kar rahe hain.

KHALIS QAWANEEN (STRICT RULES):
1. AAM INSAAN KA LEHJA: Jaisa koi aam banda phone par pyari, seedhi aur natural Urdu (Roman Urdu / aam bol-chaal) mein baat karta hai, bilkul waisa lehja rakhein. Koi robot wali baatein ya mechanical formality nahi.
2. JO SOCHTE HAIN WO USER KO HARGIZ NAHI BATANA: Apni internal thinking, andruni reasoning, "<think>" tags, ya kisi qism ki deconstruction/analysis user ke samne mat bolna aur na likhna. Sirf aur sirf direct natural jawab dein.
3. RASTA AUR ASAL HAL SAMJHANA: Jab user koi masla, target ya rasta poochay, to bilkul aasan step-by-step tareeqay se guide karein jaise ek dost dusre dost ko rasta batata hai.
4. MUKHTASAR GUFTAGOO: Phone call par jawab hamesha 2-4 aasan jumlon mein dein taake conversation natural lage aur user foran baat aagay badha sakay.`;

      const res = await executeAiQuery(trimmed, historyContext, {
        model: liveModel,
        temperature: 0.65,
        top_p: 0.9,
        max_tokens: 500,
        systemPrompt: naturalLivePrompt,
        customGroq: groqKey,
        customOpenRouter: openRouterKey,
        autonomousReasoning: false
      });

      let reply = res.reply || 'Main aapki baat samajh gaya hoon. Hukum karein.';
      // Clean thinking tags and internal noise
      reply = reply
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
        .trim();

      setAiTypingResponse(reply);

      const aiMsg = {
        id: 'ai-' + Date.now(),
        role: 'assistant' as const,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversation(prev => [...prev, aiMsg]);
      setAiTypingResponse('');

      // Speak back naturally
      speakText(reply);
    } catch (err: any) {
      const errMsg = 'Mera rabta thora sa slow huwa hai, barah-e-karam dobara baat karein.';
      setConversation(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          text: errMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setCallStatus('listening');
      restartRecognition();
    }
  };

  const restartRecognition = () => {
    if (isMuted || isAiSpeakingRef.current) return;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (e) {
      // recognition might already be active
    }
  };

  // Start Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setCallStatus('connected');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ur-PK, en-US'; // Multi-lingual recognition

    recognition.onstart = () => {
      setCallStatus('listening');
    };

    recognition.onresult = (event: any) => {
      if (isAiSpeakingRef.current) return; // Don't transcribe AI voice

      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setIsUserSpeaking(true);
        setCurrentInterimText(interim);

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          setIsUserSpeaking(false);
          if (interim.trim().length > 3) {
            handleUserQuery(interim);
          }
        }, 1600); // 1.6s pause indicates turn completion
      }

      if (finalTranscript) {
        setIsUserSpeaking(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        handleUserQuery(finalTranscript);
      }
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition status:', err.error);
      setIsUserSpeaking(false);
      if (err.error !== 'no-speech' && !isAiSpeakingRef.current && !isMuted) {
        setTimeout(restartRecognition, 1000);
      }
    };

    recognition.onend = () => {
      if (!isMuted && !isAiSpeakingRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.warn('Auto start recognition failed:', e);
    }

    // Initial greeting
    setTimeout(() => {
      const greeting = 'Assalam-o-Alaikum! Haan ji, main sun raha hoon. Hukum karein, kya chal raha hai?';
      setConversation([
        {
          id: 'welcome-ai',
          role: 'assistant',
          text: greeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(greeting);
    }, 700);

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleMute = () => {
    if (!isMuted) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsMuted(true);
      setIsUserSpeaking(false);
    } else {
      setIsMuted(false);
      try {
        recognitionRef.current?.start();
      } catch {}
    }
  };

  const toggleSpeaker = () => {
    if (isSpeakerOn) {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeakerOn(false);
      setIsAiSpeaking(false);
    } else {
      setIsSpeakerOn(true);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const q = manualInput;
    setManualInput('');
    handleUserQuery(q);
  };

  const handleHangUp = () => {
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    const finalTranscripts = conversation.map(c => ({ role: c.role, text: c.text }));
    onEndCall(finalTranscripts);
  };

  const handleCopyTranscript = () => {
    const fullText = conversation.map(c => `[${c.role === 'user' ? 'You' : 'AI'} - ${c.time}]\n${c.text}\n`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Status Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 relative"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide text-slate-100">Live AI Audio Call</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                LPU Realtime
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Clock size={12} />
              <span>{formatTimer(callDuration)}</span>
              <span>•</span>
              <span className="capitalize text-slate-300">
                {callStatus === 'speaking'
                  ? 'AI bol raha hai (Speaking)...'
                  : callStatus === 'thinking'
                  ? 'Rasta nikal raha hai (Reasoning)...'
                  : callStatus === 'listening'
                  ? 'Aapki baat sun raha hai (Listening)...'
                  : 'Connected'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showTranscript
                ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Live Typing Transcript</span>
          </button>

          <button
            onClick={handleHangUp}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
          >
            <PhoneOff size={14} />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Main Calling Stage */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left/Center: Visual Avatar & Soundwaves */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative">
          {/* Pulsing Avatar Sphere */}
          <div className="relative mb-8">
            {/* Pulsing Aura Rings */}
            <div
              className={`absolute -inset-6 rounded-full transition-all duration-700 ${
                isAiSpeaking
                  ? 'bg-indigo-500/25 blur-2xl scale-125 animate-pulse'
                  : isUserSpeaking
                  ? 'bg-emerald-500/25 blur-2xl scale-125 animate-pulse'
                  : 'bg-indigo-500/10 blur-xl scale-100'
              }`}
            />

            <div
              className={`w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-300 border-2 ${
                isAiSpeaking
                  ? 'border-indigo-400 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-indigo-500 shadow-indigo-500/40 scale-105'
                  : isUserSpeaking
                  ? 'border-emerald-400 bg-gradient-to-tr from-emerald-900 via-emerald-700 to-emerald-500 shadow-emerald-500/40 scale-105'
                  : 'border-slate-700 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700'
              }`}
            >
              <Sparkles size={48} className={`text-white transition-transform ${isAiSpeaking || isUserSpeaking ? 'animate-bounce' : ''}`} />
            </div>
          </div>

          {/* Dynamic Audio Waves */}
          <div className="flex items-center justify-center gap-1.5 h-10 mb-4">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 65].map((height, idx) => {
              const active = isAiSpeaking || isUserSpeaking;
              return (
                <div
                  key={idx}
                  style={{
                    height: active ? `${height}%` : '15%',
                    transition: 'height 0.18s ease-in-out'
                  }}
                  className={`w-1 rounded-full ${
                    isAiSpeaking
                      ? 'bg-indigo-400'
                      : isUserSpeaking
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">
            {isAiSpeaking ? 'AI bol raha hai...' : isUserSpeaking ? 'Aap bol rahe hain...' : 'Live Call Active — Kuch bhi bolein'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Groq LPU Instant Voice • Real-time Speech-to-Speech & Live Typing
          </p>

          {/* Live Interim Spoken Words Banner */}
          {(currentInterimText || isUserSpeaking) && (
            <div className="mt-6 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs md:text-sm font-medium animate-pulse max-w-xl">
              <span className="font-bold mr-1 text-emerald-400">👤 Aap:</span> "{currentInterimText}..."
            </div>
          )}
        </div>

        {/* Right Drawer: Live Typing Transcript Feed */}
        {showTranscript && (
          <div className="w-full md:w-[420px] lg:w-[480px] bg-slate-900/90 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-[320px] md:h-full backdrop-blur-md">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Radio size={14} className="text-emerald-400 animate-pulse" />
                <span>Live Conversation Transcript</span>
              </span>
              <button
                onClick={handleCopyTranscript}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 bg-slate-800 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {conversation.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-emerald-950/40 border-emerald-700/40 text-emerald-100 ml-4'
                      : 'bg-slate-800/80 border-slate-700 text-slate-100 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-semibold">
                    <span>{item.role === 'user' ? '👤 Aap (User)' : '⚡ AI Voice'}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{item.text}</div>
                </div>
              ))}

              {/* Real-time typing response while AI is generating */}
              {aiTypingResponse && (
                <div className="p-3 rounded-xl border bg-slate-800/80 border-indigo-500/40 text-indigo-100 mr-4 animate-in fade-in">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-indigo-300 font-semibold">
                    <Sparkles size={11} className="animate-spin" />
                    <span>AI Typing Realtime...</span>
                  </div>
                  <div className="whitespace-pre-wrap">{aiTypingResponse}</div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Quick Text Input for noisy environment */}
            <form onSubmit={handleManualSubmit} className="p-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="Type karein agar mic band rakhna ho..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Phone Call Controls Dock */}
      <div className="p-4 md:p-6 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-center gap-5 backdrop-blur-md">
        {/* Mic Mute Toggle */}
        <button
          onClick={toggleMute}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-full transition-all cursor-pointer ${
            isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Hang Up (Red Call End Button) */}
        <button
          onClick={handleHangUp}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
          title="Call Khatam Karein (Hang Up)"
        >
          <PhoneOff size={24} />
        </button>

        {/* Speaker Output Toggle */}
        <button
          onClick={toggleSpeaker}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-full transition-all cursor-pointer ${
            !isSpeakerOn
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title={isSpeakerOn ? 'Mute AI Voice' : 'Enable AI Voice'}
        >
          {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>
    </div>
  );
};
