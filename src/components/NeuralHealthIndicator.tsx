import { useEffect, useState, useMemo } from "react";
import { Activity, Cpu, Zap } from "lucide-react";

interface NeuralHealthIndicatorProps {
  appTheme?: "dark" | "light";
}

export default function NeuralHealthIndicator({ appTheme = "dark" }: NeuralHealthIndicatorProps) {
  const [latency, setLatency] = useState(142);
  const [modelLoad, setModelLoad] = useState(14.8);
  const [waveOffset, setWaveOffset] = useState(0);

  // Smooth fluctuation effect for latency & model load
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setLatency((prev) => {
        const change = Math.floor(Math.random() * 31) - 15; // +/- 15ms
        const next = prev + change;
        return Math.max(110, Math.min(270, next));
      });

      setModelLoad((prev) => {
        const change = Number((Math.random() * 4.4 - 2.2).toFixed(1)); // +/- 2.2%
        const next = Number((prev + change).toFixed(1));
        return Math.max(4.2, Math.min(32.0, next));
      });
    }, 2500);

    return () => clearInterval(statusInterval);
  }, []);

  // Request Animation Frame for super smooth 60fps wave motion
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setWaveOffset((prev) => (prev + 0.08) % (Math.PI * 2));
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Generate beautiful sine wave path using simple math
  // Multi-frequency wave for an organic, advanced neural aesthetic
  const generateWavePath = (offset: number, heightScaler: number, frequencyMultiplier: number) => {
    const width = 100;
    const height = 24;
    const points: string[] = [];
    
    for (let x = 0; x <= width; x += 2) {
      // Create a nice envelope pattern so wave tapers off at the edges
      const envelope = Math.sin((x / width) * Math.PI);
      
      // Multi-harmonic sine calculation
      const angle = (x / width) * Math.PI * 4 * frequencyMultiplier + offset;
      const y1 = Math.sin(angle) * 7;
      const y2 = Math.cos(angle * 1.7) * 3;
      
      const y = (height / 2) + (y1 + y2) * envelope * heightScaler;
      points.push(`${x},${y.toFixed(1)}`);
    }
    
    return `M ${points.join(" L ")}`;
  };

  const wave1 = useMemo(() => generateWavePath(waveOffset, 0.8, 1.0), [waveOffset]);
  const wave2 = useMemo(() => generateWavePath(-waveOffset * 1.2, 0.5, 1.5), [waveOffset]);

  // Handle color customization depending on current simulated load status
  const currentStatus = modelLoad > 25 ? "high" : modelLoad > 15 ? "normal" : "optimized";
  
  const colors = {
    optimized: {
      text: "text-emerald-400Dark text-emerald-600Light",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      wavePrimary: appTheme === "light" ? "rgba(5, 150, 105, 0.65)" : "rgba(16, 185, 129, 0.7)",
      waveSecondary: appTheme === "light" ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.2)"
    },
    normal: {
      text: "text-cyan-400Dark text-cyan-600Light",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      wavePrimary: appTheme === "light" ? "rgba(13, 148, 136, 0.65)" : "rgba(6, 182, 212, 0.7)",
      waveSecondary: appTheme === "light" ? "rgba(6, 182, 212, 0.25)" : "rgba(6, 182, 212, 0.2)"
    },
    high: {
      text: "text-rose-400Dark text-rose-600Light",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      wavePrimary: appTheme === "light" ? "rgba(225, 29, 72, 0.65)" : "rgba(244, 63, 94, 0.7)",
      waveSecondary: appTheme === "light" ? "rgba(244, 63, 94, 0.25)" : "rgba(244, 63, 94, 0.2)"
    }
  }[currentStatus];

  // Map theme specific strings safely to prevent visual styling bugs
  const isLight = appTheme === "light";

  return (
    <div 
      className={`flex items-center gap-1 sm:gap-1.5 px-1 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg border transition-all duration-300 shadow-sm shrink-0 select-none ${
        isLight 
          ? "bg-white border-slate-200/80 shadow-slate-100" 
          : "bg-zinc-900/60 border-white/5 shadow-black/25"
      }`}
      id="neural-health-monitor"
    >
      {/* Waveform Micro-Screen */}
      <div 
        className={`w-10 sm:w-14 h-3 sm:h-4 rounded relative overflow-hidden flex items-center justify-center shrink-0 border ${
          isLight ? "bg-slate-50 border-slate-200/50" : "bg-black/40 border-white/5"
        }`}
        title="Synaptic Activity Waveform (Live)"
      >
        <svg width="100%" height="100%" viewBox="0 0 100 24" className="overflow-visible">
          {/* Secondary Harmonic Wave */}
          <path
            d={wave2}
            fill="none"
            stroke={colors.waveSecondary}
            strokeWidth="1"
            transition-all="true"
          />
          {/* Primary Lead Wave */}
          <path
            d={wave1}
            fill="none"
            stroke={colors.wavePrimary}
            strokeWidth="1.5"
            transition-all="true"
          />
        </svg>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-col text-left shrink-0 leading-none">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Latency */}
          <div className="flex items-center gap-0.5" title="Neural Core Endpoint Latency border-r py-0.5">
            <Zap className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isLight ? "text-amber-500" : "text-amber-400 animate-pulse"}`} />
            <span className={`text-[7.5px] sm:text-[8.5px] font-mono font-black tracking-tight leading-none ${isLight ? "text-slate-700" : "text-slate-200"}`}>
              {latency}ms
            </span>
          </div>

          <div className={`w-[1px] h-2 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />

          {/* Load */}
          <div className="flex items-center gap-0.5" title="Synaptic Load Index">
            <Cpu className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isLight ? "text-purple-600" : "text-purple-400"}`} />
            <span className={`text-[7.5px] sm:text-[8.5px] font-mono font-black tracking-tight leading-none ${isLight ? "text-slate-700" : "text-slate-200"}`}>
              {modelLoad}%
            </span>
          </div>
        </div>

        {/* Dynamic Health Feedback */}
        <span className={`text-[5.5px] sm:text-[6.5px] uppercase font-mono font-bold tracking-wider leading-none mt-0.5 flex items-center gap-0.5 ${
          currentStatus === "high" 
            ? "text-rose-500" 
            : currentStatus === "normal"
              ? "text-cyan-500"
              : "text-emerald-500"
        }`}>
          <span className={`w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full ${
            currentStatus === "high" ? "bg-rose-500" : currentStatus === "normal" ? "bg-cyan-500" : "bg-emerald-500"
          } animate-pulse`} />
          HEALTH: {currentStatus}
        </span>
      </div>
    </div>
  );
}
