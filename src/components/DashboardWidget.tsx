import { useState, useEffect, ReactNode } from "react";
import { Cpu, Activity, Wifi, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function DashboardWidget() {
  const [cpu, setCpu] = useState(12);
  const [ram, setRam] = useState(45);
  const [ping, setPing] = useState(18);

  // Simulate real-time metric fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.max(5, Math.min(95, prev + (Math.random() * 15 - 8))));
      setRam(prev => Math.max(20, Math.min(80, prev + (Math.random() * 4 - 2))));
      setPing(prev => Math.max(8, Math.min(150, prev + (Math.random() * 20 - 10))));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3 w-full mb-6">
      <WidgetCard 
        icon={<Cpu className="w-4 h-4 text-cyan-400" />} 
        title="CPU LOAD" 
        value={`${cpu.toFixed(1)}%`} 
        accent="border-cyan-500/30"
        valueColor="text-cyan-400"
      />
      <WidgetCard 
        icon={<Activity className="w-4 h-4 text-purple-400" />} 
        title="MEMORY" 
        value={`${ram.toFixed(1)}%`} 
        accent="border-purple-500/30"
        valueColor="text-purple-400"
      />
      <WidgetCard 
        icon={<Wifi className="w-4 h-4 text-emerald-400" />} 
        title="LATENCY" 
        value={`${ping.toFixed(0)}ms`} 
        accent="border-emerald-500/30"
        valueColor="text-emerald-400"
      />
    </div>
  );
}

function WidgetCard({ icon, title, value, accent, valueColor }: { icon: ReactNode, title: string, value: string, accent: string, valueColor: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-zinc-950/40 backdrop-blur-md border ${accent} rounded-xl p-3 flex flex-col justify-between h-20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative overflow-hidden group cursor-default`}
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
         {icon}
      </div>
      <div className="flex items-center gap-2 relative z-10">
        {icon}
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className={`text-lg font-mono font-bold tracking-tight relative z-10 ${valueColor}`}>
        {value}
      </div>
    </motion.div>
  );
}
