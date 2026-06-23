import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff } from "lucide-react";

export default function NetworkStatusBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl backdrop-blur-md font-mono text-xs font-semibold tracking-wider shadow-lg shadow-black/50"
        >
          <WifiOff className="w-4 h-4" />
          <span>NETWORK DISCONNECTED</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
