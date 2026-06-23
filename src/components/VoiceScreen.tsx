import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Keyboard, Power, ChevronLeft, Bot, Mic, Sliders, Volume2, Shield } from "lucide-react";
import AiOrb from "./AiOrb";
import VoiceVisualizer from "./VoiceVisualizer";
import { ActiveScreen } from "../types";

interface VoiceScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSimulateSpeechSubmit: (spokenText: string) => void;
  key?: string;
}

export default function VoiceScreen({
  onNavigate,
  onSimulateSpeechSubmit
}: VoiceScreenProps) {
  const [voiceState, setVoiceState] = useState<"listening" | "thinking">("listening");
  const [transcript, setTranscript] = useState("Go ahead, I'm listening...");
  const [dolbyEnabled, setDolbyEnabled] = useState(true);
  const [dolbyProfile, setDolbyProfile] = useState<"standard" | "cinema" | "voice_focus">("voice_focus");
  const [voicePresence, setVoicePresence] = useState(85);
  const [ambientGate, setAmbientGate] = useState(40);

  const recognitionRef = useRef<any>(null);
  
  const transcriptRef = useRef(transcript);
  const voiceStateRef = useRef(voiceState);

  useEffect(() => {
    transcriptRef.current = transcript;
    voiceStateRef.current = voiceState;
  }, [transcript, voiceState]);

  useEffect(() => {
    let recognizer: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(`"${currentTranscript}"`);
      };

      recognizer.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
          handleSimulationFallback();
        }
      };

      recognizer.onend = () => {
        // Only trigger submit if we have a real transcript
        const currentTranscript = transcriptRef.current;
        if (currentTranscript !== "Go ahead, I'm listening..." && currentTranscript.trim() !== '""') {
          setVoiceState("thinking");
          setTranscript("Analyzing vocal vectors & trajectory loads...");
          
          setTimeout(() => {
            onSimulateSpeechSubmit(currentTranscript.replace(/"/g, ''));
          }, 1500);
        } else {
          // Restart listening if no speech detected
          if (voiceStateRef.current === "listening") {
            try { recognizer.start(); } catch (e) {}
          }
        }
      };

      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        handleSimulationFallback();
      }
    } else {
      // Browser doesn't support Speech API, fallback to simulation
      handleSimulationFallback();
    }

    function handleSimulationFallback() {
      const speechCaptureTimer = setTimeout(() => {
        setTranscript('"Run diagnostic procedures on the Titanium shielding..."');
        const thinkingStartTimer = setTimeout(() => {
          setVoiceState("thinking");
          setTranscript("Analyzing energy thresholds & trajectory loads...");
          const redirectTimer = setTimeout(() => {
            onSimulateSpeechSubmit("Run a diagnostic on the Titanium shielding. We need to push the resistance by 12%.");
          }, 2200);
          return () => clearTimeout(redirectTimer);
        }, 2000);
        return () => clearTimeout(thinkingStartTimer);
      }, 2800);
      return () => clearTimeout(speechCaptureTimer);
    }

    return () => {
      if (recognizer) {
        recognizer.stop();
      }
    };
  }, []); // Note: leaving transcript out intentionally to avoid re-triggering init

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.35 }}
      className="relative h-full w-full flex flex-col justify-between items-center bg-black text-[#e2e2e2] px-6 py-6 overflow-y-auto custom-scrollbar select-none"
    >
      {/* Background shader gradients */}
      <div className="absolute inset-x-0 top-1/4 h-80 rounded-full bg-cyan-950/15 blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="relative z-10 w-full flex justify-between items-center pb-4 border-b border-white/5">
        <button
          onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
          className="p-1 px-2.5 rounded-full bg-zinc-900 border border-white/5 hover:border-cyan-400/40 text-gray-400 hover:text-cyan-400 flex items-center gap-1 text-xs font-mono transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-cyan-400">
          <Bot className="w-3.5 h-3.5 animate-bounce" />
          <span>Orb Core Live</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-cyan-400">
          <Mic className="w-4 h-4" />
        </div>
      </header>

      {/* Central Visual: Pulsing AI WebGL Sound-Orb */}
      <div className="flex-1 flex flex-col items-center justify-center w-full space-y-12 my-6">
        
        {/* Animated Sound Glow Core */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-400/5 blur-3xl rounded-full scale-110 pointer-events-none animate-pulse" />
          <AiOrb state={voiceState} className="w-44 h-44 md:w-52 md:h-52 z-10" />
        </div>

        {/* Dynamic Speech Caption & Interactive Subtitles */}
        <div className="space-y-3.5 text-center px-4 max-w-sm z-20">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                voiceState === "listening" ? "bg-cyan-400 animate-ping" : "bg-yellow-500 animate-pulse"
              }`}
            />
            <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              {voiceState === "listening" ? "Listening..." : "Processing Command..."}
            </p>
          </div>
          
          <h2 className="text-lg md:text-xl font-medium tracking-wide text-white min-h-[56px] px-2 leading-relaxed">
            {transcript}
          </h2>
        </div>

        {/* Level Audio Bar Wave graph */}
        <VoiceVisualizer 
          isActive={voiceState === "listening"} 
          barColor={dolbyEnabled ? (dolbyProfile === "cinema" ? "bg-amber-400" : dolbyProfile === "voice_focus" ? "bg-cyan-300" : "bg-purple-400") : "bg-gray-500"} 
        />

        {/* Dolby Voice configuration HUD Panel */}
        <div className="w-full max-w-sm p-4 rounded-xl bg-zinc-950/90 border border-amber-500/10 hover:border-amber-500/25 transition-all space-y-4 shadow-2xl relative z-20">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-4 h-4 ${dolbyEnabled ? "text-amber-400 animate-pulse" : "text-gray-500"}`} />
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">Dolby Voice 3D Module</span>
            </div>
            <button
              onClick={() => setDolbyEnabled(!dolbyEnabled)}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${dolbyEnabled ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-zinc-800 text-gray-500"}`}
            >
              {dolbyEnabled ? "ENABLED" : "BYPASSED"}
            </button>
          </div>

          {dolbyEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3.5"
            >
              {/* Profile Selectors */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Acoustic Signal Map</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["standard", "cinema", "voice_focus"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setDolbyProfile(style)}
                      className={`py-1 px-1.5 rounded text-[9px] font-mono uppercase tracking-tighter border transition-all truncate text-center ${dolbyProfile === style ? "bg-amber-950/40 border-amber-500 text-amber-400" : "bg-zinc-900/60 border-white/5 text-gray-500 hover:text-white"}`}
                    >
                      {style === "voice_focus" ? "Voice Focus" : style === "cinema" ? "Cine 3D" : "Standard"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for Voice Presence */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span>PRESENCE GAIN</span>
                  <span className="text-amber-400">{voicePresence}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={voicePresence}
                  onChange={(e) => setVoicePresence(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-zinc-900 rouded h-1 outline-none cursor-pointer"
                />
              </div>

              {/* Slider for Ambient Bypass Gate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-[#747474]">
                  <span>NOISE GATE THRESHOLD</span>
                  <span className="text-amber-400">-{ambientGate} dB</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={ambientGate}
                  onChange={(e) => setAmbientGate(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-zinc-900 rouded h-1 outline-none cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </div>

      </div>

      {/* Quick Pinned Interactive Floating Controls */}
      <div className="relative z-10 flex gap-6 items-center justify-center pb-8">
        
        {/* Power Stop cancel */}
        <button
          onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
          className="p-4 rounded-full bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/40 active:scale-90 transition-all cursor-pointer font-sans text-xs group"
        >
          <Power className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
        </button>

        {/* Switch direct Keyboard Input */}
        <button
          onClick={() => onNavigate(ActiveScreen.CHAT)}
          className="p-4 rounded-full bg-zinc-950 hover:bg-zinc-900 border border-white/10 text-gray-500 hover:text-cyan-400 hover:border-cyan-400/40 active:scale-95 transition-all cursor-pointer group"
        >
          <Keyboard className="w-5 h-5 text-gray-400 group-hover:text-cyan-400" />
        </button>

      </div>
    </motion.div>
  );
}
