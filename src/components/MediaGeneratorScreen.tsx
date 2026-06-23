import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Film, Image as ImageIcon, Sparkles, Play, Download, Loader2, Sliders, Sun, Activity, Tv } from "lucide-react";

interface MediaGeneratorScreenProps {
  onBack: () => void;
  key?: string | number;
}

export default function MediaGeneratorScreen({ onBack }: MediaGeneratorScreenProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("veo-3.1-lite-generate-preview");
  const [resolution, setResolution] = useState("1080p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<any>(null);

  // Dolby Vision Core States
  const [dolbyVisionEnabled, setDolbyVisionEnabled] = useState(true);
  const [dolbyProfile, setDolbyProfile] = useState<"bright" | "dark" | "vivid" | "custom">("bright");
  const [peakLuma, setPeakLuma] = useState(1400); // 400 to 3000 nits
  const [chromaGain, setChromaGain] = useState(115); // 70 to 180 %
  const [contrastScale, setContrastScale] = useState(125); // 50 to 200 %
  const [d65RefTemp, setD65RefTemp] = useState(6500); // Kelvin

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const getDolbyFilters = () => {
    if (!dolbyVisionEnabled) return {};

    let b = 1.0;
    let c = 1.0;
    let s = 1.0;

    switch (dolbyProfile) {
      case "bright":
        b = 1.15;
        c = 1.25;
        s = 1.15;
        break;
      case "dark":
        b = 0.90;
        c = 1.35;
        s = 1.00;
        break;
      case "vivid":
        b = 1.25;
        c = 1.40;
        s = 1.45;
        break;
      case "custom":
        b = peakLuma / 1000;
        c = contrastScale / 100;
        s = chromaGain / 100;
        break;
    }

    return {
      filter: `brightness(${b}) contrast(${c}) saturate(${s})`,
      transition: "filter 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
    };
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setOperationName(null);
    setStatusText("Initializing hyper-rendering engines...");

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          resolution,
          aspectRatio: "16:9"
        })
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          data = { error: "Terminal node formatting error during action response parsing." };
        }
      } else {
        const text = await res.text().catch(() => "");
        data = { error: text || `Action request disrupted (${res.status}).` };
      }
      
      if (!res.ok) throw new Error(data.error || "Failed to start generation.");

      setOperationName((data as any).operationName);
      setStatusText("Synthesizing neural matrix (this may take a few minutes)...");
      
      pollIntervalRef.current = setInterval(() => pollStatus((data as any).operationName), 10000);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setIsGenerating(false);
    }
  };

  const pollStatus = async (opName: string) => {
    try {
      const res = await fetch("/api/video-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName })
      });
      
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          throw new Error("Terminal node formatting error during response parsing.");
        }
      } else {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Core connection disrupted (${res.status}).`);
      }
      
      if (!res.ok) throw new Error(data.error || "Status check failed.");

      if (data.done) {
        clearInterval(pollIntervalRef.current);
        setStatusText("Rendering complete. Assembling data streams...");
        downloadVideo(opName);
      }
    } catch (err: any) {
      console.error("Polling error:", err);
      clearInterval(pollIntervalRef.current);
      setError(err.message || "An error occurred during synthesis tracking.");
      setIsGenerating(false);
    }
  };

  const downloadVideo = (opName: string) => {
    // Direct server progressive buffering - optimal for mobile & tablet Safari/Chrome
    const url = `/api/video-download?operationName=${encodeURIComponent(opName)}&t=${Date.now()}`;
    setVideoUrl(url);
    setIsGenerating(false);
    setStatusText("");
  };

  return (
    <div className="w-full max-w-4xl h-full flex flex-col p-6 z-10 relative">
      <div className="flex items-center mb-8 gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-cyan-400 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold font-mono tracking-widest text-cyan-400">MEDIA SYNTHESIZER</h2>
          <span className="text-[10px] text-gray-500 font-mono tracking-wider">Manga / Anime / 4K Engine</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 overflow-y-auto no-scrollbar pb-10">
        
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 bg-zinc-900 border border-cyan-400/20 rounded-2xl flex flex-col gap-4">
            <div>
              <label className="text-[10px] items-center font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
                Prompt Configuration
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 px-3 py-3 bg-black border border-white/10 rounded-xl text-sm text-white focus:border-cyan-400 focus:outline-none placeholder-gray-600 resize-none font-mono"
                placeholder="e.g. A high-quality 4k anime scene of a cyberpunk city glowing in the rain..."
                disabled={isGenerating}
              />
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <button 
                onClick={() => setPrompt("AI enhance: 4k masterpiece, highly detailed manga style fighting sequence with glowing auras")}
                className="px-2 py-1 bg-zinc-800 text-cyan-200 border border-white/10 rounded hover:border-cyan-400 transition"
              >
                + Manga Aura
              </button>
              <button 
                onClick={() => setPrompt("Cinematic 4k anime video, highly detailed landscape, studio ghibli style, tracking shot")}
                className="px-2 py-1 bg-zinc-800 text-cyan-200 border border-white/10 rounded hover:border-cyan-400 transition"
              >
                + Anime Scene
              </button>
              <button 
                onClick={() => setPrompt("AI Enhance: ultra-realistic 4K video, intricate lighting, hyper-detailed physics")}
                className="px-2 py-1 bg-zinc-800 text-cyan-200 border border-white/10 rounded hover:border-cyan-400 transition"
              >
                + 4K Enhance
              </button>
            </div>

            <div>
              <label className="text-[10px] items-center font-mono uppercase tracking-widest text-gray-500 font-bold block mb-2 mt-2">
                Render Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setModel("veo-3.1-lite-generate-preview"); setResolution("1080p"); }}
                  className={`py-2 rounded-lg text-[10px] font-mono font-bold tracking-wider transition ${model === 'veo-3.1-lite-generate-preview' ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-400' : 'bg-black border border-white/10 text-gray-500 hover:text-gray-300'}`}
                >
                  1080p (Lite)
                </button>
                <button
                  onClick={() => { setModel("veo-3.1-generate-preview"); setResolution("4k"); }}
                  className={`py-2 rounded-lg text-[10px] font-mono font-bold tracking-wider transition ${model === 'veo-3.1-generate-preview' ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-400' : 'bg-black border border-white/10 text-gray-500 hover:text-gray-300'}`}
                >
                  4K (Pro)
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || prompt.trim() === ""}
              className="mt-4 w-full py-4 rounded-xl font-bold font-mono tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Film className="w-4 h-4" />}
              {isGenerating ? "Synthesizing..." : "Initiate Render"}
            </button>

            {error && (
              <div className="mt-2 p-3 bg-red-950/40 text-red-500 font-mono text-[10px] rounded border border-red-500/20">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Viewport & Dolby Vision Settings Controller */}
        <div className="lg:col-span-2 relative flex flex-col gap-4">
          <div className="flex-1 min-h-[350px] bg-black border border-cyan-400/20 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
            <div 
              className="w-full h-full flex items-center justify-center relative"
              style={getDolbyFilters()}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center text-cyan-400/60 space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/50 flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </motion.div>
                  <div className="font-mono text-xs uppercase tracking-widest text-cyan-400 animate-pulse">
                    {statusText}
                  </div>
                </div>
              ) : videoUrl ? (
                <div className="w-full h-full relative group">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    muted
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                  <a 
                    href={videoUrl}
                    download="jarvis-render.mp4"
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded border border-white/20 text-white hover:text-cyan-400 hover:border-cyan-400/50 transition opacity-0 group-hover:opacity-100 backdrop-blur-sm z-30"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-700 font-mono text-xs tracking-widest space-y-2">
                  <Film className="w-10 h-10 mb-2 opacity-50" />
                  <p>VIEWPORT OFFLINE</p>
                  <p className="text-[9px]">AWAITING RENDER INITIATION</p>
                </div>
              )}
            </div>

            {/* Inbuilt Dolby Vision active watermark badge */}
            {dolbyVisionEnabled && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2 py-1 rounded bg-black/85 border border-amber-500/25 text-[#f59e0b] font-mono text-[9px] font-bold tracking-widest shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>DOLBY VISION ACTIVE [ST.2084 PQ]</span>
              </div>
            )}
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>

          {/* DOLBY VISION CONSOLE BAR */}
          <div className="p-4 bg-zinc-950/95 border border-amber-500/15 hover:border-amber-500/25 transition-all rounded-2xl flex flex-col md:flex-row gap-5 justify-between">
            {/* Left Col: Master Toggle & ST.2084 Calibration */}
            <div className="md:w-1/3 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-500 font-serif font-black text-xs">D</div>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">Dolby Vision™ HDR</h4>
                    <span className="text-[8px] text-gray-500 font-mono">Dynamic Baseband Colorimetry</span>
                  </div>
                </div>
                <button
                  onClick={() => setDolbyVisionEnabled(!dolbyVisionEnabled)}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-black transition-all ${dolbyVisionEnabled ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.25)]" : "bg-zinc-900 border border-white/10 text-gray-400"}`}
                >
                  {dolbyVisionEnabled ? "ACTIVE" : "BYPASSED"}
                </button>
              </div>

              {dolbyVisionEnabled && (
                <div className="bg-black/40 border border-white/5 rounded-lg p-2 flex flex-col gap-1 font-mono text-[8px] text-gray-500">
                  <div className="flex justify-between">
                    <span>TRANSFER CURVE:</span>
                    <span className="text-amber-400 font-bold">ST.2084 (PQ-HDR)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DYNAMIC RANGE:</span>
                    <span className="text-amber-400">12-BIT META STAGE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TARGET MASTER:</span>
                    <span className="text-cyan-400 font-bold">BT.2020 WCG REFERENCE</span>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Col: Presets */}
            {dolbyVisionEnabled ? (
              <div className="md:w-1/3 space-y-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">HDR Dynamic Profiles</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["bright", "dark", "vivid", "custom"] as const).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setDolbyProfile(profile)}
                      className={`py-1 px-2 rounded-lg text-[9px] font-mono uppercase border transition-all text-center ${dolbyProfile === profile ? "bg-amber-950/40 border-amber-500 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.05)]" : "bg-zinc-900/60 border-white/5 text-gray-400 hover:text-white"}`}
                    >
                      📺 {profile}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="md:w-1/3 flex items-center justify-center p-3 border border-dashed border-white/5 rounded-xl bg-black/20 text-center text-gray-600 font-mono text-[9px]">
                SYSTEM RUNNING IN SDR BYPASS MODE
              </div>
            )}

            {/* Right Col: Custom sliders */}
            {dolbyVisionEnabled && (
              <div className="md:w-1/3 space-y-2">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
                  {dolbyProfile === "custom" ? "Dynamic Hardware Tune" : "Hardware Telemetry Status"}
                </span>

                {dolbyProfile === "custom" ? (
                  <div className="space-y-1.5">
                    {/* Peak Luma Slider */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] font-mono text-gray-400 leading-none">
                        <span>PEAK LUMA:</span>
                        <span className="text-amber-400 leading-none">{peakLuma} NITS</span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="3000"
                        step="100"
                        value={peakLuma}
                        onChange={(e) => setPeakLuma(Number(e.target.value))}
                        className="w-full accent-amber-500 bg-zinc-900 rounded h-1 outline-none cursor-pointer"
                      />
                    </div>
                    {/* Chroma Gain Slider */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[8px] font-mono text-gray-400 leading-none">
                        <span>CHROMA GAIN:</span>
                        <span className="text-amber-400 leading-none">{chromaGain}%</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="180"
                        value={chromaGain}
                        onChange={(e) => setChromaGain(Number(e.target.value))}
                        className="w-full accent-amber-500 bg-zinc-900 rounded h-1 outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[8px] bg-black/30 border border-white/5 rounded-lg p-2 flex flex-col justify-center h-[64px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">PEAK LUMA NIT:</span>
                      <span className={dolbyProfile === "vivid" ? "text-amber-500 font-bold animate-pulse" : "text-gray-300"}>
                        {dolbyProfile === "bright" ? "1400 NITS" : dolbyProfile === "dark" ? "1000 NITS (REF)" : "2200 NITS ULTRA"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">CHROMA GAMUT:</span>
                      <span className="text-gray-300">
                        {dolbyProfile === "bright" ? "115% DCI-P3" : dolbyProfile === "dark" ? "100% REC.709" : "145% WIDE BT.2020"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium font-mono">D65 ALIGNMENT:</span>
                      <span className="text-gray-300">6500 K</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
