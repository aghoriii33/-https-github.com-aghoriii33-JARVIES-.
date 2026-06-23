import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  User,
  Fingerprint,
  Eye,
  EyeOff,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Compass,
  Monitor,
  Globe,
  LogIn,
  Phone
} from "lucide-react";
import { ActiveScreen } from "../types";
import { signInWithGoogle, signUpWithEmail, signInWithEmail, setupRecaptcha, requestPhoneOTP } from "../firebase";
import { ConfirmationResult } from "firebase/auth";
import { countryCodes } from "../countryCodes";

interface LoginScreenProps {
  onLoginSuccess: (operatorName: string, photoUrl?: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  key?: string;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const [operatorId, setOperatorId] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [otpCode, setOtpCode] = useState("");
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanState, setScanState] = useState<"holding" | "scanning" | "verified" | "idle">("idle");
  const [authStage, setAuthStage] = useState<"input" | "decrypting" | "authorized">("input");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Handle manual sign-in submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = operatorId.trim();
    if (!emailTrimmed) {
      setErrorMessage("OPERATOR EMAIL REQUIRED.");
      return;
    }

    if (!securityCode) {
      setErrorMessage("ACCESS CODE MISSING.");
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(emailTrimmed, securityCode);
      } else {
        await signInWithEmail(emailTrimmed, securityCode);
      }
      triggerAccessSequence(emailTrimmed.split('@')[0]);
    } catch (err: any) {
      let msg = err.message || "AUTHENTICATION FAILED.";
      if (msg.includes("auth/operation-not-allowed")) {
        msg = "EMAIL/PASSWORD AUTH DISABLED. PLEASE ENABLE IT IN FIREBASE CONSOLE.";
      }
      setErrorMessage(msg);
    }
  };

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!phoneConfirmation) {
      const formattedPhone = countryCode + phoneNumber.trim();
      setIsSendingOtp(true);
      try {
        const verifier = await setupRecaptcha("recaptcha-container");
        const confirmation = await requestPhoneOTP(formattedPhone, verifier);
        setPhoneConfirmation(confirmation);
      } catch (err: any) {
        let msg = err.message || "OTP REQUEST FAILED.";
        if (msg.includes("auth/operation-not-allowed")) {
          msg = "PHONE AUTH DISABLED. PLEASE ENABLE IT IN FIREBASE CONSOLE.";
        }
        setErrorMessage(msg);
      } finally {
        setIsSendingOtp(false);
      }
    } else {
      if (!otpCode) {
        setErrorMessage("OTP CODE MISSING.");
        return;
      }
      try {
        const result = await phoneConfirmation.confirm(otpCode);
        triggerAccessSequence(result.user?.displayName || result.user?.phoneNumber || "Phone Operator");
      } catch (err: any) {
        setErrorMessage(err.message || "CODE VERIFICATION FAILED.");
      }
    }
  };

  // Holographic decryption animation sequence
  const triggerAccessSequence = (name: string) => {
    setAuthStage("decrypting");
    
    // Stagger terminal logs
    const logs = [
      "SYNCHRONIZING SECURE TUNNELS...",
      "BYPASSING LOCAL DECAL BLOCKADES...",
      `OPERATOR RESOLVED: ${name.toUpperCase()}`,
      "INJECTING TEMPORAL CORE STREAMS...",
      "STRUCTURAL METRICS STABILIZED.",
      "ENCRYPTING BACKUP CACHE KEYS...",
      "AUTHORIZATION MATRIX COMPLETE."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, log]);
      }, (index + 1) * 350);
    });

    setTimeout(() => {
      onLoginSuccess(name);
    }, logs.length * 350 + 400);
  };

  // Holographic biometric fingerprint hold scanning loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning && scanState === "scanning") {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState("verified");
            setIsScanning(false);
            
            // Auto complete authorization
            setTimeout(() => {
              triggerAccessSequence(operatorId || "Stark Operator");
            }, 600);
            return 100;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 80);
    } else if (!isScanning && scanState !== "verified") {
      setScanProgress(0);
      setScanState("idle");
    }
    return () => clearInterval(interval);
  }, [isScanning, scanState]);

  const handleScanStart = () => {
    setErrorMessage(null);
    if (!operatorId.trim()) {
      setErrorMessage("PLEASE ENTER AN OPERATOR ID BEFORE SCANNING.");
      return;
    }
    setIsScanning(true);
    setScanState("scanning");
    setScanProgress(0);
  };

  const handleScanEnd = () => {
    if (scanState !== "verified") {
      setIsScanning(false);
      setScanState("idle");
      setScanProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="relative h-full w-full flex flex-col justify-between items-center px-6 py-8 overflow-y-auto custom-scrollbar bg-black text-[#e2e2e2]"
    >
      {/* Background Cyberpunk Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none bg-[linear-gradient(to_right,rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Futuristic soft gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Screen Header */}
      <header className="relative z-10 w-full flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-cyan-400">
          <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Security Protocol v2.4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Clearance Locked</span>
        </div>
      </header>

      {/* Multi-stage Inner Forms with sliding transitions */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center max-w-sm my-6 space-y-6">
        <AnimatePresence mode="wait">
          {authStage === "input" && (
            <motion.div
              key="auth-input"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Product Badge Area */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-zinc-950 border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] mb-1">
                  <ShieldCheck className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-display">
                  CREDENTIAL CLEARANCE
                </h1>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  Secure Sandbox Verification Gateway
                </p>
              </div>

              {/* Auth Mode Toggle */}
              <div className="flex p-1 bg-zinc-900 border border-white/10 rounded-xl mt-4">
                <button
                  onClick={() => setAuthMode("email")}
                  className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-lg transition-all ${
                    authMode === "email" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-cyan-400/70"
                  }`}
                >
                  Email / Pass
                </button>
                <button
                  onClick={() => setAuthMode("phone")}
                  className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-widest rounded-lg transition-all ${
                    authMode === "phone" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-cyan-400/70"
                  }`}
                >
                  Phone OTP
                </button>
              </div>

              {authMode === "email" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 1. Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] items-center font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                      Operator Email
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={operatorId}
                        onChange={(e) => setOperatorId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-sm focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all text-white font-sans"
                        placeholder="operator@stark-industries.com"
                      />
                    </div>
                  </div>

                  {/* 2. Custom Secure Code */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        Protocol Access Key
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showCode ? "text" : "password"}
                        required
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 bg-zinc-950 border border-white/10 rounded-xl text-sm focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all text-white font-mono tracking-wider"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
                      >
                        {showCode ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/20 text-xs text-red-400 flex gap-2.5 items-start"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="font-mono leading-relaxed uppercase pr-1 text-[10px]">{errorMessage}</span>
                    </motion.div>
                  )}

                  {/* Gate Authentication Trigger */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500/90 to-cyan-600 text-black font-bold text-sm tracking-widest hover:brightness-105 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase border border-white/10"
                    >
                      <ShieldCheck className="w-4.5 h-4.5 text-white" />
                      <span className="text-white">{isSignUp ? "Initialize Profile" : "Verify Handshake"}</span>
                    </button>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                      {isSignUp ? "Already have a decal? Synchronize." : "Need a decal? Create an identity."}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  {!phoneConfirmation ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] items-center font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                        Mobile Uplink
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-1/3 px-3 py-3 bg-zinc-950 border border-white/10 rounded-xl text-xs focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all text-white font-sans truncate"
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code + c.country} value={c.code}>
                              {c.code} {c.country}
                            </option>
                          ))}
                        </select>
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                            <Phone className="w-4 h-4" />
                          </span>
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-sm focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all text-white font-sans"
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] items-center font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                        One-Time Pin (OTP)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-sm focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all text-white font-mono tracking-wider"
                          placeholder="123456"
                        />
                      </div>
                    </div>
                  )}

                  <div id="recaptcha-container"></div>

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/20 text-xs text-red-400 flex gap-2.5 items-start"
                    >
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="font-mono leading-relaxed uppercase pr-1 text-[10px]">{errorMessage}</span>
                    </motion.div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500/90 to-cyan-600 text-black font-bold text-sm tracking-widest hover:brightness-105 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase border border-white/10 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4.5 h-4.5 text-white" />
                      <span className="text-white">
                        {isSendingOtp ? "TRANSMITTING..." : (!phoneConfirmation ? "Transmit OTP" : "Verify Protocol")}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* Holographic Biometric Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-[9px] font-mono tracking-widest text-gray-600 uppercase">
                  or use Biometric Override / SSO
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Immersive Holographic Fingerprint Scan Target */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Pulsing visual cues */}
                    <div
                      className={`absolute inset-0 rounded-full border transition-all duration-500 ${
                        scanState === "scanning"
                          ? "border-cyan-400 animate-ping scale-110 opacity-30"
                          : "border-white/5"
                      }`}
                    />
                    <div
                      className={`absolute -inset-1.5 rounded-full border border-dashed transition-all duration-500 ${
                        scanState === "scanning" ? "border-cyan-400/40 animate-spin" : "border-white/5"
                      }`}
                      style={{ animationDuration: "8s" }}
                    />

                    {/* Interconnected Canvas interactive sensor */}
                    <button
                      type="button"
                      onMouseDown={handleScanStart}
                      onMouseUp={handleScanEnd}
                      onMouseLeave={handleScanEnd}
                      onTouchStart={handleScanStart}
                      onTouchEnd={handleScanEnd}
                      className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        scanState === "scanning"
                          ? "bg-cyan-950/70 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] text-cyan-400 scale-95"
                          : scanState === "verified"
                          ? "bg-green-950/60 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          : "bg-zinc-950 border-white/10 text-gray-400 hover:border-cyan-400/30 hover:text-cyan-400"
                      }`}
                    >
                      <Fingerprint className={`w-10 h-10 ${scanState === "scanning" ? "animate-pulse" : ""}`} />
                    </button>

                    {/* Percentage ticker overlay */}
                    {scanState === "scanning" && (
                      <span className="absolute bottom-1 bg-zinc-950/90 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shadow-lg">
                        {scanProgress}%
                      </span>
                    )}
                  </div>
                  
                  {/* Google Login Button */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const cred = await signInWithGoogle();
                          onLoginSuccess(cred.user.displayName || "Google Operator", cred.user.photoURL || "");
                        } catch (err) {
                          setErrorMessage("SSO LOGIN INITIATIVE FAILED.");
                        }
                      }}
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center border transition-all cursor-pointer bg-zinc-950 border-white/10 text-gray-400 hover:border-cyan-400/30 hover:text-cyan-400"
                    >
                      <LogIn className="w-8 h-8" />
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-1 px-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    BIOMETRIC OR GOOGLE PROTOCOLS
                  </p>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    {scanState === "scanning"
                      ? "HOLD FIRMLY TO COMPLETE MATRIX INTERSECT"
                      : scanState === "verified"
                      ? "DECAL SYNC GRANTED"
                      : "HOVER OR PRESS ORB TO ENGAGE PROTOCOLS"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {authStage === "decrypting" && (
            <motion.div
              key="auth-decrypting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="p-6 rounded-2xl bg-zinc-950/60 border border-cyan-400/10 backdrop-blur-2xl shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-zinc-900 rounded-full border border-white/5 relative">
                  <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-sm font-bold font-mono text-cyan-400 tracking-wider uppercase">
                    DECRYPTING PROTOCOL SYNC
                  </h3>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mt-0.5 animate-pulse">
                    Linking secure terminal nodes
                  </p>
                </div>
              </div>

              {/* Live decrypting logs terminal */}
              <div className="bg-black/90 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 h-36 overflow-y-auto space-y-2 no-scrollbar border-l-2 border-l-cyan-400 select-none">
                {terminalLogs.length === 0 && (
                  <p className="text-gray-500 italic animate-pulse">Initializing authorization layers...</p>
                )}
                {terminalLogs.map((log, index) => (
                  <p
                    key={index}
                    className={
                      log.includes("COMPLETE") || log.includes("STABILIZED")
                        ? "text-green-400"
                        : log.includes("OPERATOR")
                        ? "text-cyan-300 font-bold"
                        : "text-gray-400"
                    }
                  >
                    {index === terminalLogs.length - 1 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-cyan-400 inline-block animate-pulse shrink-0" />
                        <span>{log}</span>
                      </span>
                    ) : (
                      `> ${log}`
                    )}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gateway status footnote */}
      <footer className="relative z-10 w-full flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-gray-600 select-none">
          <Terminal className="w-3.5 h-3.5" />
          <span>Nodes Secured</span>
        </div>
        <div className="flex flex-col items-end gap-1.5 opacity-60">
          <div className="flex gap-2 text-gray-500">
            <Monitor className="w-3.5 h-3.5" />
            <Globe className="w-3.5 h-3.5" />
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600">Cross-Platform Sync</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-gray-600">
          <Compass className="w-3.5 h-3.5" />
          <span>Sanctum Core V2</span>
        </div>
      </footer>
    </motion.div>
  );
}
