import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";

interface SleekConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  themeColor?: "cyan" | "red" | "gold";
}

export default function SleekConfirmModal({
  isOpen,
  title = "JARVIS SYSTEM DIALOGUE",
  message,
  onConfirm,
  onCancel,
  confirmText = "CONFIRM OPERATION",
  cancelText = "ABORT",
  themeColor = "cyan"
}: SleekConfirmModalProps) {
  const shadowColor = 
    themeColor === "red" 
      ? "shadow-[0_0_50px_rgba(239,68,68,0.25)] border-red-500/35"
      : themeColor === "gold"
      ? "shadow-[0_0_50px_rgba(245,158,11,0.25)] border-amber-500/35"
      : "shadow-[0_0_50px_rgba(6,182,212,0.25)] border-cyan-500/35";

  const btnColor = 
    themeColor === "red"
      ? "bg-red-950/45 border-red-505/30 text-red-400 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
      : themeColor === "gold"
      ? "bg-amber-950/45 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
      : "bg-cyan-950/45 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]";

  const glowColor =
    themeColor === "red" ? "text-red-500" : themeColor === "gold" ? "text-amber-500" : "text-cyan-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop blur with ultra premium smooth gradient overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className={`relative w-full max-w-md bg-zinc-950 border ${shadowColor} rounded-2xl p-6 font-mono text-gray-200 overflow-hidden z-50`}
          >
            {/* Corner Cybernetic Grid Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_70%)] pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-24 h-24 bg-[radial-gradient(circle,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

            {/* Header / Brand indicator */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${glowColor} animate-pulse`} />
                <span className={`text-[11px] font-black tracking-widest uppercase text-white`}>
                  {title}
                </span>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Message */}
            <div className="space-y-4 mb-6">
              <p className="text-xs leading-relaxed text-gray-300 tracking-wide font-sans">
                {message}
              </p>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-white/5 text-[9px] text-gray-500 uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Operational safety clearance required</span>
              </div>
            </div>

            {/* Actions button group */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-[10px] font-bold tracking-widest text-gray-400 hover:text-white transition-all uppercase"
              >
                {cancelText}
              </button>
              
              <button
                onClick={() => {
                  onConfirm();
                }}
                className={`px-4 py-2 border rounded-xl text-[10px] font-bold tracking-widest transition-all uppercase ${btnColor}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
