import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Send,
  Mic,
  Cpu,
  Shield,
  Zap,
  Terminal,
  RefreshCw,
  Sparkles,
  Bot,
  Download,
  Volume2,
  VolumeX
} from "lucide-react";
import { Message, ActiveScreen, SystemMetrics } from "../types";
import HologramOverlay from "./HologramOverlay";
import ExportMenu from "./ExportMenu";
import { soundEngine } from "../lib/sound-engine";

interface ChatScreenProps {
  initialMessages: Message[];
  onNavigate: (screen: ActiveScreen) => void;
  onSendMessage: (text: string) => Promise<void>;
  messages: Message[];
  isThinking: boolean;
  voiceOutput: boolean;
  onVoiceOutputChange?: (enabled: boolean) => void;
  voicePersonality?: "jarvis" | "friday";
  key?: string;
}

export default function ChatScreen({
  onNavigate,
  onSendMessage,
  messages,
  isThinking,
  voiceOutput,
  onVoiceOutputChange,
  voicePersonality = "jarvis"
}: ChatScreenProps) {
  const [inputText, setInputText] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Voice synthesis & completion sound effect
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender === "JARVIS") {
        soundEngine.init();
        soundEngine.playCompleteSound();
        
        if (voiceOutput) {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop current speech
            const utterance = new SpeechSynthesisUtterance(latestMessage.text);
            if (voicePersonality === "friday") {
              const voices = window.speechSynthesis.getVoices();
              const femaleVoice = voices.find(v => 
                v.name.toLowerCase().includes("female") || 
                v.name.toLowerCase().includes("zira") || 
                v.name.toLowerCase().includes("samantha") || 
                v.name.toLowerCase().includes("karen") ||
                v.name.toLowerCase().includes("google us english") ||
                v.name.toLowerCase().includes("moira") ||
                v.name.toLowerCase().includes("sara") ||
                v.name.toLowerCase().includes("tessa") ||
                v.name.toLowerCase().includes("hazel")
              );
              if (femaleVoice) utterance.voice = femaleVoice;
              utterance.rate = 1.15; // Joyful & upbeat fast rate
              utterance.pitch = 1.45; // Energetic high-pitched anime tone
            } else {
              utterance.rate = 1.05; // Slightly faster for AI feel
              utterance.pitch = 0.9; // Slightly lower pitch for Paul Bettany feel
            }
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, voiceOutput, voicePersonality]);

  // Handle immediate voice cancel when voiceOutput changes to false
  useEffect(() => {
    if (!voiceOutput) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [voiceOutput]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, []);

  const handleSpeak = (text: string) => {
    if (voiceOutput && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      if (voicePersonality === "friday") {
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("zira") || 
          v.name.toLowerCase().includes("samantha") || 
          v.name.toLowerCase().includes("karen") ||
          v.name.toLowerCase().includes("google us english") ||
          v.name.toLowerCase().includes("moira") ||
          v.name.toLowerCase().includes("sara") ||
          v.name.toLowerCase().includes("tessa") ||
          v.name.toLowerCase().includes("hazel")
        );
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 1.15;
        utterance.pitch = 1.45;
      } else {
        utterance.rate = 1.05;
        utterance.pitch = 0.9;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    
    soundEngine.init();
    soundEngine.playProcessSound();
    
    setInputText("");
    await onSendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const suggestions = [
    "Run diagnostic on the Titanium shielding",
    "Analyze constraints of topological quantum grids",
    "Assess escape trajectories at 12% boost",
    "Suggest dark cyber color palettes"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.35 }}
      className="relative h-full flex flex-col justify-between bg-black text-[#e2e2e2] px-4 py-4 overflow-hidden"
    >
      {/* Structural background highlights mimicking terminal interfaces */}
      <div className="absolute inset-x-0 bottom-0 top-2/3 bg-gradient-to-t from-cyan-950/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-purple-950/5 blur-3xl pointer-events-none" />
      
      {/* Hologram Overlay - visible when JARVIS is processing */}
      <HologramOverlay isVisible={isThinking} />

      {/* Top Console Header Bar */}
      <header className="relative z-20 flex justify-between items-center pb-4 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <button
          onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
          className="p-1 px-2.5 rounded-full bg-zinc-900 border border-white/5 hover:border-cyan-400/40 text-gray-400 hover:text-cyan-400 flex items-center gap-1 text-xs font-mono transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Portal</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-bold text-white tracking-tight">JARVIS Neural Core Stream</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute Voice Response toggle */}
          <button
            onClick={() => {
              const nextVal = !voiceOutput;
              onVoiceOutputChange?.(nextVal);
              soundEngine.init();
              soundEngine.playKeystroke();
              
              // Mobile & Tablet browser safety: unlocking speech synthesis immediately under direct user tap event listener
              if (nextVal && 'speechSynthesis' in window) {
                try {
                  const unlockUtterance = new SpeechSynthesisUtterance("");
                  unlockUtterance.volume = 0;
                  window.speechSynthesis.speak(unlockUtterance);
                } catch (e) {
                  console.warn("Speech synthesis unlock bypassed: ", e);
                }
              }
            }}
            className={`p-1.5 rounded-full border text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
              voiceOutput
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-950"
                : "bg-zinc-900 border-white/5 text-gray-400 hover:text-white"
            }`}
            title={voiceOutput ? "Mute JARVIS voice response" : "Unmute JARVIS voice response"}
          >
            {voiceOutput ? (
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          <ExportMenu messages={messages} />
          
          <div className="p-1.5 bg-zinc-900 border border-white/5 rounded-full text-xs font-mono text-gray-400 hover:text-cyan-400 cursor-pointer">
            <Bot className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Messages Scroll View Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 py-6 px-1 max-w-2xl mx-auto w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isJARVIS = msg.sender === "JARVIS";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col gap-1.5 max-w-[85%] ${
                  isJARVIS ? "self-start" : "self-end items-end ml-auto"
                }`}
              >
                {/* Header tag with time and sender */}
                <div className="flex items-center gap-2 px-1">
                  {isJARVIS ? (
                    <>
                      <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] text-gray-600 font-mono">{msg.timestamp}</span>
                      <button 
                        onClick={() => handleSpeak(msg.text)}
                        className="ml-2 text-cyan-400/50 hover:text-cyan-400 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] text-gray-600 font-mono">{msg.timestamp}</span>
                      <span className="font-mono text-[10px] text-pink-400 uppercase tracking-widest font-semibold">
                        {msg.senderName}
                      </span>
                    </>
                  )}
                </div>

                {/* Glass Bubble Panel */}
                <div
                  className={`p-4 rounded-2xl relative shadow-xl border ${
                    isJARVIS
                      ? "bg-cyan-950/20 border-cyan-400/10 backdrop-blur-xl rounded-tl-none text-cyan-50"
                      : "bg-gradient-to-tr from-pink-950/30 to-purple-950/40 border-pink-500/20 rounded-tr-none text-white shadow-[0_4px_25px_rgba(236,72,153,0.05)]"
                  }`}
                >
                  <p className="text-sm font-sans font-normal leading-relaxed whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>

                  {/* Render Premium Diagnostic Telemetry sub-metrics if available */}
                  {isJARVIS && msg.metrics && (
                    <div className="mt-4 pt-4 border-t border-cyan-400/10 space-y-3.5">
                      
                      {/* Metric sub-grid cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-cyan-900/40 rounded-xl p-3 border border-cyan-400/5">
                          <span className="block text-[9px] uppercase font-mono tracking-widest text-cyan-500/70 mb-0.5">
                            Thermal Core Load
                          </span>
                          <span className="text-cyan-400 font-bold font-mono text-sm leading-none flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400/80" />
                            {msg.metrics.thermalLoad}
                          </span>
                        </div>
                        <div className="bg-cyan-900/40 rounded-xl p-3 border border-cyan-400/5">
                          <span className="block text-[9px] uppercase font-mono tracking-widest text-cyan-500/70 mb-0.5">
                            Success Probability
                          </span>
                          <span className="text-yellow-500 font-bold font-mono text-sm leading-none flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-yellow-500/80" />
                            {msg.metrics.successProb}
                          </span>
                        </div>
                      </div>

                      {/* Diagnostic Action Recommendation overlay */}
                      {msg.metrics.actionRecommended && (
                        <div className="p-3 bg-cyan-900/20 rounded-xl border border-dashed border-cyan-400/20 flex gap-2 items-start">
                          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-[9px] uppercase font-mono tracking-widest text-cyan-400">
                              System Advisory Recommendation:
                            </span>
                            <p className="text-xs text-cyan-100 font-sans mt-0.5 leading-relaxed">
                              {msg.metrics.actionRecommended}
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* JARVIS Thinking animation bubble */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1.5 max-w-[85%] self-start"
            >
              <div className="flex items-center gap-2 px-1">
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-semibold">
                  JARVIS
                </span>
                <span className="text-[10px] font-mono text-gray-600 animate-pulse">Calculating...</span>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="flex gap-1 items-center py-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                </div>
                <span className="text-xs font-mono text-gray-500 italic pl-1">
                  Synthesizing neural diagnostics
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endOfMessagesRef} />
      </div>

      {/* Suggestions Chips & Input console pinned closely */}
      <div className="relative z-20 pt-2 pb-6 max-w-2xl mx-auto w-full space-y-4 bg-black/90 backdrop-blur-lg">
        
        {/* Suggested Queries Chips */}
        {messages.length <= 2 && (
          <div className="space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-gray-600 px-1 text-center">
              Advisories Suggestion Matrix
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 px-1 justify-start no-scrollbar scrollbar-none">
              {suggestions.map((chip, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    soundEngine.init();
                    soundEngine.playKeystroke();
                    setInputText(chip);
                  }}
                  className="flex-shrink-0 px-3 py-1.5 bg-zinc-950/70 hover:bg-zinc-900 border border-white/5 hover:border-cyan-400/40 rounded-full text-xs text-gray-400 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  {chip}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Console Text Input Glass Frame */}
        <div className="relative">
          <div className="p-1 px-1.5 pl-5 bg-zinc-950 border border-white/5 rounded-full flex items-center justify-between gap-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] focus-within:border-cyan-400/50 hover:border-white/20 transition-all duration-300">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                soundEngine.init();
                soundEngine.playKeystroke();
                setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none flex-grow text-sm py-2.5 text-white placeholder-gray-500 font-sans font-light"
              placeholder="Inject command prompt sequence..."
            />
            
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mic Icon that launches voice mode */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate(ActiveScreen.VOICE)}
                type="button"
                className="p-2.5 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-zinc-900 transition-all cursor-pointer"
                title="Launch Voice System Interface"
              >
                <Mic className="w-4 h-4" />
              </motion.button>

              {/* Gradient send pill */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!inputText.trim()}
                type="button"
                className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  inputText.trim()
                    ? "bg-gradient-to-tr from-cyan-400 to-purple-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-90"
                    : "bg-zinc-900 text-gray-600 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Global status footnote */}
        <div className="flex justify-center items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gray-700 pointer-events-none text-center pt-1.5 select-none">
          <Terminal className="w-3.5 h-3.5" />
          <span>Secured Sandbox Link Node v2.4.0</span>
        </div>

      </div>
    </motion.div>
  );
}
