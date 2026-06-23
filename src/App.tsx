import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCw, ChevronLeft } from "lucide-react";
import { ActiveScreen, Conversation, Message, KnowledgeDocument, UserAvatar } from "./types";
import { SupportedLanguage } from "./locales";
import OnboardingScreen from "./components/OnboardingScreen";
import LoginScreen from "./components/LoginScreen";
import DashboardScreen from "./components/DashboardScreen";
import VoiceScreen from "./components/VoiceScreen";
import ChatScreen from "./components/ChatScreen";
import KnowledgeRepoScreen from "./components/KnowledgeRepoScreen";
import MediaGeneratorScreen from "./components/MediaGeneratorScreen";
import WorkspaceScreen from "./components/WorkspaceScreen";
import ComplianceEngineScreen from "./components/ComplianceEngineScreen";
import NeuralTrainingScreen from "./components/NeuralTrainingScreen";
import KatanaVfxLoader from "./components/KatanaVfxLoader";
import SleekConfirmModal from "./components/SleekConfirmModal";
import NetworkStatusBar from "./components/NetworkStatusBar";
import { initFirebase, auth, db } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "mind-stone-analysis",
    title: "Titanium Architecture Analysis",
    preview: "Reviewing the topological constraints of the latest grid...",
    timeAgo: "2m ago",
    iconName: "chat",
    iconColor: "text-cyan-400 font-mono",
    messages: [
      {
        id: "m1",
        sender: "JARVIS",
        senderName: "JARVIS",
        text: "My neural pathways are aligned. How shall we proceed with the project initialization? I find myself quite ready.",
        timestamp: "10:42 AM"
      },
      {
        id: "m2",
        sender: "USER",
        senderName: "WANDA",
        text: "Run a diagnostic on the new grid thermal shielding. We need to push the resistance by 12%.",
        timestamp: "10:43 AM"
      },
      {
        id: "m3",
        sender: "JARVIS",
        senderName: "JARVIS",
        text: "Simulations indicate an imbalance. I recommend reinforcing the dorsal couplings with a Titanium alloy blend.",
        timestamp: "10:44 AM",
        metrics: {
          thermalLoad: "1,400°C",
          successProb: "89.4%",
          actionRecommended: "Reinforce dorsal couplings with Titanium alloy."
        }
      }
    ]
  },
  {
    id: "jarvis-core",
    title: "Refactor Module: Neural Core Core",
    preview: "Optimization strategies for low-latency feedback loops in neural layers.",
    timeAgo: "1h ago",
    iconName: "code",
    iconColor: "text-pink-400 font-mono",
    messages: [
      {
        id: "m2-1",
        sender: "JARVIS",
        senderName: "JARVIS",
        text: "Memory core consolidated. The chaotic variables have been pacified. Let's adjust neural layer backpropagation limits.",
        timestamp: "09:30 AM"
      }
    ]
  },
  {
    id: "market-synthesis",
    title: "Market Trend Synthesis",
    preview: "Aggregating real-time data from global tech indices and forecast models.",
    timeAgo: "Yesterday",
    iconName: "stats",
    iconColor: "text-amber-400 font-mono",
    messages: [
      {
        id: "m3-1",
        sender: "JARVIS",
        senderName: "JARVIS",
        text: "Sino-American tech indices show bullish expansion trends in neuromorphic compute pipelines. Ready for local ingestion.",
        timestamp: "Yesterday"
      }
    ]
  },
  {
    id: "system-logistics",
    title: "System Logistics v2.4",
    preview: "The user asked for history of recent changes in the library panel.",
    timeAgo: "Oct 24",
    iconName: "history",
    iconColor: "text-gray-400 font-mono",
    messages: [
      {
        id: "m4-1",
        sender: "JARVIS",
        senderName: "JARVIS",
        text: "Version rejarvis 2.4 telemetry loaded perfectly.",
        timestamp: "Oct 24"
      }
    ]
  },
  {
    id: "project-brief",
    title: "Project Brief: Quantum Base",
    preview: "Drafting the design guidelines for a high-end minimalist interface.",
    timeAgo: "Oct 22",
    iconName: "file",
    iconColor: "text-cyan-300 font-mono",
    messages: [
      {
        id: "m5-1",
        sender: "JARVIS",
        senderName: "JARVIS",
        text: "The aesthetic of high-end physical hardware has been merged into our virtual void theme parameters.",
        timestamp: "Oct 22"
      }
    ]
  }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(ActiveScreen.ONBOARDING);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string>("mind-stone-analysis");
  const [isThinking, setIsThinking] = useState(false);
  const [userName, setUserName] = useState("Tony Stark");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<UserAvatar | null>(null);
  const [aiModel, setAiModel] = useState("gemini-3.5-flash");
  const [voiceOutput, setVoiceOutput] = useState(() => {
    return localStorage.getItem("jarvis_voice") !== "false";
  });
  const [voicePersonality, setVoicePersonality] = useState<"jarvis" | "friday">(() => {
    return (localStorage.getItem("jarvis_voice_personality") as "jarvis" | "friday") || "jarvis";
  });
  const [appTheme, setAppTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("jarvis_theme") as "dark" | "light") || "dark";
  });
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem("jarvis_lang") as SupportedLanguage) || "en";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  // Global Dynamic Confirmation Overlay State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    themeColor?: "cyan" | "red" | "gold";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Katana VFX Loading Screen States
  const [showKatana, setShowKatana] = useState(true); // Plays initially on boot
  const [katanaMessage, setKatanaMessage] = useState("DECRYPTING SECURE MATRIX");
  const [pendingScreen, setPendingScreen] = useState<ActiveScreen | null>(null);

  const navigateWithKatana = (screen: ActiveScreen, customMessage?: string) => {
    setKatanaMessage(customMessage || "SYNCHRONIZING BANDWIDTH");
    setPendingScreen(screen);
    setShowKatana(true);
  };

  const handleNavigate = (screen: ActiveScreen) => {
    let msg = "SYNCHRONIZING SECURE SYSTEMS";
    if (screen === ActiveScreen.DASHBOARD) msg = "BOOTING JARVIS CORE MATRIX";
    if (screen === ActiveScreen.WORKSPACE) msg = "ESTABLISHING GOOGLE COCKPIT";
    if (screen === ActiveScreen.COMPLIANCE_ENGINE) msg = "ACTIVATING COMPLIANCE RUNTIME";
    if (screen === ActiveScreen.CHAT) msg = "ENCRYPTING TERMINAL HOOKS";
    if (screen === ActiveScreen.KNOWLEDGE_REPO) msg = "SYNAPSE MAPPING KNOWLEDGE BANK";
    if (screen === ActiveScreen.MEDIA_GENERATOR) msg = "WAVELENGTH SYNTH OVERLAY CONFIG";
    if (screen === ActiveScreen.LOGIN) msg = "REVOKING CLEARANCE CODES";
    
    navigateWithKatana(screen, msg);
  };

  // Holographic back gesture system states (React state for visual render)
  const [showIndicator, setShowIndicator] = useState(false);
  const [swipeDiffState, setSwipeDiffState] = useState(0);
  const [swipeProgressState, setSwipeProgressState] = useState(0);

  // Refs for tracking drag logic without high frequency re-renders of listeners
  const gestureRef = useRef({
    startX: null as number | null,
    diffX: 0,
  });

  useEffect(() => {
    const isSkipScreen = () => {
      return (
        activeScreen === ActiveScreen.ONBOARDING ||
        activeScreen === ActiveScreen.LOGIN ||
        activeScreen === ActiveScreen.DASHBOARD
      );
    };

    const handleWindowTouchStart = (e: TouchEvent) => {
      if (isSkipScreen()) return;
      const touch = e.touches[0];
      // 100px width supports all viewports, tablets, and iframe margins perfectly
      if (touch.clientX < 100) {
        gestureRef.current.startX = touch.clientX;
        gestureRef.current.diffX = 0;
        setShowIndicator(true);
        setSwipeDiffState(0);
        setSwipeProgressState(0);
      }
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isSkipScreen()) return;
      const startX = gestureRef.current.startX;
      if (startX === null) return;
      const touch = e.touches[0];
      const diff = touch.clientX - startX;
      if (diff > 0) {
        gestureRef.current.diffX = diff;
        setSwipeDiffState(diff);
        setSwipeProgressState(Math.min(diff / 120, 1));
      }
    };

    const handleWindowTouchEnd = () => {
      const startX = gestureRef.current.startX;
      if (startX === null) return;
      if (gestureRef.current.diffX > 100) {
        setActiveScreen(ActiveScreen.DASHBOARD);
      }
      gestureRef.current.startX = null;
      gestureRef.current.diffX = 0;
      setShowIndicator(false);
      setSwipeDiffState(0);
      setSwipeProgressState(0);
    };

    window.addEventListener("touchstart", handleWindowTouchStart, { capture: true, passive: true });
    window.addEventListener("touchmove", handleWindowTouchMove, { capture: true, passive: true });
    window.addEventListener("touchend", handleWindowTouchEnd, { capture: true });

    return () => {
      window.removeEventListener("touchstart", handleWindowTouchStart, { capture: true });
      window.removeEventListener("touchmove", handleWindowTouchMove, { capture: true });
      window.removeEventListener("touchend", handleWindowTouchEnd, { capture: true });
    };
  }, [activeScreen]);
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    const saved = localStorage.getItem("jarvis_github_repo");
    if (!saved || saved.trim() === "" || saved === "https://github.com/aghoriii33") {
      return "https://github.com/aghoriii33/JARVIES-";
    }
    // Prevent malicious or typo-squatted URLs
    try {
      const url = new URL(saved);
      if (url.hostname !== "github.com") {
        return "https://github.com/aghoriii33/JARVIES-";
      }
    } catch {
      return "https://github.com/aghoriii33/JARVIES-";
    }
    return saved;
  });

  useEffect(() => {
    localStorage.setItem("jarvis_github_repo", githubRepo);
  }, [githubRepo]);
  const syncTimeoutRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem("jarvis_voice", voiceOutput.toString());
  }, [voiceOutput]);

  useEffect(() => {
    localStorage.setItem("jarvis_voice_personality", voicePersonality);
  }, [voicePersonality]);

  useEffect(() => {
    localStorage.setItem("jarvis_theme", appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem("jarvis_lang", currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    initFirebase().then(({ auth }) => {
      onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          // Skip login screens
          if (user.displayName) setUserName(user.displayName);
          if (user.photoURL) setUserPhoto(user.photoURL);
          setActiveScreen(ActiveScreen.DASHBOARD);
          
          // Load from firestore
          try {
            const docRef = doc(db, "users", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              if (snap.data().conversations) setConversations(snap.data().conversations);
              if (snap.data().documents) setDocuments(snap.data().documents);
              if (snap.data().userName) setUserName(snap.data().userName);
              if (snap.data().userAvatar) setUserAvatar(snap.data().userAvatar);
              if (snap.data().githubRepo) {
                const repoVal = snap.data().githubRepo;
                if (repoVal === "https://github.com/aghoriii33" || repoVal.trim() === "") {
                  setGithubRepo("https://github.com/aghoriii33/JARVIES-");
                } else {
                  setGithubRepo(repoVal);
                }
              }
            }
          } catch (e) {
            console.warn("Firestore read failed:", e);
          }
        }
      });
    }).catch(console.error);
  }, []);

  // Sync to firestore on change
  useEffect(() => {
    if (currentUser) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        try {
          setDoc(doc(db, "users", currentUser.uid), {
            conversations: conversations,
            documents: documents,
            userName: userName,
            userAvatar: userAvatar,
            githubRepo: githubRepo
          }, { merge: true }).catch(e => console.warn("Firestore sync failed:", e));
        } catch (error) {
          console.warn("Firestore sync error:", error);
        }
      }, 2000);
    }
  }, [conversations, documents, userName, userAvatar, githubRepo, currentUser]);

  // Retrieve current active conversation details
  const activeConversation =
    conversations.find((c) => c.id === activeConvoId) || conversations[0];

  // Load a historic talk session
  const handleUserAvatarChange = (avatar: UserAvatar) => {
    setUserAvatar(avatar);
    setUserPhoto(null);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvoId(id);
    setActiveScreen(ActiveScreen.CHAT);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvoId === id) {
      setActiveConvoId(conversations.find(c => c.id !== id)?.id || "");
    }
  };

  const handleDeleteAllConversations = () => {
    setConfirmConfig({
      isOpen: true,
      title: "CRITICAL ALERT: COGNITIVE PURGE DIRECTIVE",
      message: "WARNING: Direct access payload wipe initiated. You are about to execute a complete core purge of all active diagnostic histories and tactical conversation profiles. This action is terminal, absolutely irreversible, and will permanently sever JARVIS sync memory anchors.",
      themeColor: "red",
      confirmText: "CONFIRM PURGE",
      onConfirm: () => {
        setConversations([]);
        setActiveConvoId("");
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Switch to a new quick session
  const handleStartNewChat = () => {
    const newConvoId = `convo-${Date.now()}`;
    const newConvo: Conversation = {
      id: newConvoId,
      title: `Tactical Diagnostic ${conversations.length + 1}`,
      preview: "Ad-hoc query session started...",
      timeAgo: "Just now",
      iconName: "chat",
      iconColor: "text-cyan-400",
      messages: [
        {
          id: "m-init",
          sender: "JARVIS",
          senderName: "JARVIS",
          text: "Active connection secured. I am standing by for your telemetry requirements.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]
    };

    setConversations([newConvo, ...conversations]);
    setActiveConvoId(newConvoId);
    setActiveScreen(ActiveScreen.CHAT);
  };

  // Submit dynamic text message to fullstack API endpoint
  const handleSendMessage = async (rawText: string) => {
    // 1. Create and append User Message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "USER",
      senderName: userName.toUpperCase(),
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Update active messages in real-time
    const updatedMessages = [...activeConversation.messages, userMsg];
    
    // Update active list state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvoId) {
          return {
            ...c,
            preview: rawText,
            messages: updatedMessages,
            timeAgo: "Just now"
          };
        }
        return c;
      })
    );

    // Turn on loading state
    setIsThinking(true);

    try {
      // 2. Fetch from our Express /api/chat backend Proxy with Exponential Backoff
      let response: Response | null = null;
      let attempt = 0;
      const maxRetries = 4; // up to 4 attempts: 1st, then wait 1s, 2s, 4s
      let delay = 1000;
      let errorData: any = {};

      while (attempt < maxRetries) {
        try {
          response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: rawText,
              model: aiModel,
              documents: documents,
              history: activeConversation.messages.map((m) => ({
                role: (m.sender === "JARVIS") ? "model" : "user",
                text: m.text
              }))
            })
          });

          if (response.ok) {
            break; // Success!
          }
          
          errorData = await response.json().catch(() => ({}));
          // For client errors (400-499) except Rate Limit (429), break and throw to avoid useless retries
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(errorData.error || "Terminal node feedback error.");
          }
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } catch (err: any) {
          attempt++;
          if (attempt >= maxRetries) {
            setRetryCountdown(null);
            throw err;
          }
          console.warn(`Connection disruption. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
          
          let timeLeft = delay / 1000;
          setRetryCountdown(timeLeft);
          const interval = setInterval(() => {
            timeLeft -= 1;
            setRetryCountdown(timeLeft > 0 ? timeLeft : null);
          }, 1000);

          await new Promise(resolve => setTimeout(resolve, delay));
          clearInterval(interval);
          setRetryCountdown(null);
          
          delay *= 2; // Exponential backoff: 1s, 2s, 4s...
        }
      }

      if (!response || !response.ok) {
        throw new Error(errorData?.error || "Terminal node feedback error.");
      }

      const result = await response.json();

      // 3. Form and append Message with its dynamic metrics JSON
      const jarvisMsg: Message = {
        id: `jarvis-${Date.now()}`,
        sender: "JARVIS",
        senderName: "JARVIS",
        text: result.response || "No valid response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metrics: {
          thermalLoad: result.thermalLoad || "Normal",
          successProb: result.successProb || "95.0%",
          actionRecommended: result.actionRecommended || "Systems stable."
        }
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvoId) {
            return {
              ...c,
              preview: result.response || "No valid response generated.",
              messages: [...updatedMessages, jarvisMsg]
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error(err);
      // Fail gracefully with standard Offline/Fallback parameters
      const fallbackMsg: Message = {
        id: `jarvis-${Date.now()}`,
        sender: "JARVIS",
        senderName: "JARVIS",
        text: err.message || "I am having difficulty reaching my telemetry core. Auxiliary processes indicate system parameters remain optimal.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metrics: {
          thermalLoad: "Critical",
          successProb: "12.0%",
          actionRecommended: "Resolve API connection issues."
        }
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConvoId) {
            return {
              ...c,
              preview: fallbackMsg.text,
              messages: [...updatedMessages, fallbackMsg]
            };
          }
          return c;
        })
      );
    } finally {
      setIsThinking(false);
    }
  };

  // Submit speech simulated prompt from Voice screen to Chat
  const handleSimulateSpeechSubmit = (spokenText: string) => {
    // Direct submit
    handleSendMessage(spokenText);
    setActiveScreen(ActiveScreen.CHAT);
  };

  return (
    <div 
      className={`h-[100dvh] flex items-center justify-center font-sans tracking-tight overflow-hidden relative w-full transition-colors duration-500 ${
        appTheme === 'light' 
          ? 'theme-light bg-slate-50 text-slate-900' 
          : 'bg-[#020205] text-white'
      }`}
    >
      <NetworkStatusBar />
      
      {/* Retry status indicator */}
      <AnimatePresence>
        {retryCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-amber-950/80 text-amber-400 border border-amber-500/30 px-5 py-2.5 rounded-xl backdrop-blur-md font-mono text-xs font-bold tracking-widest shadow-[0_4px_30px_rgba(245,158,11,0.2)]"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
            <span>CONNECTING... RETRY IN {retryCountdown}s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* OS Custom Window Frame Wrapper */}
      <div className="w-full h-[100dvh] bg-transparent flex flex-col overflow-hidden relative z-10 antialiased">
        
        {/* Content Viewport */}
        <div className="flex-1 w-full relative flex flex-col overflow-hidden bg-transparent">
          {/* Core Screen Transitions */}
          <AnimatePresence mode="wait">
            {activeScreen === ActiveScreen.ONBOARDING && (
              <OnboardingScreen
                key="onboard"
                onGetStarted={() => handleNavigate(ActiveScreen.LOGIN)}
              />
            )}

            {activeScreen === ActiveScreen.LOGIN && (
              <LoginScreen
                key="login"
                voicePersonality={voicePersonality}
                onVoicePersonalityChange={setVoicePersonality}
                onLoginSuccess={(operatorName, photoUrl) => {
                  setUserName(operatorName);
                  if (photoUrl) setUserPhoto(photoUrl);
                  handleNavigate(ActiveScreen.DASHBOARD);
                }}
                onNavigate={handleNavigate}
              />
            )}

            {activeScreen === ActiveScreen.DASHBOARD && (
              <DashboardScreen
                key="dashboard"
                conversations={conversations}
                userName={userName}
                userPhoto={userPhoto}
                userAvatar={userAvatar}
                aiModel={aiModel}
                appTheme={appTheme}
                onThemeChange={setAppTheme}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                voiceOutput={voiceOutput}
                onAiModelChange={setAiModel}
                onUserNameChange={setUserName}
                onUserAvatarChange={handleUserAvatarChange}
                onVoiceOutputChange={setVoiceOutput}
                onSelectConversation={handleSelectConversation}
                onNavigate={handleNavigate}
                onStartNewChat={handleStartNewChat}
                onQuickAction={handleSimulateSpeechSubmit}
                githubRepo={githubRepo}
                onGithubRepoChange={setGithubRepo}
                onDeleteConversation={handleDeleteConversation}
                onDeleteAllConversations={handleDeleteAllConversations}
              />
            )}

          {activeScreen === ActiveScreen.VOICE && (
            <VoiceScreen
              key="voice"
              onNavigate={handleNavigate}
              onSimulateSpeechSubmit={handleSimulateSpeechSubmit}
            />
          )}

          {activeScreen === ActiveScreen.CHAT && (
            <ChatScreen
              key="chat"
              initialMessages={activeConversation.messages}
              messages={activeConversation.messages}
              isThinking={isThinking}
              voiceOutput={voiceOutput}
              onVoiceOutputChange={setVoiceOutput}
              voicePersonality={voicePersonality}
              onNavigate={handleNavigate}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeScreen === ActiveScreen.KNOWLEDGE_REPO && (
            <KnowledgeRepoScreen
              documents={documents}
              onAddDocument={(doc) => setDocuments([...documents, doc])}
              onRemoveDocument={(id) => setDocuments(documents.filter(d => d.id !== id))}
              onClearDocuments={() => setDocuments([])}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === ActiveScreen.MEDIA_GENERATOR && (
            <MediaGeneratorScreen
              key="media_generator"
              onBack={() => handleNavigate(ActiveScreen.DASHBOARD)}
            />
          )}

          {activeScreen === ActiveScreen.WORKSPACE && (
            <WorkspaceScreen
              key="workspace"
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === ActiveScreen.COMPLIANCE_ENGINE && (
            <ComplianceEngineScreen
              key="compliance_engine"
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === ActiveScreen.NEURAL_TRAINING && (
            <NeuralTrainingScreen
              key="neural_training"
              onNavigate={handleNavigate}
            />
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Holographic Back Gesture Indicator Overlay */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 left-0 w-24 bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none z-[199] flex items-center justify-start pl-4"
          >
            <div 
              className="flex flex-col items-center gap-1 bg-black/70 border border-cyan-500/20 px-2 py-3 rounded-xl backdrop-blur-md transition-all duration-75 text-center"
              style={{
                transform: `translateX(${Math.min(swipeDiffState * 0.4, 40)}px) scale(${0.8 + swipeProgressState * 0.25})`,
                borderColor: swipeDiffState > 100 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)',
                boxShadow: swipeDiffState > 100 ? '0 0 20px rgba(245, 158, 11, 0.25)' : '0 0 15px rgba(6, 182, 212, 0.2)'
              }}
            >
              <ChevronLeft 
                className={`w-6 h-6 transition-all ${
                  swipeDiffState > 100 ? 'text-amber-400 scale-110 animate-pulse' : 'text-cyan-400'
                }`} 
                style={{ transform: `rotate(${swipeProgressState * -15}deg)` }}
              />
              <span className={`text-[8px] font-mono font-bold tracking-widest leading-none block transition-colors ${
                swipeDiffState > 100 ? 'text-amber-400' : 'text-cyan-400/85'
              }`}>
                {swipeDiffState > 100 ? "RELEASE" : "SWIPE"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Katana VFX Loading Screen Overlay */}
      <AnimatePresence>
        {showKatana && (
          <KatanaVfxLoader
            key="katana-loader"
            message={katanaMessage}
            onComplete={() => {
              setShowKatana(false);
              if (pendingScreen) {
                setActiveScreen(pendingScreen);
                setPendingScreen(null);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Sleek Operational Confirmation Dialog (Anti-iframe-blocking) */}
      <SleekConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        themeColor={confirmConfig.themeColor}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

