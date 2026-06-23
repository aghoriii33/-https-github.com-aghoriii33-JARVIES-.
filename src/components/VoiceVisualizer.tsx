import { useEffect, useState } from "react";

interface VoiceVisualizerProps {
  isActive: boolean;
  barColor?: string;
  count?: number;
}

export default function VoiceVisualizer({
  isActive,
  barColor = "bg-cyan-400",
  count = 14
}: VoiceVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(() => Array(count).fill(15));

  useEffect(() => {
    if (!isActive) {
      // Steady calm wave if inactive
      const interval = setInterval(() => {
        setHeights(() =>
          Array.from({ length: count }, (_, i) => {
            const time = Date.now() / 300;
            const flow = Math.sin(time + i * 0.4) * 8 + 15;
            return Math.max(10, flow);
          })
        );
      }, 80);
      return () => clearInterval(interval);
    }

    // High excitation voice response when user is listening/talking
    const interval = setInterval(() => {
      setHeights(() =>
        Array.from({ length: count }, (_, i) => {
          const time = Date.now() / 150;
          // Coherent rhythmic wave
          const baseWave = Math.sin(time + i * 0.7) * 35 + 45;
          // Random chatter jitter
          const jitter = Math.random() * 25;
          // Restrict bounds
          return Math.max(12, Math.min(95, baseWave + jitter));
        })
      );
    }, 60);

    return () => clearInterval(interval);
  }, [isActive, count]);

  return (
    <div className="flex items-end justify-center gap-1.5 h-20 w-full max-w-xs mx-auto px-4 pointer-events-none">
      {heights.map((h, i) => {
        // Compute brightness opacity based on dynamic height
        const opacity = 0.25 + (h / 100) * 0.75;
        return (
          <div
            key={i}
            className={`w-1.5 rounded-full ${barColor} transition-all duration-100`}
            style={{
              height: `${h}%`,
              opacity: opacity,
              boxShadow: h > 60 ? "0 0 10px rgba(165, 231, 255, 0.4)" : "none"
            }}
          />
        );
      })}
    </div>
  );
}
