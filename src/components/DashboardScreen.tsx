import { useState } from "react";
import { motion } from "motion/react";
import {
  Mic,
  MessageSquare,
  Image,
  Bookmark,
  Folder,
  BrainCircuit,
  CornerDownLeft,
  Settings,
  ChevronRight,
  Sparkles,
  Bot,
  Terminal,
  Database,
  LogOut,
  Film,
  Github,
  Mail,
  Grid,
  Trash2,
  ShieldCheck,
  Globe
} from "lucide-react";
import { Conversation, ActiveScreen, UserAvatar } from "../types";
import DashboardWidget from "./DashboardWidget";
import { SupportedLanguage, translations } from "../locales";
import NeuralHealthIndicator from "./NeuralHealthIndicator";

interface DashboardScreenProps {
  conversations: Conversation[];
  userName: string;
  userPhoto?: string | null;
  userAvatar?: UserAvatar | null;
  aiModel: string;
  appTheme: "dark" | "light";
  onThemeChange: (theme: "dark" | "light") => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  persona: { humor: number; formality: number; directness: number };
  onPersonaChange: (p: { humor: number; formality: number; directness: number }) => void;
  voiceOutput: boolean;
  onUserNameChange: (name: string) => void;
  onUserAvatarChange: (avatar: UserAvatar) => void;
  onAiModelChange: (model: string) => void;
  onVoiceOutputChange: (enabled: boolean) => void;
  onSelectConversation: (convoId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onStartNewChat: () => void;
  onQuickAction: (actionText: string) => void;
  githubRepo: string;
  onGithubRepoChange: (url: string) => void;
  onDeleteConversation?: (id: string) => void;
  onDeleteAllConversations?: () => void;
  key?: string;
}

export default function DashboardScreen({
  conversations,
  userName,
  userPhoto,
  userAvatar,
  aiModel,
  appTheme,
  onThemeChange,
  currentLanguage,
  onLanguageChange,
  persona,
  onPersonaChange,
  voiceOutput,
  onUserNameChange,
  onUserAvatarChange,
  onAiModelChange,
  onVoiceOutputChange,
  onSelectConversation,
  onNavigate,
  onStartNewChat,
  onQuickAction,
  githubRepo,
  onGithubRepoChange,
  onDeleteConversation,
  onDeleteAllConversations
}: DashboardScreenProps) {
  const [selectedTab, setSelectedTab] = useState<"all" | "saved" | "files" | "models">("all");
  const [showSettings, setShowSettings] = useState(false);

  const t = translations[currentLanguage] || translations.en;

  // Filter conversations/info based on tabs
  const filteredConversations = conversations;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="relative h-full w-full flex flex-col bg-black text-[#e2e2e2] p-3 sm:p-5 md:px-6 md:py-6"
    >
      {/* Dynamic Backing Elements */}
      <div className="absolute -right-20 bottom-24 w-80 h-80 rounded-full bg-cyan-900/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 top-20 w-72 h-72 rounded-full bg-purple-900/10 blur-3xl pointer-events-none" />

      {/* Top Application Bar */}
      <header className="flex flex-wrap sm:flex-nowrap justify-between items-center pb-4 border-b border-white/5 relative z-20 gap-3">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 overflow-hidden flex items-center justify-center text-cyan-400 font-mono font-bold text-xs relative hover:scale-105 active:scale-95 transition-all outline-none border-none cursor-pointer group z-30"
            title="Configure System Profile"
          >
            {userPhoto ? (
              <img
                className="w-full h-full object-cover rounded-full border border-cyan-400/30 group-hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] p-0.5 bg-zinc-950 transition-all"
                src={userPhoto}
                alt="User Avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className={`w-full h-full flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all group-hover:brightness-110
                  ${userAvatar?.color === 'cyan' ? 'bg-cyan-500' : ''}
                  ${userAvatar?.color === 'amber' ? 'bg-amber-500' : ''}
                  ${userAvatar?.color === 'purple' ? 'bg-purple-500' : ''}
                  ${userAvatar?.color === 'cyan' ? 'bg-cyan-500' : ''}
                  ${userAvatar?.color === 'rose' ? 'bg-rose-500' : ''}
                  ${userAvatar?.color === 'yellow' ? 'bg-yellow-500 text-black' : ''}
                  ${!userAvatar ? 'bg-yellow-500 text-black' : 'text-white'}
                `}
                style={{
                  clipPath: userAvatar?.shape === 'circle' ? 'circle(50% at 50% 50%)' :
                            userAvatar?.shape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                            userAvatar?.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                            userAvatar?.shape === 'octagon' ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                            'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // diamond default
                }}
              >
                <span>{userName ? userName.charAt(0).toUpperCase() : "U"}</span>
              </div>
            )}
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">JARVIS</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono text-gray-400 tracking-wider">Neural Core Sync</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
          <NeuralHealthIndicator appTheme={appTheme} />

          <a
            href={(githubRepo && githubRepo.startsWith('https://github.com/')) ? githubRepo : 'https://github.com/aghoriii33/JARVIES-'}
            target="_blank"
            rel="noopener noreferrer"
            title="Access Synced Repository"
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1 bg-zinc-900/60 border border-white/10 hover:border-cyan-400/30 rounded-full text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-zinc-850 active:scale-95 transition-all decoration-none shrink-0"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Codebase</span>
          </a>

          <button
            onClick={() => onNavigate(ActiveScreen.CHAT)}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1 bg-zinc-900 border border-white/10 rounded-full text-xs font-mono text-cyan-400 hover:bg-zinc-850 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal</span>
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-zinc-900 border border-white/5 rounded-full text-gray-400 hover:text-cyan-400 active:scale-90 transition-all cursor-pointer shrink-0 z-30"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20 relative z-10 space-y-8 animate-fade-in" id="main-dashboard-viewport">
        
        {/* Quick System Controls: Language & Theme Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-900/35 border border-white/5 rounded-2xl shadow-xl z-20" id="quick-preference-console">
          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Theme:
            </span>
            <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/5">
              <button
                key="theme-dark"
                type="button"
                onClick={() => onThemeChange("dark")}
                className={`px-3 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  appTheme === "dark"
                    ? "bg-cyan-950/45 border border-cyan-400/35 text-cyan-400 font-bold"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.blackTheme}
              </button>
              <button
                key="theme-light"
                type="button"
                onClick={() => onThemeChange("light")}
                className={`px-3 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  appTheme === "light"
                    ? "bg-amber-950/45 border border-amber-400/35 text-amber-400 font-bold"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.brightTheme}
              </button>
            </div>
          </div>

          {/* Language Matrix */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              LAN:
            </span>
            <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/5 gap-0.5">
              {(["en", "es", "de", "zh", "fr"] as const).map((lang) => (
                <button
                  key={`lang-${lang}`}
                  type="button"
                  onClick={() => onLanguageChange(lang)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase transition-all duration-200 cursor-pointer ${
                    currentLanguage === lang
                      ? "bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Welcome Title */}
        <div className="space-y-1.5 text-left" id="welcome-message-deck">
          <p className="text-xs uppercase tracking-widest font-mono text-gray-500">{t.welcomeBack}, {userName}.</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            {t.howHelp}
          </h2>
        </div>

        {/* Bento Grid Command Controllers */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Emerald Big Controller: Voice Assist */}
          <button
            onClick={() => onNavigate(ActiveScreen.VOICE)}
            className="col-span-2 md:col-span-1 h-36 rounded-2xl bg-gradient-to-tr from-cyan-900/60 to-cyan-500/80 p-5 flex flex-col justify-between items-start text-left border border-cyan-400/30 shadow-[0_4px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_40px_rgba(16,185,129,0.4)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
              <Mic className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center w-full">
                <span className="text-sm font-bold font-sans text-black">{t.talkJarvis}</span>
                <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[10px] text-black/70 font-mono mt-1">{t.talkJarvisSub}</p>
            </div>
          </button>

          {/* Rose/Pink Controller: Fast Text Chat */}
          <button
            onClick={onStartNewChat}
            className="h-32 rounded-2xl bg-gradient-to-tr from-pink-900/60 to-pink-500/80 p-4 flex flex-col justify-between items-start text-left border border-pink-400/30 shadow-[0_4px_30px_rgba(236,72,153,0.15)] hover:shadow-[0_4px_45px_rgba(236,72,153,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
              <MessageSquare className="w-4 h-4 text-pink-300" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white font-sans">{t.chatBot}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[9px] text-pink-100/60 font-mono mt-0.5">{t.chatBotSub}</p>
            </div>
          </button>

          {/* Purple Controller: Search Image */}
          <button
            onClick={() => {
              onNavigate(ActiveScreen.CHAT);
            }}
            className="h-32 rounded-2xl bg-gradient-to-tr from-purple-950/60 to-purple-600/80 p-4 flex flex-col justify-between items-start text-left border border-purple-400/30 shadow-[0_4px_30px_rgba(147,51,234,0.15)] hover:shadow-[0_4px_45px_rgba(147,51,234,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
              <Image className="w-4 h-4 text-purple-300" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white font-sans">Visual Sensory</span>
                <ChevronRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[9px] text-purple-100/60 font-mono mt-0.5">Diagnose uploaded telemetry</p>
            </div>
          </button>
          
          {/* Emerald Controller: Knowledge Repository */}
          <button
            onClick={() => onNavigate(ActiveScreen.KNOWLEDGE_REPO)}
            className="col-span-2 h-24 rounded-2xl bg-gradient-to-r from-cyan-900/60 to-cyan-600/60 p-4 flex items-center justify-between border border-cyan-500/30 shadow-[0_4px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_45px_rgba(16,185,129,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-cyan-400/30">
                <Database className="w-6 h-6 text-cyan-300" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white font-sans block">{t.knowledgeRepo}</span>
                <span className="text-[10px] text-cyan-100/60 font-mono mt-0.5 block">{t.knowledgeRepoSub}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-300 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Indigo Controller: Media Generator */}
          <button
            onClick={() => onNavigate(ActiveScreen.MEDIA_GENERATOR)}
            className="col-span-2 h-24 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-indigo-600/60 p-4 flex items-center justify-between border border-indigo-500/30 shadow-[0_4px_30px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_45px_rgba(99,102,241,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-indigo-400/30">
                <Film className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white font-sans block">Media Synthesizer</span>
                <span className="text-[10px] text-indigo-100/60 font-mono mt-0.5 block">Anime, Manga & 4K Video Render Engine</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Yellow/Amber Workspace Controller: Google Workspace Cockpit */}
          <button
            onClick={() => onNavigate(ActiveScreen.WORKSPACE)}
            className="col-span-2 h-24 rounded-2xl bg-gradient-to-r from-amber-950/60 to-amber-700/60 p-4 flex items-center justify-between border border-amber-500/30 shadow-[0_4px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_45px_rgba(245,158,11,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-amber-400/30">
                <Grid className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white font-sans block">{t.workspaceConnect}</span>
                <span className="text-[10px] text-amber-100/60 font-mono mt-0.5 block">{t.workspaceConnectSub}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Compliance & Risk Engine Controller */}
          <button
            onClick={() => onNavigate(ActiveScreen.COMPLIANCE_ENGINE)}
            className="col-span-2 h-24 rounded-2xl bg-gradient-to-r from-zinc-900 to-emerald-950 p-4 flex items-center justify-between border border-emerald-500/30 shadow-[0_4px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_45px_rgba(16,185,129,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-emerald-400/30">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white font-sans block">{t.complianceEngine}</span>
                <span className="text-[10px] text-emerald-100/60 font-mono mt-0.5 block">{t.complianceEngineSub}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Synaptic AI Core Training Portal */}
          <button
            onClick={() => onNavigate(ActiveScreen.NEURAL_TRAINING)}
            className="col-span-2 h-24 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 p-4 flex items-center justify-between border border-cyan-400/30 shadow-[0_4px_30px_rgba(6,182,212,0.15)] hover:shadow-[0_4px_45px_rgba(6,182,212,0.35)] transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-cyan-400/30">
                <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse animate-duration-1000" />
              </div>
              <div className="text-left font-sans">
                <span className="text-sm font-bold text-white block">{t.neuralTuner}</span>
                <span className="text-[10px] text-cyan-100/60 font-mono mt-0.5 block">{t.neuralTunerSub}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-2 transition-transform" />
          </button>


        </div>

        {/* Quick Filter Categories */}
        <div className="space-y-3">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedTab("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedTab === "all"
                  ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-zinc-950 text-gray-400 border-white/10 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Protocols</span>
            </button>
            <button
              onClick={() => setSelectedTab("saved")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedTab === "saved"
                  ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-zinc-950 text-gray-400 border-white/10 hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Settings</span>
            </button>
            <button
              onClick={() => setSelectedTab("files")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedTab === "files"
                  ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-zinc-950 text-gray-400 border-white/10 hover:text-white"
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Data Files</span>
            </button>
            <button
              onClick={() => setSelectedTab("models")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedTab === "models"
                  ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-zinc-950 text-gray-400 border-white/10 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Model Core</span>
            </button>
          </div>

          {/* Multi-Tab Render details for depth */}
          {selectedTab === "saved" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2 text-xs font-mono text-gray-400">
              <p>📌 Priority Diagnostic Target: atmospheric integrity calculations (Mark VII).</p>
              <p>🛡️ Active Coupling Lock: Titanium-Gold alloy structural mesh reinforcement recommendation.</p>
            </motion.div>
          )}

          {selectedTab === "files" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2 text-xs font-mono text-gray-400">
              <p>🗄️ diagnostics_log_A.json (24KB)</p>
              <p>🗄️ mark_vii_trajectories.csv (115KB)</p>
              <p>🗄️ heat_sink_models.fbx (4.2MB)</p>
            </motion.div>
          )}

          {selectedTab === "models" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-3.5 text-xs font-mono text-gray-400 text-left">
              <div className="space-y-1">
                <p>🧠 Core Language Agent: Google Gemini 3.5 Flash</p>
                <p>⚡ Latency Threshold: ~240ms</p>
                <p>🔊 Speech Synthesizer Modality: PCM 24kHz</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(ActiveScreen.NEURAL_TRAINING)}
                className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-purple-800/60 hover:from-cyan-900 hover:to-purple-800 border border-cyan-500/20 text-[#5ac8fa] text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm group"
              >
                <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse group-hover:scale-110 transition-transform" />
                <span>COMMENCE SYNAPSE TRAINING</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Real-time System Metrics */}
        <DashboardWidget />

        {/* Quick Actions Menu */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs uppercase tracking-widest font-mono text-gray-500 font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Summarize Clipboard",
              "Check System Status",
              "Scan Network Interfaces",
              "Initiate Diagnostic Sweep"
            ].map((action, i) => (
              <motion.button
                key={action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickAction(action)}
                className="py-3 px-4 bg-zinc-900 border border-white/5 hover:border-cyan-500/40 rounded-xl text-left hover:bg-cyan-950/20 transition-all group"
              >
                <div className="text-[11px] font-mono font-bold text-gray-300 group-hover:text-cyan-400 transition-colors">
                  {action}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* History List Section (Bento grid style) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs uppercase tracking-widest font-mono text-gray-500 font-bold">Recent Diagnostics</h3>
            <div className="flex gap-4">
              <span onClick={onDeleteAllConversations} className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"><Trash2 className="w-3 h-3" /> Clear</span>
              <span className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer">See all</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredConversations.map((convo) => (
              <motion.div
                key={convo.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectConversation(convo.id)}
                className="group p-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-cyan-400/40 cursor-pointer flex justify-between items-center transition-all"
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Custom glowing dynamic icon badge */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner">
                    {convo.iconName === "chat" && <Sparkles className={`w-5 h-5 ${convo.iconColor}`} />}
                    {convo.iconName === "code" && <BrainCircuit className={`w-5 h-5 ${convo.iconColor}`} />}
                    {convo.iconName === "stats" && <Sparkles className={`w-5 h-5 ${convo.iconColor}`} />}
                    {convo.iconName === "history" && <Sparkles className={`w-5 h-5 ${convo.iconColor}`} />}
                    {convo.iconName === "file" && <Folder className={`w-5 h-5 ${convo.iconColor}`} />}
                  </div>

                  {/* Listing Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between pr-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate pr-2 font-sans">
                        {convo.title}
                      </h4>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-mono uppercase text-gray-500 whitespace-nowrap pt-0.5">
                          {convo.timeAgo}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 font-sans font-light mt-1">
                      {convo.preview}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteConversation?.(convo.id); }}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all z-10"
                >
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Action Button "New Chat" pinned at the bottom panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartNewChat}
          className="w-full py-4.5 bg-gradient-to-tr from-cyan-900 to-purple-800 text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(6,182,212,0.3)] shadow-[0_0_20px_rgba(110,32,140,0.2)] active:scale-95 transition-all cursor-pointer border border-white/10 font-sans hover:brightness-110"
        >
          <Sparkles className="w-4.5 h-4.5 text-white" />
          <span>Initiate New Session</span>
        </motion.button>
      </div>

      {/* Dynamic Name Customization / Settings overlay */}
      {showSettings ? (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto pb-24"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-950 border border-cyan-400/20 p-6 rounded-2xl space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2 border-b border-white/5 pb-2">
              <Database className="w-4 h-4" />
              SYSTEM CUSTOMIZATION
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-mono text-gray-500">USER PROFILE DECAL</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => onUserNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm focus:border-cyan-400 focus:outline-none text-white font-sans"
                  placeholder="User Decal Name"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] uppercase font-mono text-gray-500">Neural Core AVATAR</label>
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {['circle', 'hexagon', 'triangle', 'octagon', 'diamond'].map((shape) => (
                      <button
                        key={shape}
                        onClick={() => onUserAvatarChange({ shape: shape as any, color: userAvatar?.color || 'yellow' })}
                        className={`w-8 h-8 flex items-center justify-center border transition-all ${userAvatar?.shape === shape || (!userAvatar && shape === 'diamond') ? 'border-cyan-400 bg-cyan-900/30' : 'border-white/10 bg-zinc-900 hover:border-white/30'}`}
                        title={shape}
                      >
                        <div className="w-3.5 h-3.5 bg-gray-400" style={{
                          clipPath: shape === 'circle' ? 'circle(50% at 50% 50%)' :
                                    shape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                                    shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                                    shape === 'octagon' ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                                    'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // diamond
                        }} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['yellow', 'emerald', 'cyan', 'rose', 'purple', 'amber'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onUserAvatarChange({ shape: userAvatar?.shape || 'diamond', color: color as any })}
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-[0_0_8px_rgba(0,0,0,0.5)] ${userAvatar?.color === color || (!userAvatar && color === 'yellow') ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                        title={color}
                        style={{
                          backgroundColor: color === 'yellow' ? '#eab308' :
                                           color === 'emerald' ? '#10b981' :
                                           color === 'cyan' ? '#06b6d4' :
                                           color === 'rose' ? '#f43f5e' :
                                           color === 'purple' ? '#a855f7' : '#f59e0b'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] uppercase font-mono text-gray-500">NEURAL CORE MODEL</label>
                  <span className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest">Active Matrix</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAiModelChange("gemini-3.1-flash-lite")}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] font-mono transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      aiModel === "gemini-3.1-flash-lite"
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-emerald-500/45 hover:text-emerald-300"
                    }`}
                    title="Gemini 3.1 Flash Lite: Ultra low latency fallback, optimized speed."
                  >
                    <span className="font-bold">3.1 Lite</span>
                    <span className="text-[8px] opacity-60 font-medium">Ultra Speed</span>
                  </button>
                  <button
                    onClick={() => onAiModelChange("gemini-3.5-flash")}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] font-mono transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      aiModel === "gemini-3.5-flash"
                        ? "bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-cyan-500/45 hover:text-cyan-300"
                    }`}
                    title="Gemini 3.5 Flash: Highly balanced, exceptionally fast, general reasoning."
                  >
                    <span className="font-bold">3.5 Flash</span>
                    <span className="text-[8px] opacity-60 font-medium">Balanced</span>
                  </button>
                  <button
                    onClick={() => onAiModelChange("gemini-2.0-flash-exp")}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] font-mono transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      aiModel === "gemini-2.0-flash-exp"
                        ? "bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-amber-500/45 hover:text-amber-300"
                    }`}
                    title="Gemini 2.0 Flash Exp: Highly powerful experimental model with advanced reasoning."
                  >
                    <span className="font-bold">2.0 Flash Exp</span>
                    <span className="text-[8px] opacity-60 font-medium">Advanced</span>
                  </button>
                  <button
                    onClick={() => onAiModelChange("gemini-3.1-pro-preview")}
                    className={`py-2 px-1 text-center rounded-lg border text-[11px] font-mono transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      aiModel === "gemini-3.1-pro-preview" || aiModel === "gemini-3.5-pro"
                        ? "bg-purple-950/40 border-purple-500 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-purple-500/45 hover:text-purple-300"
                    }`}
                    title="Gemini 3.1 Pro: Deep reasoning, logic verification, compliance check schemas."
                  >
                    <span className="font-bold">3.1 Pro</span>
                    <span className="text-[8px] opacity-60 font-medium">Deep Logic</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase font-mono text-gray-500">VOICE OVERLAY</label>
                <button
                  onClick={() => onVoiceOutputChange(!voiceOutput)}
                  className={`w-full py-2.5 px-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                    voiceOutput
                      ? "bg-cyan-950/40 border-cyan-400 text-cyan-400"
                      : "bg-zinc-900 border-white/10 text-gray-400"
                  }`}
                >
                  <span>JARVIS Vocal Feedback</span>
                  <span className={`w-8 h-4 rounded-full relative transition-all ${voiceOutput ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                     <span className={`absolute top-0.5 bottom-0.5 w-3 bg-white rounded-full transition-all ${voiceOutput ? 'right-0.5' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase font-mono text-gray-500">SYSTEM THEME</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onThemeChange("dark")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                      appTheme === "dark"
                        ? "bg-cyan-950/40 border-cyan-400 text-cyan-400"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    Dark Void
                  </button>
                  <button
                    onClick={() => onThemeChange("light")}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                      appTheme === "light"
                        ? "bg-amber-950/40 border-amber-400 text-amber-400"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase font-mono text-gray-500">GITHUB REPOSITORY LINK</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => onGithubRepoChange(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-xs font-mono text-cyan-400 focus:border-cyan-400 focus:outline-none"
                    placeholder="https://github.com/username/project"
                  />
                  <a
                    href={(githubRepo && githubRepo.startsWith('https://github.com/')) ? githubRepo : 'https://github.com/aghoriii33/JARVIES-'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2.5 hover:bg-zinc-850 bg-zinc-900 border border-white/10 hover:border-cyan-400/40 text-cyan-400 rounded-xl flex items-center justify-center transition-all"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[11px] uppercase font-mono text-cyan-500 font-semibold tracking-wider">Persona Tuning</label>
                
                <div className="space-y-2 cursor-pointer">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>Humor Level</span>
                    <span className="text-cyan-400">{persona.humor}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={persona.humor}
                    onChange={(e) => onPersonaChange({...persona, humor: parseInt(e.target.value)})}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 cursor-pointer">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>Formality</span>
                    <span className="text-cyan-400">{persona.formality}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={persona.formality}
                    onChange={(e) => onPersonaChange({...persona, formality: parseInt(e.target.value)})}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-2 cursor-pointer">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>Directness</span>
                    <span className="text-cyan-400">{persona.directness}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={persona.directness}
                    onChange={(e) => onPersonaChange({...persona, directness: parseInt(e.target.value)})}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[10px] text-gray-500 font-mono space-y-1">
                <p>• Visualizer Framework: WebGL Canvas Shaders</p>
                <p>• Cross-Platform Sync: Enabled</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => onNavigate(ActiveScreen.LOGIN)}
                className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-[10px] font-bold font-mono rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4.5 py-1.5 bg-cyan-400 text-black text-xs font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </motion.div>
  );
}
