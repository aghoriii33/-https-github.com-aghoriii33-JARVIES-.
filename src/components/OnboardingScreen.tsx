import { motion } from "motion/react";
import { ArrowRight, Bot, Compass, ShieldAlert, Monitor, Globe, Terminal } from "lucide-react";
import AiOrb from "./AiOrb";

interface OnboardingScreenProps {
  onGetStarted: () => void;
  key?: string;
}

export default function OnboardingScreen({ onGetStarted }: OnboardingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="relative h-full w-full flex flex-col justify-between items-center px-6 py-12 overflow-y-auto custom-scrollbar bg-black text-[#e2e2e2]"
    >
      {/* Background Tech Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30 select-none bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-600/10 blur-3xl opacity-60 pointer-events-none" />

      {/* Header Container */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-cyan-400 font-semibold font-mono">
            V2.4.0 Secure
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer" />
          <ShieldAlert className="w-4 h-4 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer" />
        </div>
      </div>

      {/* Central Visual: Floating AI Orb with Orbit Lines */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center my-6">
        {/* Animated outer tech dashboard curves */}
        <div className="absolute inset-0 border border-white/5 rounded-full scale-110 pointer-events-none" />
        <div className="absolute inset-0 border border-cyan-400/10 rounded-full scale-[1.18] animate-[spin_40s_linear_infinite] pointer-events-none" />
        <div className="absolute inset-0 border border-t-purple-500/20 border-r-transparent border-b-transparent border-l-transparent rounded-full scale-[1.25] animate-[spin_25s_linear_infinite_reverse] pointer-events-none" />

        <AiOrb state="stable" className="w-48 h-48 md:w-56 md:h-56 z-10" />
      </div>

      {/* Middle Text Content: Identity & Pitch */}
      <div className="relative z-10 w-full text-center max-w-sm space-y-4">
        <h1 className="font-sans text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          JARVIS
        </h1>
        <p className="text-xs tracking-[0.25em] uppercase text-cyan-400 font-mono font-medium">
          Your Premium Quantum Assistant
        </p>
        <div className="pt-2 px-2">
          <p className="text-sm text-gray-400 leading-relaxed max-w-[300px] mx-auto select-none font-sans font-normal">
            Experience the next generation of intelligence, precision, and immersive digital interaction.
          </p>
        </div>

        {/* Platform Availability Badges */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <Monitor className="w-5 h-5 text-gray-400" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">Windows</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">Web</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <Terminal className="w-5 h-5 text-gray-400" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500">Linux</span>
          </div>
        </div>
      </div>

      {/* User Actions & Onboarding Control */}
      <div className="relative z-10 w-full flex flex-col gap-6 items-center">
        {/* Pagination Glass Dots */}
        <div className="flex gap-2">
          <div className="w-2.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Action Button */}
        <button
          onClick={onGetStarted}
          className="w-full max-w-[310px] py-4.5 px-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-semibold text-base shadow-[0_0_30px_rgba(16,185,129,0.35)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] border border-white/10"
        >
          <span className="text-white">Get Started</span>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>

        {/* Secondary diagnostic status chip */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-full text-[10px] uppercase font-mono tracking-wider text-gray-500 select-none">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span>Core Telemetry Synchronized</span>
        </div>
      </div>
    </motion.div>
  );
}
