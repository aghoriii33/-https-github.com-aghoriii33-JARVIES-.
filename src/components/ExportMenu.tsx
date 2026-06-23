import { useState, useRef, useEffect } from "react";
import { Download, FileText, File } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../types";

interface ExportMenuProps {
  messages: Message[];
}

export default function ExportMenu({ messages }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportText = () => {
    if (messages.length === 0) return;

    const formattedBackup = `========================================
JARVIS CORE DIAGNOSTIC CONVERSATION LOG
========================================
Exported: ${new Date().toLocaleString()}
Active Session Key: ${Math.random().toString(36).substring(2, 10).toUpperCase()}
========================================\n\n` +
      messages
        .map((msg) => {
          const header = `[${msg.timestamp}] ${msg.senderName}:`;
          const metricsStr = msg.metrics
            ? `\n\n-- TECHNICAL SYSTEM METRICS:\n  * Thermal Load: ${msg.metrics.thermalLoad}\n  * Success Probability: ${msg.metrics.successProb}\n  * Technical Recommendation: ${msg.metrics.actionRecommended}`
            : "";
          return `${header}\n${msg.text}${metricsStr}\n`;
        })
        .join("\n" + "-".repeat(40) + "\n\n");

    const blob = new Blob([formattedBackup], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JARVIS_Diagnostic_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    if (messages.length === 0) return;
    
    import('jspdf').then((jspdf) => {
      const doc = new jspdf.default();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const textWidth = pageWidth - margin * 2;
      let cursorY = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("JARVIS CORE DIAGNOSTIC CONVERSATION LOG", margin, cursorY);
      cursorY += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Exported: ${new Date().toLocaleString()}`, margin, cursorY);
      cursorY += 5;
      doc.text(`Active Session Key: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, margin, cursorY);
      cursorY += 8;
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 8;

      messages.forEach((msg) => {
        if (cursorY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`[${msg.timestamp}] ${msg.senderName}:`, margin, cursorY);
        cursorY += 6;
        
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(msg.text, textWidth);
        doc.text(splitText, margin, cursorY);
        cursorY += splitText.length * 5 + 4;

        if (msg.metrics) {
          doc.setFont("helvetica", "italic");
          doc.text(`-- TECHNICAL SYSTEM METRICS:`, margin, cursorY);
          cursorY += 5;
          doc.text(`  * Thermal Load: ${msg.metrics.thermalLoad}`, margin + 2, cursorY);
          cursorY += 5;
          doc.text(`  * Success Probability: ${msg.metrics.successProb}`, margin + 2, cursorY);
          cursorY += 5;
          doc.text(`  * Technical Recommendation: ${msg.metrics.actionRecommended}`, margin + 2, cursorY);
          cursorY += 8;
        }

        doc.setDrawColor(200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 8;
      });

      doc.save(`JARVIS_Diagnostic_${new Date().toISOString().split('T')[0]}.pdf`);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={messages.length === 0}
        title="Export Conversation"
        className={`p-1.5 border rounded-full text-xs font-mono disabled:opacity-40 disabled:hover:text-gray-400 disabled:hover:border-white/5 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 ${isOpen ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border-white/5 text-gray-400 hover:border-cyan-400/40 hover:text-cyan-400'}`}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider">Export</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 origin-top-right"
          >
            <div className="flex flex-col py-1.5">
              <button
                onClick={handleExportText}
                className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-left cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4 text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-sans text-gray-200">Text Formatted</span>
                  <span className="text-[10px] font-mono text-gray-500">.txt / diagnostic</span>
                </div>
              </button>
              
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-left cursor-pointer transition-colors"
              >
                <File className="w-4 h-4 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-sans text-cyan-100">PDF Report</span>
                  <span className="text-[10px] font-mono text-cyan-400/60">.pdf / formal</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
