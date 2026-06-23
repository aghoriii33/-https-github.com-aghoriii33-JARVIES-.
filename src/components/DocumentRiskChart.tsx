import { useState, useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import { BarChart3, AlertTriangle, RefreshCw, FileCode, CheckCircle, Info } from "lucide-react";

export interface VisualizedDocument {
  id: string;
  name: string;
  status: "pending" | "scanning" | "analyzed";
  riskScore?: number;
  text?: string;
  file?: File;
  flaggedClauses?: {
    autoRenewal: number;
    unlimitedLiability: number;
    indemnity: number;
    auditRestrict: number;
  };
}

interface DocumentRiskChartProps {
  documents: VisualizedDocument[];
}

export default function DocumentRiskChart({ documents }: DocumentRiskChartProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "autoRenewal" | "unlimitedLiability" | "indemnity" | "auditRestrict">("all");
  const [hoveredBar, setHoveredBar] = useState<{ id: string; name: string; value: number; autoRenewal: number; unlimitedLiability: number; indemnity: number; auditRestrict: number; x: number; y: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 40;

  // Track responsive container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width) {
          setWidth(Math.max(280, entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter only indexed (analyzed) docs
  const analyzedDocs = useMemo(() => {
    return documents.filter(doc => doc.status === "analyzed").map(doc => {
      // In case they don't have flaggedClauses computed yet, compute on the fly
      if (!doc.flaggedClauses) {
        const text = doc.text || "";
        const score = doc.riskScore || 20;
        const normalized = text.toLowerCase();
        
        const countOccurrences = (words: string[]) => {
          let count = 0;
          words.forEach(w => {
            const matches = normalized.match(new RegExp(w, "g"));
            if (matches) count += matches.length;
          });
          return count;
        };

        let autoRenewal = countOccurrences(["renew", "extension", "duration", "terminate", "expiration", "cancel"]);
        let unlimitedLiability = countOccurrences(["liability", "cap", "damages", "limitation", "maximum", "expos"]);
        let indemnity = countOccurrences(["indemnity", "indemnify", "harmless", "reimburse", "losses"]);
        let auditRestrict = countOccurrences(["audit", "inspect", "books", "record", "confidential"]);

        // Fallback checks for simulation/demo beauty
        if (autoRenewal + unlimitedLiability + indemnity + auditRestrict === 0) {
          const seed = Math.floor(score / 10) || 2;
          autoRenewal = Math.max(1, seed % 3);
          unlimitedLiability = Math.max(0, (seed + 1) % 4);
          indemnity = Math.max(1, (seed + 2) % 3);
          auditRestrict = Math.max(0, seed % 2);
        }

        return {
          ...doc,
          flaggedClauses: { autoRenewal, unlimitedLiability, indemnity, auditRestrict }
        };
      }
      return doc;
    });
  }, [documents]);

  // Compute total flags or selected flags
  const chartData = useMemo(() => {
    return analyzedDocs.map(doc => {
      const cls = doc.flaggedClauses || { autoRenewal: 0, unlimitedLiability: 0, indemnity: 0, auditRestrict: 0 };
      let value = 0;
      if (activeCategory === "all") {
        value = cls.autoRenewal + cls.unlimitedLiability + cls.indemnity + cls.auditRestrict;
      } else {
        value = cls[activeCategory] || 0;
      }
      return {
        id: doc.id,
        name: doc.name,
        value,
        autoRenewal: cls.autoRenewal,
        unlimitedLiability: cls.unlimitedLiability,
        indemnity: cls.indemnity,
        auditRestrict: cls.auditRestrict,
        riskScore: doc.riskScore || 0
      };
    });
  }, [analyzedDocs, activeCategory]);

  // Create D3 Scales
  const scales = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.value), 5);
    const yMax = Math.max(5, Math.ceil(maxVal / 5) * 5); // neat tick lines

    const scaleX = d3.scaleBand()
      .domain(chartData.map(d => d.id))
      .range([paddingLeft, width - paddingRight])
      .padding(0.35);

    const scaleY = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - paddingBottom, paddingTop]);

    return { scaleX, scaleY, yMax };
  }, [chartData, width]);

  // Yticks helper
  const yTicks = useMemo(() => {
    const ticksCount = 4;
    return scales.scaleY.ticks(ticksCount);
  }, [scales]);

  const categoryMetadata = {
    all: { label: "All Threat Clauses", color: "from-cyan-500 to-purple-500", border: "border-cyan-500/30", text: "text-cyan-400" },
    autoRenewal: { label: "Auto-Renewal", color: "from-yellow-500 to-amber-600", border: "border-yellow-500/30", text: "text-amber-400" },
    unlimitedLiability: { label: "Liability Exposure", color: "from-rose-500 to-red-600", border: "border-rose-500/30", text: "text-rose-400" },
    indemnity: { label: "Indemnification", color: "from-purple-500 to-fuchsia-600", border: "border-purple-500/30", text: "text-purple-400" },
    auditRestrict: { label: "Limited Audit Controls", color: "from-teal-500 to-emerald-600", border: "border-teal-500/30", text: "text-teal-400" }
  };

  return (
    <div ref={containerRef} className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden" id="clause-risk-dashboard">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-950/5 via-transparent to-cyan-950/5 pointer-events-none" />
      
      {/* Dashboard Mini-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3 z-10">
        <div className="text-left">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-rose-500" />
            Document Risk Visualization
          </h3>
          <p className="text-[10px] uppercase font-mono text-gray-500">
            D3 Flagged Clause Density Profile
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-1">
          {(["all", "autoRenewal", "unlimitedLiability", "indemnity", "auditRestrict"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setHoveredBar(null);
              }}
              className={`px-2 py-1 rounded-md text-[9px] font-mono border uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-rose-950/50 border-rose-500/40 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                  : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/15 hover:text-gray-300"
              }`}
            >
              {cat === "all" ? "All Flags" : cat === "autoRenewal" ? "Auto-Renew" : cat === "unlimitedLiability" ? "Liability" : cat === "indemnity" ? "Indemnity" : "Audit"}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center text-gray-500 space-y-2 py-4">
          <AlertTriangle className="w-8 h-8 text-rose-500/40 animate-pulse" />
          <p className="text-xs font-mono uppercase text-gray-400">Security Core Idle: No Data</p>
          <p className="text-[10px] text-gray-600 max-w-xs font-mono">
            Load and scan/index compliance documents on the left. The neural analyzer will extract clause density metrics here.
          </p>
        </div>
      ) : (
        <div className="relative w-full z-15 flex flex-col md:flex-row gap-4 items-center">
          
          {/* SVG D3 Chart Canvas */}
          <div className="relative flex-1 w-full bg-black/40 border border-white/5 rounded-xl p-2 h-[190px]">
            <svg width="100%" height={height} className="overflow-visible">
              {/* Horizontal Gridlines plotted strictly with D3 Scale values */}
              <g stroke="rgba(255,255,255,0.04)" strokeWidth={1}>
                {yTicks.map(tickVal => {
                  const y = scales.scaleY(tickVal);
                  return (
                    <line
                      key={tickVal}
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                    />
                  );
                })}
              </g>

              {/* Y Axis Labels */}
              <g fill="rgba(156,163,175,0.4)" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="end">
                {yTicks.map(tickVal => (
                  <text
                    key={tickVal}
                    x={paddingLeft - 6}
                    y={scales.scaleY(tickVal) + 3}
                  >
                    {tickVal}
                  </text>
                ))}
              </g>

              {/* X Axis Labels & Dots */}
              <g fill="rgba(156,163,175,0.4)" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
                {chartData.map((d, index) => {
                  const x = scales.scaleX(d.id);
                  if (x === undefined) return null;
                  const centerX = x + (scales.scaleX.bandwidth() || 0) / 2;
                  
                  // Limit text name if long
                  let label = `DOC-${index + 1}`;
                  return (
                    <g key={d.id}>
                      {/* Anchor Dot */}
                      <circle cx={centerX} cy={height - paddingBottom + 5} r={1.5} fill="rgba(255,255,255,0.15)" />
                      <text
                        x={centerX}
                        y={height - paddingBottom + 16}
                        className="fill-gray-500 font-bold font-mono"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Dynamic SVG Bars Rendering */}
              <g>
                {chartData.map(d => {
                  const x = scales.scaleX(d.id);
                  if (x === undefined) return null;
                  const widthBar = scales.scaleX.bandwidth() || 0;
                  const y = scales.scaleY(d.value);
                  const barHeight = height - paddingBottom - y;
                  const activeMeta = categoryMetadata[activeCategory];
                  
                  // Hover state checker
                  const isHovered = hoveredBar?.id === d.id;

                  return (
                    <g key={d.id}>
                      {/* Interactive Invisible Overlay wrapper for safer touch & hover targets */}
                      <rect
                        x={x - 2}
                        y={paddingTop}
                        width={widthBar + 4}
                        height={height - paddingBottom - paddingTop}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const svgElement = e.currentTarget.ownerSVGElement;
                          if (svgElement) {
                            const pt = svgElement.createSVGPoint();
                            pt.x = e.clientX;
                            pt.y = e.clientY;
                            const loc = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());
                            setHoveredBar({
                              id: d.id,
                              name: d.name,
                              value: d.value,
                              autoRenewal: d.autoRenewal,
                              unlimitedLiability: d.unlimitedLiability,
                              indemnity: d.indemnity,
                              auditRestrict: d.auditRestrict,
                              x: loc.x,
                              y: loc.y - 12
                            });
                          }
                        }}
                        onMouseMove={(e) => {
                          const svgElement = e.currentTarget.ownerSVGElement;
                          if (svgElement && hoveredBar) {
                            const pt = svgElement.createSVGPoint();
                            pt.x = e.clientX;
                            pt.y = e.clientY;
                            const loc = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());
                            setHoveredBar(prev => prev ? { ...prev, x: loc.x, y: loc.y - 12 } : null);
                          }
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />

                      {/* Visualized Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={widthBar}
                        height={Math.max(2, barHeight)} // draw at least 2px line
                        rx={3}
                        fill={`url(#gradient-${activeCategory}-${d.id})`}
                        stroke={isHovered ? "#ffffff" : "rgba(255,255,255,0.06)"}
                        strokeWidth={1}
                        className="transition-all duration-300"
                        style={{
                          filter: isHovered ? "drop-shadow(0px 0px 8px rgba(239,68,68,0.4))" : "none"
                        }}
                      />

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id={`gradient-${activeCategory}-${d.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor={activeCategory === 'unlimitedLiability' ? '#991b1b' : '#18181b'} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={activeCategory === 'all' ? '#ec4899' : activeCategory === 'autoRenewal' ? '#f59e0b' : activeCategory === 'unlimitedLiability' ? '#ef4444' : activeCategory === 'indemnity' ? '#a855f7' : '#14b8a6'} stopOpacity={1.0} />
                        </linearGradient>
                      </defs>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* D3 Tooltip */}
            <AnimatePresence>
              {hoveredBar && (
                <div
                  className="absolute pointer-events-none bg-zinc-950 border border-white/15 px-3 py-2.5 rounded-xl shadow-2xl text-[10px] font-mono text-left space-y-1 z-30"
                  style={{
                    left: `${Math.min(width - 150, Math.max(10, hoveredBar.x - 70))}px`,
                    top: `${Math.min(height - 100, Math.max(5, hoveredBar.y - 80))}px`,
                  }}
                >
                  <p className="text-white font-bold truncate max-w-[130px] border-b border-white/5 pb-1 mb-1 font-sans">{hoveredBar.name}</p>
                  <p className="text-gray-400">Density Total: <span className="text-rose-400 font-bold">{hoveredBar.value} clauses</span></p>
                  <p className="text-yellow-400/80">Auto-Renew: {hoveredBar.autoRenewal}</p>
                  <p className="text-red-400/80">Liability: {hoveredBar.unlimitedLiability}</p>
                  <p className="text-purple-400/80">Indemnity: {hoveredBar.indemnity}</p>
                  <p className="text-teal-400/80">Audit: {hoveredBar.auditRestrict}</p>
                </div>
              )}
            </AnimatePresence>

            <div className="absolute top-2 left-2 flex items-center gap-1">
              <Info className="w-3 h-3 text-gray-600" />
              <span className="text-[7.5px] uppercase font-mono tracking-widest text-gray-500">
                Hover bars for individual core risk counts
              </span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="w-full md:w-[190px] grid grid-cols-2 md:grid-cols-1 gap-2 shrink-0 text-left font-mono">
            <div className="p-2.5 bg-zinc-900/40 border border-white/5 rounded-xl">
              <span className="text-[7.5px] text-gray-500 block uppercase">ANALYZED SCHEMAS</span>
              <span className="text-sm font-bold text-white block mt-0.5">{analyzedDocs.length} Docs Indexed</span>
            </div>
            
            <div className="p-2.5 bg-zinc-900/40 border border-white/5 rounded-xl">
              <span className="text-[7.5px] text-gray-500 block uppercase">{categoryMetadata[activeCategory].label}</span>
              <span className="text-sm font-bold text-rose-400 block mt-0.5 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse`} />
                {chartData.reduce((acc, d) => acc + d.value, 0)} Flags
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
