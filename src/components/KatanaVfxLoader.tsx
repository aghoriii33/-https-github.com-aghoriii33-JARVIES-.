import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";

interface KatanaVfxLoaderProps {
  onComplete?: () => void;
  message?: string;
  key?: string;
}

export default function KatanaVfxLoader({ onComplete, message = "DECRYPTING MATRIX" }: KatanaVfxLoaderProps) {
  const [stage, setStage] = useState<"slash" | "split" | "done">("slash");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Simulates loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // 2. Play the slash strike sound/delay
      const slashTimeout = setTimeout(() => {
        setStage("split");
        
        // 3. Complete the overall animation after splitting apart
        const doneTimeout = setTimeout(() => {
          setStage("done");
          onComplete?.();
        }, 800);

        return () => clearTimeout(doneTimeout);
      }, 500);

      return () => clearTimeout(slashTimeout);
    }
  }, [progress, onComplete]);

  if (stage === "done") return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden select-none pointer-events-none flex items-center justify-center font-mono">
      
      {/* Background Cybernetic Radar Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_80%),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Top Split segment */}
      <motion.div
        animate={stage === "split" ? { y: "-100%", skewX: -5 } : { y: 0, skewX: 0 }}
        transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
        className="absolute inset-x-0 top-0 h-1/2 bg-black border-b border-cyan-500/20 flex flex-col justify-end pb-6 items-center"
      >
        <div className="text-center space-y-4 px-4">
          {/* Animated Cyan Glow JARVIS Logo */}
          <motion.h1
            animate={{
              textShadow: [
                "0 0 12px rgba(0, 217, 255, 0.5)",
                "0 0 32px rgba(0, 217, 255, 0.85), 0 0 62px rgba(0, 217, 255, 0.45)",
                "0 0 12px rgba(0, 217, 255, 0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-5xl sm:text-6xl font-black text-white tracking-[12px] pl-[12px] uppercase select-none leading-none font-sans"
          >
            JARVIS
          </motion.h1>

          <div className="space-y-1">
            <div className="flex justify-center items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d9ff] animate-ping" />
              <h2 className="text-[10px] font-bold tracking-[6px] text-gray-400 uppercase">
                {message || "INITIALIZING AI SYSTEM"}
              </h2>
            </div>
            <p className="text-[8px] text-zinc-600 tracking-widest uppercase">
              TACTICAL INTERFACE • AUTHENTICATION SECURE KEY
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom Split segment */}
      <motion.div
        animate={stage === "split" ? { y: "100%", skewX: 5 } : { y: 0, skewX: 0 }}
        transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-black border-t border-cyan-500/20 flex flex-col pt-8 items-center"
      >
        <div className="w-72 max-w-xs space-y-3.5 text-center px-4">
          {/* Progress bar container matching style specs */}
          <div className="h-1.5 w-full bg-zinc-950 border border-white/5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-gradient-to-r from-[#00d9ff] to-cyan-400 shadow-[0_0_10px_#00d9ff]"
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono tracking-widest font-black text-[#00d9ff]">
            <span className="opacity-70">SYSTEM_BOOT_SEQUENCE</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Cinematic Katana Neon Slicing Path Strike */}
      <AnimatePresence>
        {progress === 100 && stage === "slash" && (
          <>
            {/* The razor-thin glowing blade slash across viewport diagonal */}
            <motion.div
              initial={{ width: 0, opacity: 0, rotate: -22, scaleY: 0.5 }}
              animate={{ width: "150%", opacity: 1, scaleY: [0.5, 3, 1, 0.1] }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute h-1 bg-white shadow-[0_0_20px_rgba(255,255,255,1),0_0_40px_rgba(34,211,238,1)] z-50 transform pointer-events-none"
            />

            {/* Backwards counter-slash overlay for instant optical impact */}
            <motion.div
              initial={{ width: 0, opacity: 0, rotate: 22, scaleY: 0.5 }}
              animate={{ width: "150%", opacity: 0.9, scaleY: [0.5, 2, 0.1] }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
              className="absolute h-0.5 bg-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-50 transform pointer-events-none"
            />

            {/* High velocity strike flash overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.75, 0.2, 0] }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-white z-40 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}
