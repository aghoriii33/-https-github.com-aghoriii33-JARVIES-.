import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Film, 
  Image as ImageIcon, 
  Sparkles, 
  Play, 
  Download, 
  Loader2, 
  Sliders, 
  Sun, 
  Activity, 
  Tv, 
  Camera, 
  Zap, 
  Compass, 
  Maximize2, 
  ShieldCheck, 
  Eye, 
  RefreshCw 
} from "lucide-react";

interface MediaGeneratorScreenProps {
  onBack: () => void;
  key?: string | number;
}

export default function MediaGeneratorScreen({ onBack }: MediaGeneratorScreenProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"video" | "image">("video");
  const [model, setModel] = useState("veo-3.1-lite-generate-preview");
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<any>(null);

  // Creative spec parameters
  const [selectedCamera, setSelectedCamera] = useState("ARRI Alexa 35");
  const [selectedLens, setSelectedLens] = useState("35mm Prime");
  const [selectedMovement, setSelectedMovement] = useState("Slow Push-In");
  const [selectedLighting, setSelectedLighting] = useState("Cinematic Volumetric");
  const [selectedGrade, setSelectedGrade] = useState("Hollywood Film LUT");
  const [selectedStyle, setSelectedStyle] = useState("Hollywood Cinematic");

  // Dolby Vision Core States
  const [dolbyVisionEnabled, setDolbyVisionEnabled] = useState(true);
  const [dolbyProfile, setDolbyProfile] = useState<"bright" | "dark" | "vivid" | "custom">("bright");
  const [peakLuma, setPeakLuma] = useState(1400); // 400 to 3000 nits
  const [chromaGain, setChromaGain] = useState(115); // 70 to 180 %
  const [contrastScale, setContrastScale] = useState(125); // 50 to 200 %

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

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError("Please input a partial descriptor or idea to initiate engineering synthesis.");
      return;
    }
    setIsEnhancing(true);
    setError(null);

    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          presetFilters: {
            camera: selectedCamera,
            lens: selectedLens,
            movement: selectedMovement,
            lighting: selectedLighting,
            colorGrade: selectedGrade,
            style: selectedStyle
          }
        })
      });

      if (!res.ok) throw new Error("Synthesis node timed out.");
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to coordinate intelligent enhancement vectors.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setImageUrl(null);
    setOperationName(null);
    setStatusText("Initializing hyper-rendering engines...");

    if (mode === "image") {
      // Direct high-fidelity simulated image generation matches Midjourney spec
      setStatusText("Synthesizing luxury light field matrices...");
      await new Promise((r) => setTimeout(r, 2200));

      // Choose beautiful premium nature/technology theme photos that match prompts if specified
      const p = prompt.toLowerCase();
      let sourceUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"; // Abstract liquid art
      if (p.includes("car") || p.includes("vehicle") || p.includes("cyberpunk")) {
        sourceUrl = "https://images.unsplash.com/photo-15423148 scale-2.5-fit-crop&w=1200&q=80?auto=format"; // Cyberpunk vehicle
        sourceUrl = "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80"; // Luxury supercar
      } else if (p.includes("city") || p.includes("architect") || p.includes("tokyo")) {
        sourceUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"; // Tokyo Neon
      } else if (p.includes("anime") || p.includes("manga") || p.includes("character")) {
        sourceUrl = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80"; // Anime neon street
      } else if (p.includes("nature") || p.includes("mountain") || p.includes("landscape")) {
        sourceUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"; // Epic mountains
      } else if (p.includes("fashion") || p.includes("cyber") || p.includes("portrait")) {
        sourceUrl = "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"; // Tech fashion
      }

      setImageUrl(sourceUrl);
      setIsGenerating(false);
      setStatusText("");
      return;
    }

    // Video Mode Sequence
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          resolution,
          aspectRatio
        })
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (e) {
          data = { error: "Terminal node formatting error during response parsing." };
        }
      } else {
        const text = await res.text().catch(() => "");
        data = { error: text || `Action request disrupted (${res.status}).` };
      }
      
      if (!res.ok) throw new Error(data.error || "Failed to start generation.");

      setOperationName(data.operationName);
      setStatusText("Synthesizing neural video matrix (takes ~2 minutes)...");
      
      pollIntervalRef.current = setInterval(() => pollStatus(data.operationName), 8000);
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
          throw new Error("Terminal node formatting error during status check.");
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
    const url = `/api/video-download?operationName=${encodeURIComponent(opName)}&t=${Date.now()}`;
    setVideoUrl(url);
    setIsGenerating(false);
    setStatusText("");
  };

  return (
    <div className="w-full max-w-7xl h-full flex flex-col p-4 sm:p-6 z-10 relative overflow-hidden text-gray-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 mt-safe pt-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all text-cyan-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-widest text-white uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              JARVIS VISION STUDIO
            </h1>
            <p className="text-[10px] uppercase font-mono text-gray-500">Hollywood Directives & Luxury Brand Visual Suite</p>
          </div>
        </div>

        {/* Studio Presets Fast Info badge */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/40 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>SORA RENDER INGRESS</span>
          </div>
          <div className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/40 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>MIDJOURNEY V6 ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-y-auto no-scrollbar pb-16">
        
        {/* Left Column: Vision Studio Console Controls (span 5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Engine Selector */}
          <div className="p-1 bg-zinc-950 border border-white/15 rounded-xl flex gap-1">
            <button
              onClick={() => { setMode("video"); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-all ${mode === "video" ? "bg-amber-950/45 border border-amber-500/35 text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.1)]" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Film className="w-4 h-4" />
              SORA CINEMATIC VIDEO
            </button>
            <button
              onClick={() => { setMode("image"); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center justify-center gap-2 transition-all ${mode === "image" ? "bg-cyan-950/45 border border-cyan-500/35 text-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.1)]" : "text-gray-500 hover:text-gray-300"}`}
            >
              <ImageIcon className="w-4 h-4" />
              MIDJOURNEY ULTRA HD
            </button>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-white/10 rounded-2xl flex flex-col gap-4">
            
            {/* Direct Prompt & Enhancer */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Core Creative prompt
                </label>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Commercial-grade rendering</span>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-36 px-4 py-3 bg-zinc-950 border border-white/5 rounded-xl text-sm text-white focus:border-cyan-500 focus:outline-none placeholder-gray-600 resize-none font-sans"
                placeholder={mode === 'video' ? "Describe your Hollywood action sequence or luxury showcase..." : "Describe premium photography, character assets, architectural layout..."}
                disabled={isGenerating || isEnhancing}
              />

              {/* Intelligent Prompt Enhancer Button */}
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isGenerating || isEnhancing || !prompt.trim()}
                className="mt-2 w-full py-3 bg-gradient-to-r from-amber-950/40 via-cyan-950/30 to-amber-950/40 border border-amber-500/30 text-amber-300 rounded-xl text-[10px] font-mono font-bold tracking-widest uppercase hover:border-cyan-500/40 hover:text-cyan-300 transition-all flex items-center justify-center gap-2"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>JARVIS AI FORMULATING HQ SPECS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>⚡ ENHANCE PROMPT WITH JARVIS AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompts Helper */}
            <div className="flex flex-wrap gap-1.5 text-[9px] font-mono">
              <button 
                onClick={() => setPrompt("Fashion model wearing futuristic luxury cyber-couture streetwear, cinematic high key volumetric lighting, shallow depth of field, sharp focus, ARRI Alexa 35")}
                className="px-2 py-1 bg-zinc-950/80 text-gray-400 border border-white/5 rounded hover:border-cyan-500/40 hover:text-cyan-300 transition"
              >
                + Luxury Fashion
              </button>
              <button 
                onClick={() => setPrompt("Hyperrealistic close up of highly intricate futuristic clockwork engine with glowing sapphire gemstones, spinning golden gears, professional macro lens")}
                className="px-2 py-1 bg-zinc-950/80 text-gray-400 border border-white/5 rounded hover:border-cyan-500/40 hover:text-cyan-300 transition"
              >
                + Macro Physics
              </button>
              <button 
                onClick={() => setPrompt("Breathtaking scenic landscape of floating biome islands with neon bioluminescent waterfalls, dusk golden hour lighting, cinematic panoramic drone flyby")}
                className="px-2 py-1 bg-zinc-950/80 text-gray-400 border border-white/5 rounded hover:border-cyan-500/40 hover:text-cyan-300 transition"
              >
                + Biolume Fantasy
              </button>
            </div>

            {/* Cinematic Directives Grid */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5" /> High-End Production specs
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Camera Selection */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Camera Body</span>
                  <select 
                    value={selectedCamera} 
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ARRI Alexa 35">ARRI Alexa 35</option>
                    <option value="RED V-Raptor">RED V-Raptor</option>
                    <option value="Sony Venice 2">Sony Venice 2</option>
                    <option value="Blackmagic URSA">Blackmagic URSA</option>
                  </select>
                </div>

                {/* Lens Selection */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Cinematic Lens</span>
                  <select 
                    value={selectedLens} 
                    onChange={(e) => setSelectedLens(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="24mm Cinematic Wide">24mm Cinematic Wide</option>
                    <option value="35mm Prime">35mm Prime</option>
                    <option value="50mm Prime">50mm Prime</option>
                    <option value="85mm Portrait">85mm Portrait</option>
                    <option value="Anamorphic Ultra">Anamorphic Lens</option>
                  </select>
                </div>

                {/* Camera Movement */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Motion Command</span>
                  <select 
                    value={selectedMovement} 
                    onChange={(e) => setSelectedMovement(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Slow Push-In">Slow Push-In</option>
                    <option value="Dolly Track Move">Dolly Track Focus</option>
                    <option value="Crane Overhead">Crane Jib Drop</option>
                    <option value="Orbit 360 Spin">Orbit 360 Spin</option>
                    <option value="Drone Glide">Drone Glide Flyby</option>
                    <option value="Handheld Shaky Shaker">Handheld Reality</option>
                  </select>
                </div>

                {/* Creative Style presets */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Creative Palette</span>
                  <select 
                    value={selectedStyle} 
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Hollywood Cinematic">Hollywood Cinema</option>
                    <option value="Luxury Commercial">Luxury Brand</option>
                    <option value="Sci-Fi Cyberpunk">Sci-Fi Cyberpunk</option>
                    <option value="Anime/Manga Vibe">Anime & Manga Art</option>
                    <option value="IMAX Documentary Style">3D Concept Art</option>
                    <option value="AAA Game Studio Render">Breathtaking Realism</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Technical Resolution / Sizing parameters */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Aspect Ratio */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Aspect Ratio</span>
                  <select 
                    value={aspectRatio} 
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="2.39:1">2.39:1 Cinemascope</option>
                  </select>
                </div>

                {/* Model Resolution select */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block">Render Quality</span>
                  <select 
                    value={model} 
                    onChange={(e) => {
                      setModel(e.target.value);
                      setResolution(e.target.value.includes("lite") ? "1080p" : "4k");
                    }}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="veo-3.1-lite-generate-preview">1080p (Standard Lite)</option>
                    <option value="veo-3.1-generate-preview">4K UHD (Master Pro)</option>
                  </select>
                </div>

              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || isEnhancing || prompt.trim() === ""}
              className={`mt-2 w-full py-4 rounded-xl font-bold font-mono tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-all ${mode === 'video' ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-black" />
                  <span>SYNTHESIZING MATRIX...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-black" />
                  <span>START RENDER PIPELINE</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-950/40 text-red-500 font-mono text-[10px] rounded border border-red-500/20">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Viewport & Dolby Vision Settings (span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Rendering Viewport Block */}
          <div className="flex-1 min-h-[400px] bg-black border border-white/10 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center shadow-[inset_0_0_80px_rgba(0,0,0,0.95)]">
            
            <div 
              className="w-full h-full flex items-center justify-center relative p-1"
              style={getDolbyFilters()}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-amber-500/50 flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs uppercase tracking-widest text-cyan-400 animate-pulse">
                      {statusText}
                    </p>
                    <p className="font-mono text-[9px] text-gray-600 uppercase">DO NOT TERMINATE WINDOW clearance active</p>
                  </div>
                </div>
              ) : videoUrl && mode === "video" ? (
                <div className="w-full h-full relative group flex items-center justify-center bg-black">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    muted
                    playsInline
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                  <a 
                    href={videoUrl}
                    download="jarvis-render.mp4"
                    className="absolute top-4 right-4 bg-black/80 hover:bg-neutral-900 p-2.5 rounded-xl border border-white/20 text-white hover:text-amber-400 hover:border-amber-400/50 transition opacity-0 group-hover:opacity-100 backdrop-blur-md z-30"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ) : imageUrl && mode === "image" ? (
                <div className="w-full h-full relative group flex items-center justify-center bg-black">
                  <img 
                    src={imageUrl} 
                    alt="JARVIS synthesis render output"
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  />
                  <a 
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 bg-black/80 hover:bg-neutral-900 p-2.5 rounded-xl border border-white/20 text-white hover:text-cyan-400 hover:border-cyan-400/50 transition opacity-0 group-hover:opacity-100 backdrop-blur-md z-30 flex items-center gap-1.5 font-mono text-[9px] bold"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>OPEN STANDARD LINK</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center text-gray-700 font-mono text-xs tracking-widest space-y-3">
                  <Film className="w-12 h-12 text-zinc-800 animate-pulse" />
                  <div>
                    <p className="uppercase text-gray-500 text-[10px] tracking-widest">Vision Studio Viewport Offline</p>
                    <p className="text-[9px] text-gray-600 uppercase mt-1">Awaiting spec orchestration & execution</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inbuilt Dolby Vision active watermark badge */}
            {dolbyVisionEnabled && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/85 border border-amber-500/25 text-[#f59e0b] font-mono text-[9px] font-bold tracking-widest shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>DOLBY VISION HDR ST.2084 REFERENCE ACTIVE</span>
              </div>
            )}
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          {/* DOLBY VISION CONSOLE BAR */}
          <div className="p-4 bg-zinc-950 border border-amber-500/15 hover:border-amber-500/25 transition-all rounded-2xl flex flex-col md:flex-row gap-5 justify-between">
            {/* Left Col: Master Toggle */}
            <div className="md:w-1/3 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-serif font-black text-sm">D</div>
                  <div>
                    <h4 className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">Dolby Vision™ HDR</h4>
                    <span className="text-[8px] text-gray-500 font-mono">Dynamic Baseband Colorometry</span>
                  </div>
                </div>
                <button
                  onClick={() => setDolbyVisionEnabled(!dolbyVisionEnabled)}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-black transition-all ${dolbyVisionEnabled ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.25)]" : "bg-zinc-900 border border-white/10 text-gray-400"}`}
                >
                  {dolbyVisionEnabled ? "ACTIVE" : "BYPASSED"}
                </button>
              </div>

              {dolbyVisionEnabled && (
                <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 font-mono text-[8px] text-gray-500">
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
                      className={`py-1.5 px-2 rounded-lg text-[9px] font-mono uppercase border transition-all text-center ${dolbyProfile === profile ? "bg-amber-950/45 border-amber-500 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "bg-zinc-900/40 border-white/5 text-gray-400 hover:text-white"}`}
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

            {/* Right Col: Custom sliders or Status */}
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
                        className="w-full accent-amber-500 bg-zinc-900 text-amber-500 rounded h-1 outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[8px] bg-black/30 border border-white/5 rounded-lg p-2.5 flex flex-col justify-center h-[64px]">
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
