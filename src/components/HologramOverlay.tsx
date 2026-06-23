import { motion, AnimatePresence } from "motion/react";

interface HologramOverlayProps {
  isVisible: boolean;
}

export default function HologramOverlay({ isVisible }: HologramOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center mix-blend-screen"
        >
          {/* Dynamic Geometric Hologram Structures */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.02, 1],
            }}
            transition={{
              rotate: { duration: 30, ease: "linear", repeat: Infinity },
              scale: { duration: 5, ease: "easeInOut", repeat: Infinity },
            }}
            className="absolute w-[90dvw] h-[90dvw] md:w-[700px] md:h-[700px] border border-cyan-500/10 rounded-full flex items-center justify-center shadow-[inset_0_0_60px_rgba(6,182,212,0.05)]"
          >
            <motion.div 
               animate={{ rotate: [-360, 0] }}
               transition={{ duration: 40, ease: "linear", repeat: Infinity }}
               className="absolute w-[85%] h-[85%] border border-cyan-400/20 rounded-full border-dashed"
            />
            <motion.div 
               animate={{ rotate: [0, 360] }}
               transition={{ duration: 50, ease: "linear", repeat: Infinity }}
               className="absolute w-[70%] h-[70%] border-2 border-cyan-300/10 rounded-t-[40%] rounded-b-[40%]"
            />
            <motion.div 
               animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3], rotate: [45, 225] }}
               transition={{ 
                 scale: { duration: 4, ease: "easeInOut", repeat: Infinity },
                 opacity: { duration: 4, ease: "easeInOut", repeat: Infinity },
                 rotate: { duration: 35, ease: "linear", repeat: Infinity }
               }}
               className="absolute w-[55%] h-[55%] border border-purple-500/20 rounded-lg shadow-[0_0_40px_rgba(168,85,247,0.1)]"
            />
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
               transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: 1 }}
               className="absolute w-1/3 h-1/3 bg-cyan-500/10 blur-3xl rounded-full"
            />
            
            {/* Core center eye */}
            <motion.div 
               animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
               transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
               className="absolute w-12 h-12 md:w-16 md:h-16 bg-cyan-300/20 border border-cyan-200/40 rounded-full blur-md"
            />
          </motion.div>

          {/* Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)] opacity-60" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
