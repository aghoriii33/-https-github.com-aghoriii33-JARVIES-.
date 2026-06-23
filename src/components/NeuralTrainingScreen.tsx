import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Sliders,
  ChevronLeft,
  Plus,
  Trash2,
  Activity,
  AlertCircle
} from "lucide-react";
import { ActiveScreen } from "../types";

interface NeuralTrainingScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  key?: string;
}

interface DatasetItem {
  id: string;
  input: string;
  expectedOutput: string;
  status: "pending" | "queued" | "trained";
}

export default function NeuralTrainingScreen({ onNavigate }: NeuralTrainingScreenProps) {
  // Hyperparameters
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [dropoutRate, setDropoutRate] = useState<number>(0.2);
  const [epochs, setEpochs] = useState<number>(5);
  const [batchSize, setBatchSize] = useState<number>(32);

  // Datasets
  const [datasets, setDatasets] = useState<DatasetItem[]>([
    { id: "ds-1", input: "Command Authority", expectedOutput: "Override confirmed for designated Jarvis Master Operations.", status: "trained" },
    { id: "ds-2", input: "Flight Propulsion Telemetry", expectedOutput: "Auto-recalibrate thrusters to maintain steady thermal variance.", status: "trained" },
    { id: "ds-3", input: "AI Interaction Mode", expectedOutput: "Increase snark and conversational awareness rating by 15%.", status: "queued" },
  ]);

  const [newInput, setNewInput] = useState("");
  const [newOutput, setNewOutput] = useState("");

  // Training state variables
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [lossValue, setLossValue] = useState<number>(1.84);
  const [accuracyValue, setAccuracyValue] = useState<number>(34.2);
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING COGNITIVE GRADIENT NODE LIST",
    "WEBAUTHN ATTROPHE BUFFER ATTACHED",
    "READY FOR FINE-TUNING RE-SYSTALIZATION"
  ]);

  const [activeSynapseGroup, setActiveSynapseGroup] = useState<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Synaptic network heartbeat animation when idle
  useEffect(() => {
    if (isTraining) return;
    const pulseTimer = setInterval(() => {
      setActiveSynapseGroup((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(pulseTimer);
  }, [isTraining]);

  // Handle addition of custom dataset instructions
  const handleAddDataset = () => {
    if (!newInput.trim() || !newOutput.trim()) return;
    const newItem: DatasetItem = {
      id: `ds-${Date.now()}`,
      input: newInput.trim(),
      expectedOutput: newOutput.trim(),
      status: "queued"
    };

    setDatasets((prev) => [...prev, newItem]);
    setLogs((prev) => [
      ...prev,
      `QUEUED GRADIENT MEMORY DECAL: "${newItem.input.substring(0, 20)}..."`
    ]);
    setNewInput("");
    setNewOutput("");
  };

  // Delete a dataset
  const handleDeleteDataset = (id: string) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
  };

  // Run simulated training
  const handleCommenceTraining = () => {
    if (isTraining) return;
    setIsTraining(true);
    setCurrentEpoch(1);
    setCurrentBatch(1);
    setLossValue(2.01);
    setAccuracyValue(30.5);

    setLogs([
      "COMMENCING STARK COGNITIVE FINE-TUNING ROUTINE",
      "ALLOCATING LOCAL GPU EXCLUSIVE STACK ACCELERATION",
      `HYPERPARAMETERS LOCKED: Epochs=${epochs}, LR=${learningRate}, Batch=${batchSize}`,
      "DISSOLVING TRAINED SYNAPTIC ENCRYPTION SHEATHS...",
    ]);

    let epochTick = 1;
    let batchTick = 1;
    const totalBatches = 4;

    const interval = setInterval(() => {
      // Rotate active neural node groups
      setActiveSynapseGroup(Math.floor(Math.random() * 4));

      // Calculate state changes
      const progressionRatio = ((epochTick - 1) * totalBatches + batchTick) / (epochs * totalBatches);
      const lossDrop = (2.01 - 0.04) * progressionRatio * (0.9 + Math.random() * 0.2);
      const accuracyGain = (99.6 - 30.5) * progressionRatio * (0.9 + Math.random() * 0.1);

      setLossValue(Math.max(0.04, parseFloat((2.01 - lossDrop).toFixed(4))));
      setAccuracyValue(Math.min(99.6, parseFloat((30.5 + accuracyGain).toFixed(1))));

      setLogs((prev) => [
        ...prev,
        `[EPOCH ${epochTick}/${epochs}] Batch ${batchTick}/${totalBatches} - Loss: ${parseFloat((2.01 - lossDrop).toFixed(4))} - Acc: ${parseFloat((30.5 + accuracyGain).toFixed(1))}%`
      ]);

      batchTick++;
      if (batchTick > totalBatches) {
        batchTick = 1;
        epochTick++;
        if (epochTick > epochs) {
          clearInterval(interval);
          finishTraining();
        } else {
          setCurrentEpoch(epochTick);
          setCurrentBatch(1);
          setLogs((prev) => [
            ...prev,
            `--- EPOCH ${epochTick - 1} COMPLETED ---`,
            `MERGING INTERMEDIATE WEIGHT WEIGHTINGS FOR COHESIVE BIAS`
          ]);
        }
      } else {
        setCurrentBatch(batchTick);
      }
    }, 900);
  };

  // Post training success
  const finishTraining = () => {
    setIsTraining(false);
    setCurrentEpoch(epochs);
    setCurrentBatch(4);
    setLossValue(0.041);
    setAccuracyValue(99.6);

    // Update statuses
    setDatasets((prev) =>
      prev.map((d) => (d.status === "queued" ? { ...d, status: "trained" } : d))
    );

    setLogs((prev) => [
      ...prev,
      "========================================",
      "COGNITIVE DEEP RE-TRAINING EXCLUSIVE SUCCESS!",
      "SYNAPTIC COEFFICIENTS SYNCED BACK TO MAIN OPERATIONAL MEMORY GATEWAY.",
      "SYSTEM STATUS: PARANOID PROTECTION ONLINE.",
      "JARVIS MIND PALACE EXPANDED SUCCESSFULLY.",
    ]);
  };

  const handleResetParameters = () => {
    setLearningRate(0.001);
    setDropoutRate(0.2);
    setEpochs(5);
    setBatchSize(32);
    setLogs((prev) => [...prev, "HYPERPARAMETERS REVERTED TO FACTORY BASE SPECIFICATION"]);
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-[#050508] text-white overflow-hidden py-4 px-4 sm:px-6">
      <div className="absolute inset-0 grid-cyber opacity-30 pointer-events-none" />

      {/* Top Application Bar */}
      <header className="flex justify-between items-center pb-3 border-b border-white/5 relative z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
            className="p-2 -ml-1 bg-white/[0.02] border border-white/5 rounded-xl text-gray-400 hover:text-white cursor-pointer active:scale-90 transition-all shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-sans text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 line-clamp-1">
              <BrainCircuit className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              NEURAL SYNAPSE FINE-TUNER
            </h1>
            <p className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-widest leading-none mt-1">
              Jarvis Mental Core Upgrader V4
            </p>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-505/10 flex items-center gap-1.5 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${isTraining ? 'bg-orange-500 animate-ping' : 'bg-cyan-400'}`} />
          <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-wider text-cyan-400 font-bold">
            {isTraining ? "ACTIVE TRAINING MODE" : "CORES LINKED"}
          </span>
        </div>
      </header>

      {/* Main Workspace Section */}
      <main className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4 relative z-10">
        
        {/* SVG Neural Mesh Visualizer - Immersive, glowing network representation */}
        <div className="relative w-full rounded-2xl bg-black/60 border border-white/5 p-4 flex flex-col items-center justify-center overflow-hidden h-[180px]">
          {/* Back Glowing Orb */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-transparent to-purple-950/20 blur-2xl pointer-events-none" />
          
          <svg className="w-full h-full max-w-[400px] text-white" viewBox="0 0 200 100">
            {/* Connection Paths (Synaptic Links) */}
            <g strokeWidth={isTraining ? 1.5 : 0.8} strokeLinecap="round">
              {/* Input layer to Hidden layer 1 */}
              <line x1="20" y1="20" x2="70" y2="15" className={`transition-all duration-300 ${activeSynapseGroup === 0 || isTraining ? 'stroke-cyan-400 opacity-90' : 'stroke-white/10'}`} />
              <line x1="20" y1="20" x2="70" y2="50" className={`transition-all duration-300 ${activeSynapseGroup === 2 || isTraining ? 'stroke-cyan-400 opacity-90' : 'stroke-white/10'}`} />
              <line x1="20" y1="50" x2="70" y2="15" className={`transition-all duration-300 ${activeSynapseGroup === 1 || isTraining ? 'stroke-cyan-400 opacity-60' : 'stroke-white/10'}`} />
              <line x1="20" y1="50" x2="70" y2="50" className={`transition-all duration-300 ${activeSynapseGroup === 3 || isTraining ? 'stroke-cyan-400 opacity-80' : 'stroke-white/10'}`} />
              <line x1="20" y1="50" x2="70" y2="85" className={`transition-all duration-300 ${activeSynapseGroup === 0 || isTraining ? 'stroke-cyan-400 opacity-60' : 'stroke-white/10'}`} />
              <line x1="20" y1="80" x2="70" y2="50" className={`transition-all duration-300 ${activeSynapseGroup === 2 || isTraining ? 'stroke-cyan-400 opacity-60' : 'stroke-white/10'}`} />
              <line x1="20" y1="80" x2="70" y2="85" className={`transition-all duration-300 ${activeSynapseGroup === 1 || isTraining ? 'stroke-cyan-400 opacity-90' : 'stroke-white/10'}`} />

              {/* Hidden layer 1 to Hidden layer 2 */}
              <line x1="70" y1="15" x2="130" y2="30" className={`transition-all duration-300 ${activeSynapseGroup === 2 || isTraining ? 'stroke-purple-400 opacity-90' : 'stroke-white/10'}`} />
              <line x1="70" y1="15" x2="130" y2="70" className={`transition-all duration-300 ${activeSynapseGroup === 0 || isTraining ? 'stroke-purple-400 opacity-60' : 'stroke-white/10'}`} />
              <line x1="70" y1="50" x2="130" y2="30" className={`transition-all duration-300 ${activeSynapseGroup === 3 || isTraining ? 'stroke-purple-400 opacity-90' : 'stroke-white/10'}`} />
              <line x1="70" y1="50" x2="130" y2="70" className={`transition-all duration-300 ${activeSynapseGroup === 1 || isTraining ? 'stroke-purple-400 opacity-80' : 'stroke-white/10'}`} />
              <line x1="70" y1="85" x2="130" y2="30" className={`transition-all duration-300 ${activeSynapseGroup === 0 || isTraining ? 'stroke-purple-400 opacity-60' : 'stroke-white/10'}`} />
              <line x1="70" y1="85" x2="130" y2="70" className={`transition-all duration-300 ${activeSynapseGroup === 2 || isTraining ? 'stroke-purple-400 opacity-90' : 'stroke-white/10'}`} />

              {/* Hidden layer 2 to Output layer */}
              <line x1="130" y1="30" x2="180" y2="50" className={`transition-all duration-300 ${activeSynapseGroup === 1 || isTraining ? 'stroke-pink-400 opacity-90' : 'stroke-white/10'}`} />
              <line x1="130" y1="70" x2="180" y2="50" className={`transition-all duration-300 ${activeSynapseGroup === 3 || isTraining ? 'stroke-pink-400 opacity-90' : 'stroke-white/10'}`} />
            </g>

            {/* Neural Nodes Circle elements */}
            <g>
              {/* Input Layer Nodes */}
              <circle cx="20" cy="20" r="4" className={`fill-black stroke-2 transition-transform duration-300 hover:scale-125 ${isTraining ? 'stroke-cyan-400 fill-cyan-950 shadow-md' : 'stroke-cyan-500'}`} />
              <circle cx="20" cy="50" r="4" className={`fill-black stroke-2 transition-transform duration-300 hover:scale-125 ${isTraining ? 'stroke-cyan-400 fill-cyan-950 shadow-md' : 'stroke-cyan-500'}`} />
              <circle cx="20" cy="80" r="4" className={`fill-black stroke-2 transition-transform duration-300 hover:scale-125 ${isTraining ? 'stroke-cyan-400 fill-cyan-950 shadow-md' : 'stroke-cyan-500'}`} />

              {/* Hidden Layer 1 Nodes */}
              <circle cx="70" cy="15" r="4.5" className={`fill-black stroke-2 transition-all duration-300 ${activeSynapseGroup === 0 ? 'stroke-cyan-300 scale-110' : 'stroke-zinc-500'}`} />
              <circle cx="70" cy="50" r="4.5" className={`fill-black stroke-2 transition-all duration-300 ${activeSynapseGroup === 3 ? 'stroke-cyan-300 scale-110' : 'stroke-zinc-500'}`} />
              <circle cx="70" cy="85" r="4.5" className={`fill-black stroke-2 transition-all duration-300 ${activeSynapseGroup === 1 ? 'stroke-cyan-300 scale-110' : 'stroke-zinc-500'}`} />

              {/* Hidden Layer 2 Nodes */}
              <circle cx="130" cy="30" r="4.5" className={`fill-black stroke-2 transition-all duration-300 ${activeSynapseGroup === 2 ? 'stroke-purple-400 scale-110' : 'stroke-zinc-500'}`} />
              <circle cx="130" cy="70" r="4.5" className={`fill-black stroke-2 transition-all duration-300 ${activeSynapseGroup === 0 ? 'stroke-purple-400 scale-110' : 'stroke-zinc-500'}`} />

              {/* Output Layer Node */}
              <circle cx="180" cy="50" r="5" className={`fill-black stroke-2 transition-transform duration-300 hover:scale-125 ${isTraining ? 'stroke-pink-400 fill-pink-950/60 animate-pulse' : 'stroke-pink-500'}`} />
            </g>
          </svg>
          
          <div className="absolute top-2 left-3 font-mono text-[8px] text-gray-500 tracking-wider">
            SYNAPTIC TRANSMISSION: {isTraining ? "ACTIVE MODEL UPGRADES" : "STEADY-STATE MATRIX LINKED"}
          </div>
        </div>

        {/* Training Progress Telemetry (If active or done) */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Training Loss Rate */}
          <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl text-left">
            <span className="text-[9px] uppercase font-mono text-gray-500 block">TRAINING LOSS</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-mono font-bold text-pink-400">
                {lossValue}
              </span>
              <span className="text-[10px] font-mono text-gray-500">Cross-entropy</span>
            </div>
            {/* Visualizer drop indicators */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-pink-500 transition-all duration-300"
                style={{ width: `${Math.max(5, (2.3 - lossValue) / 2.3 * 100)}%` }}
              />
            </div>
          </div>

          {/* Validation Accuracy */}
          <div className="p-3 bg-zinc-950 border border-white/5 rounded-xl text-left">
            <span className="text-[9px] uppercase font-mono text-gray-500 block">COGNITIVE ACCURACY</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-mono font-bold text-green-400">
                {accuracyValue}%
              </span>
              <span className="text-[10px] font-mono text-gray-500">Heuristic check</span>
            </div>
            {/* Micro horizontal accuracy bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${accuracyValue}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hyperparameters Config Controls Panel */}
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-xs uppercase font-mono tracking-wider text-white font-bold flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              HYPERPARAMETER OVERRIDES
            </h3>
            <button
              onClick={handleResetParameters}
              disabled={isTraining}
              className="text-[9px] font-mono text-gray-500 hover:text-white cursor-pointer select-none border-none bg-transparent"
            >
              RESET TO DEFAULTS
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Learning Rate (Alpha Constant) */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 uppercase">LEARNING RATE (α):</span>
                <span className="text-cyan-400 font-bold">{learningRate}</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0005"
                value={learningRate}
                disabled={isTraining}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[8px] text-gray-500 leading-none">Sets descent speed of backpropagation</p>
            </div>

            {/* Dropout Protection Probability */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 uppercase">SYNAPSE DROPOUT PROB:</span>
                <span className="text-purple-400 font-bold">{(dropoutRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={dropoutRate}
                disabled={isTraining}
                onChange={(e) => setDropoutRate(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[8px] text-gray-500 leading-none">Prevents core over-alignment on local profiles</p>
            </div>

            {/* Training Epochs */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 uppercase">TRAINING ITERATIONS (EPOCHS):</span>
                <span className="text-orange-400 font-bold">{epochs}</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={epochs}
                disabled={isTraining}
                onChange={(e) => setEpochs(parseInt(e.target.value))}
                className="w-full accent-orange-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[8px] text-gray-500 leading-none">Number of continuous synaptic passes</p>
            </div>

            {/* Neural Batch Processing Slices */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 uppercase">MINI-BATCH SIZE:</span>
                <span className="text-green-400 font-bold">{batchSize} samples</span>
              </div>
              <div className="flex gap-2">
                {[16, 32, 64].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBatchSize(size)}
                    disabled={isTraining}
                    className={`flex-1 py-1.5 border rounded-lg text-[10px] text-center transition-all cursor-pointer ${
                      batchSize === size
                        ? "bg-green-950/40 border-green-500 text-green-400"
                        : "bg-zinc-900 border-white/5 text-gray-500 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Instructional Dataset Pool */}
        <div className="p-4 bg-zinc-950 border border-white/5 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="text-xs uppercase font-mono tracking-wider text-white font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#ff2d55]" />
                CUSTOM COGNITIVE TELEMETRY POOL
              </h3>
              <p className="text-[8px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">
                Inject target rules into JARVIS response alignment matrix
              </p>
            </div>
            <span className="text-[9px] font-mono bg-zinc-900 px-2.5 py-1 border border-white/5 rounded-md text-white/50">
              {datasets.length} Items Locked
            </span>
          </div>

          {/* Dataset list */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {datasets.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div className="text-left font-mono space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white">{item.input}</span>
                    <span className={`text-[7px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${
                      item.status === 'trained' 
                        ? 'bg-green-950/40 border border-green-500/20 text-green-400' 
                        : 'bg-amber-950/40 border border-amber-500/20 text-amber-400 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 italic font-sans font-light">
                    &ldquo;{item.expectedOutput}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDataset(item.id)}
                  disabled={isTraining}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-400 select-none active:scale-95 transition-all self-end sm:self-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Input fields to add data */}
          <div className="pt-2.5 border-t border-white/5 text-xs font-mono space-y-2.5">
            <span className="text-[10px] text-white/50 uppercase font-black block text-left">
              + FEED NEW INTEL TO COGNITIVE POOL
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="PROMPT KEY (e.g., identity mandate)"
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                disabled={isTraining}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] focus:outline-none focus:border-cyan-400 text-white placeholder-zinc-600"
              />
              <input
                type="text"
                placeholder="TARGET ALIGNMENT RESPONSE (e.g., Confirm Master)"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
                disabled={isTraining}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/5 rounded-lg text-[10px] focus:outline-none focus:border-cyan-400 text-white placeholder-zinc-600"
              />
            </div>

            <button
              type="button"
              onClick={handleAddDataset}
              disabled={isTraining || !newInput.trim() || !newOutput.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-950/60 to-purple-950/60 hover:from-cyan-900 hover:to-purple-900 border border-white/10 rounded-xl flex items-center justify-center gap-1.5 text-[10px] tracking-widest text-[#5ac8fa] font-black uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Queue Memory Decal
            </button>
          </div>
        </div>

        {/* Real-Time Training Diagnostic terminal */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-1.5 px-1 text-gray-500">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold">
              REAL-TIME SYNAPTIC DIAGNOSTICS FEED
            </span>
          </div>

          <div className="bg-black/95 px-3 py-2.5 h-40 rounded-xl border border-white/5 font-mono text-[8px] sm:text-[9px] text-zinc-400 space-y-1.5 overflow-y-auto no-scrollbar border-l-2 border-cyan-400 select-none">
            {logs.map((log, idx) => (
              <p
                key={idx}
                className={`line-clamp-2 ${
                  log.includes("SUCCESS") || log.includes("FINISH") || log.includes("COMPLETED")
                    ? "text-green-400 font-bold"
                    : log.includes("COMMENCING") || log.includes("ACTIVE") 
                    ? "text-orange-400 font-bold animate-pulse"
                    : "text-zinc-500"
                }`}
              >
                &gt; {log}
              </p>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>

      </main>

      {/* Floating Action Button "Commence training" */}
      <footer className="pt-2 z-10">
        <motion.button
          whileHover={isTraining ? {} : { scale: 1.02 }}
          whileTap={isTraining ? {} : { scale: 0.97 }}
          onClick={handleCommenceTraining}
          disabled={isTraining}
          className={`w-full py-4 text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 shadow-[0_4px_30px_rgba(6,182,212,0.15)] uppercase border border-white/10 ${
            isTraining 
              ? "bg-gradient-to-r from-orange-950/60 to-orange-800/80 cursor-not-allowed text-orange-200"
              : "bg-gradient-to-r from-cyan-900 to-purple-800 hover:brightness-110 cursor-pointer"
          }`}
        >
          {isTraining ? (
            <>
              <Activity className="w-4 h-4 text-orange-400 animate-spin" />
              <span>Calibrating Neural Connections ({accuracyValue}%)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Commence Synaptic Stack Training</span>
            </>
          )}
        </motion.button>
      </footer>
    </div>
  );
}
