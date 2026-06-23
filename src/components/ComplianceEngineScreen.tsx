import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, FileText, ChevronLeft, UploadCloud, Play, StopCircle, CornerDownLeft, FileCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { ActiveScreen } from "../types";
import DocumentRiskChart, { VisualizedDocument } from "./DocumentRiskChart";

interface ComplianceEngineScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  key?: string;
}

export default function ComplianceEngineScreen({ onNavigate }: ComplianceEngineScreenProps) {
  const [documents, setDocuments] = useState<VisualizedDocument[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ query: string; answer: string; citations: string[]; risks: string[]; }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocs = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        file,
        status: "pending" as const
      }));
      setDocuments(prev => [...prev, ...newDocs]);
    }
  };

  const handleScan = async () => {
    if (documents.length === 0) return;
    setIsScanning(true);
    setDocuments(prev => prev.map(d => ({ ...d, status: "scanning" })));

    // Read all files asynchronously
    const updatedDocs = await Promise.all(
      documents.map(async (doc) => {
        if (doc.status === "pending" || doc.status === "scanning") {
          return new Promise<typeof doc>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const textContent = (event.target?.result as string) || "";
              resolve({
                ...doc,
                status: "analyzed",
                text: textContent,
                riskScore: Math.floor(Math.random() * 41) + 10 // Risk rating: 10% to 50%
              });
            };
            reader.onerror = () => {
              resolve({
                ...doc,
                status: "analyzed",
                text: "[Error parsing body or structure stream]",
                riskScore: 0
              });
            };
            reader.readAsText(doc.file);
          });
        }
        return doc;
      })
    );

    setDocuments(updatedDocs);
    setIsScanning(false);
  };

  const handleQuerySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || documents.length === 0) return;
    
    setIsThinking(true);
    setQuery("");

    try {
      const res = await fetch("/api/compliance-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          documents: documents.map(d => ({ name: d.name, text: d.text || "" }))
        })
      });
      const data = await res.json();
      
      setResults([{
        query: query,
        answer: data.answer || "Insufficient context to answer.",
        citations: data.citations || [],
        risks: data.risks || []
      }, ...results]);

    } catch (err) {
      console.error(err);
      setResults([{
        query: query,
        answer: "System malfunction during document extraction.",
        citations: [],
        risks: []
      }, ...results]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col items-center p-4 bg-zinc-950 min-h-screen text-gray-200"
    >
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-white/10 mt-safe pt-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all font-mono"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-widest font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              COMPLIANCE & RISK ENGINE
            </h1>
            <p className="text-[10px] uppercase font-mono text-gray-500">FastAPI / DistilBERT QA Simulation</p>
          </div>
        </div>
      </div>

      {/* Document Risk Density Visualizer Dashboard */}
      <div className="w-full max-w-4xl mb-6">
        <DocumentRiskChart documents={documents} />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 h-full mb-24">
        
        {/* Left Column: Documents */}
        <div className="col-span-1 border border-white/10 rounded-2xl p-4 bg-zinc-900/50 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs uppercase font-mono text-white tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" /> Corpus
            </h2>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept=".pdf,.txt,.md" />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors mb-4 group"
          >
            <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-cyan-400" />
            <span className="text-xs font-mono uppercase text-gray-400 group-hover:text-cyan-400">Load Documents</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {documents.map(doc => (
              <div key={doc.id} className="p-3 bg-zinc-950 border border-white/5 rounded-xl flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate text-gray-300">{doc.name}</p>
                  <p className="text-[10px] font-mono text-gray-600 uppercase pt-1">
                    {doc.status === 'pending' ? 'Ready for scan' : doc.status === 'scanning' ? 'Scanning...' : 'Indexed'}
                    {doc.riskScore !== undefined && <span className="text-rose-400 ml-2">Risk: {doc.riskScore}%</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {documents.length > 0 && documents.some(d => d.status === 'pending') && (
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="mt-4 w-full py-3 bg-teal-900/40 text-teal-300 border border-teal-500/30 font-mono text-xs uppercase tracking-widest rounded-xl hover:bg-teal-800/60 transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isScanning ? 'Indexing...' : 'Index Corpus'}
            </button>
          )}
        </div>

        {/* Right Column: QA & Analysis */}
        <div className="col-span-1 md:col-span-2 border border-white/10 rounded-2xl pb-0 bg-zinc-900/50 flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4 text-cyan-400" />
             <h2 className="text-xs uppercase font-mono text-white tracking-widest">Analysis Terminal</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {results.length === 0 && !isThinking && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                <ShieldCheck className="w-16 h-16 opacity-20" />
                <p className="text-xs font-mono uppercase text-center max-w-sm">
                  Index documents and query clauses to extract risk vectors (e.g., "unlimited liability", "auto-renewal").
                </p>
              </div>
            )}

            <AnimatePresence>
              {results.map((res, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className="space-y-3"
                >
                  <div className="flex justify-end mb-2">
                    <div className="bg-cyan-900/30 text-cyan-100 border border-cyan-500/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[85%] font-sans">
                      {res.query}
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-zinc-950 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 text-sm max-w-[90%] space-y-4 shadow-xl">
                      <div className="text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                        {res.answer}
                      </div>
                      
                      {res.risks.length > 0 && (
                        <div className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl space-y-2 mt-4">
                          <h4 className="text-[10px] text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Detected Risks</h4>
                          <div className="flex flex-wrap gap-2">
                            {res.risks.map((risk, r) => (
                              <span key={r} className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-1 rounded-md text-[10px] font-mono">
                                {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {res.citations.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Citations</h4>
                          {res.citations.map((cit, c) => (
                            <div key={c} className="text-xs text-gray-400 pl-2 border-l-2 border-cyan-500/30 font-sans italic">
                              "{cit}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 w-48 font-mono text-xs text-cyan-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Extracting...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
      
      {/* Input Overlay */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-zinc-950 to-transparent z-40 pointer-events-none pb-safe">
        <form onSubmit={handleQuerySubmit} className="max-w-4xl mx-auto pointer-events-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={documents.every(d => d.status !== 'analyzed') || isThinking}
            placeholder={documents.some(d => d.status === 'analyzed') ? "Query clauses (e.g. Find auto-renewal terms)..." : "Index documents first to enable querying"}
            className="w-full bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors shadow-2xl font-sans text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={documents.every(d => d.status !== 'analyzed') || isThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CornerDownLeft className="w-5 h-5" />
          </button>
        </form>
      </div>

    </motion.div>
  );
}
