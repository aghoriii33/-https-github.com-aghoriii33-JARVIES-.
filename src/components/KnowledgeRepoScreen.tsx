import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  ShieldAlert,
  HardDrive,
  Folder,
  UploadCloud,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Database,
  ShieldCheck,
  Globe,
  Wifi,
  CornerDownRight,
  Info
} from "lucide-react";
import { ActiveScreen, KnowledgeDocument } from "../types";
import { getAccessToken, signInWithGoogle } from "../firebase";
import SleekConfirmModal from "./SleekConfirmModal";

interface KnowledgeRepoScreenProps {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: KnowledgeDocument) => void;
  onRemoveDocument: (id: string) => void;
  onClearDocuments?: () => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export default function KnowledgeRepoScreen({
  documents,
  onAddDocument,
  onRemoveDocument,
  onClearDocuments,
  onNavigate
}: KnowledgeRepoScreenProps) {
  // Navigation & General tabs
  const [tab, setTab] = useState<"local" | "drive" | "sources">("local");

  // Local Schema Creation
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Google Drive state
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<Array<{ id: string; name: string }>>([
    { id: "root", name: "Drive Root" }
  ]);
  const [selectedDriveFile, setSelectedDriveFile] = useState<any | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState("");
  
  // Create / Upload state
  const [isAddingDriveFile, setIsAddingDriveFile] = useState(false);
  const [newDriveFileName, setNewDriveFileName] = useState("");
  const [newDriveFileContent, setNewDriveFileContent] = useState("");
  const [uploadingToDrive, setUploadingToDrive] = useState(false);

  // Local to Drive export loader tracker
  const [exportingLocalId, setExportingLocalId] = useState<string | null>(null);

  // Operational Confirmation Dialogue State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    themeColor?: "cyan" | "red" | "gold";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Sync token from Firebase Auth core state
  useEffect(() => {
    const activeToken = getAccessToken();
    if (activeToken) {
      setDriveToken(activeToken);
    }
  }, []);

  // Fetch drive files when folder, token, or tab changes
  useEffect(() => {
    if (tab === "drive" && (driveToken || getAccessToken())) {
      fetchDriveFiles(currentFolderId, driveSearchQuery);
    }
  }, [tab, currentFolderId, driveToken]);

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const docObj: KnowledgeDocument = {
      id: "doc_" + Date.now().toString(),
      title: newTitle,
      content: newContent,
      timestamp: new Date().toLocaleDateString()
    };
    onAddDocument(docObj);
    setIsAdding(false);
    setNewTitle("");
    setNewContent("");
  };

  const handlePurgeAllDocuments = () => {
    if (!onClearDocuments) return;
    setConfirmConfig({
      isOpen: true,
      title: "CRITICAL ALERT: REPOSITORY PURGE DIRECTIVE",
      message: "WARNING: High-stakes memory wipe command initiated. You are about to clear all registered local core schemas and intelligence documents. This action completely sanitizes the core database matrix, is irreversible, and requires immediate total security clearance overlay.",
      confirmText: "CONFIRM PURGE",
      themeColor: "red",
      onConfirm: () => {
        onClearDocuments();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // FETCH GOOGLE DRIVE LIST
  const fetchDriveFiles = async (folderId: string = "root", search: string = "") => {
    const token = getAccessToken() || driveToken;
    if (!token) return;
    setDriveLoading(true);
    setDriveError(null);
    try {
      // Build Google Drive List Query
      let query = `'${folderId}' in parents and trashed = false`;
      if (search.trim()) {
        query += ` and name contains '${search.replace(/'/g, "\\'")}'`;
      }
      
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=100&q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,createdTime)&orderBy=folder,name`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setDriveToken(null);
          throw new Error("ACCESS_EXPIRED");
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Failed to load files from Google Drive.");
      }
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      if (err.message === "ACCESS_EXPIRED") {
        setDriveError("Google Session expired. Please re-authenticate below.");
      } else {
        setDriveError(err.message || "Drive synchronization failure.");
      }
    } finally {
      setDriveLoading(false);
    }
  };

  // VIEW / PREVIEW GOOGLE DRIVE FILE
  const inspectDriveFile = async (file: any) => {
    const token = getAccessToken() || driveToken;
    if (!token) return;
    setSelectedDriveFile(file);
    setSelectedFileContent(null);
    
    if (file.mimeType === "application/vnd.google-apps.folder") {
      // It's a folder, jump parent boundaries
      setFolderBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }]);
      setCurrentFolderId(file.id);
      setSelectedDriveFile(null);
      return;
    }

    setLoadingContent(true);
    try {
      let url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      if (file.mimeType.startsWith("application/vnd.google-apps.")) {
        if (file.mimeType === "application/vnd.google-apps.document") {
          url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
        } else if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
          url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/csv`;
        } else {
          setSelectedFileContent("[Hologram Warning: Restricted format. Direct readout disabled for this Google asset type. Click external link to inspect.]");
          setLoadingContent(false);
          return;
        }
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Unable to extract bytes stream.");
      }
      const contentText = await res.text();
      setSelectedFileContent(contentText);
    } catch (err: any) {
      setSelectedFileContent(`[Decryption Error: ${err.message || "Binary readout unsupported."}]`);
    } finally {
      setLoadingContent(false);
    }
  };

  // UPLOAD OR CREATE TXT FILE ON GOOGLE DRIVE
  const handleUploadToDrive = async () => {
    const token = getAccessToken() || driveToken;
    if (!token) return;
    if (!newDriveFileName.trim() || !newDriveFileContent.trim()) return;
    setUploadingToDrive(true);
    try {
      const filename = newDriveFileName.endsWith(".txt") ? newDriveFileName : `${newDriveFileName}.txt`;
      const metadata = {
        name: filename,
        mimeType: "text/plain",
        parents: currentFolderId !== "root" ? [currentFolderId] : []
      };
      
      const boundary = "jarvis_upload_boundary";
      const multipartBody = 
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `\r\n--${boundary}\r\n` +
        `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
        `${newDriveFileContent}\r\n` +
        `\r\n--${boundary}--`;

      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!res.ok) {
        throw new Error("Endpoint returned invalid code.");
      }
      
      fetchDriveFiles(currentFolderId, driveSearchQuery);
      setIsAddingDriveFile(false);
      setNewDriveFileName("");
      setNewDriveFileContent("");
    } catch (err: any) {
      alert("Hologram Upload Failed: " + err.message);
    } finally {
      setUploadingToDrive(false);
    }
  };

  // DELETE DRIVE FILE (WITH EXPLICIT REQUIREMENT FOR MANDATORY SYSTEM DIALOGUE SECURING DATA)
  const handleDeleteDriveFile = async (fileId: string, fileName: string) => {
    const token = getAccessToken() || driveToken;
    if (!token) return;
    
    setConfirmConfig({
      isOpen: true,
      title: "JARVIS DRIVE PURGE DIALOGUE",
      message: `Are you absolutely sure you want to permanently delete '${fileName}' from your Google Drive? This operation is irreversible.`,
      themeColor: "red",
      confirmText: "DELETE PERMANENTLY",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setDriveLoading(true);
        setDriveError(null);
        try {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            throw new Error("Authorization insufficient or file was deleted elsewhere.");
          }
          fetchDriveFiles(currentFolderId, driveSearchQuery);
          if (selectedDriveFile?.id === fileId) {
            setSelectedDriveFile(null);
          }
        } catch (err: any) {
          setDriveError("Hologram Elimination Failed: " + err.message);
        } finally {
          setDriveLoading(false);
        }
      }
    });
  };

  // INGEST VIEWED DRIVE CONTENT TO JARVIS CORE MEMORY (LOCAL REPO)
  const handleIngestToCoreMemory = () => {
    if (!selectedDriveFile || !selectedFileContent) return;
    const cleanTitle = selectedDriveFile.name.replace(/\.[^/.]+$/, ""); // strip extension
    const docObj: KnowledgeDocument = {
      id: "doc_" + Date.now().toString(),
      title: `Drive: ${cleanTitle}`,
      content: selectedFileContent,
      timestamp: new Date().toLocaleDateString()
    };
    onAddDocument(docObj);
    alert(`Success: Ingested '${cleanTitle}' directly into JARVIS Neural Memory.`);
    setSelectedDriveFile(null);
  };

  // BIDIRECTIONAL: EXPORT LOCAL KNOWLEDGE SCHEMA TO GOOGLE DRIVE
  const handleExportLocalToDrive = async (docObj: KnowledgeDocument) => {
    const token = getAccessToken() || driveToken;
    if (!token) {
      alert("Access sequence required. Please navigate to the Google Drive Sync tab to authorize and sync.");
      setTab("drive");
      return;
    }
    setExportingLocalId(docObj.id);
    try {
      const metadata = {
        name: `${docObj.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_schema.txt`,
        mimeType: "text/plain"
      };
      const boundary = "jarvis_export_local_boundary";
      const multipartBody = 
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `\r\n--${boundary}\r\n` +
        `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
        `--- JARVIS NEURAL CONSOLE MEMORY SCHEMA ---\n` +
        `Title: ${docObj.title}\n` +
        `System Signature Status: ACTIVE\n` +
        `Local Storage Sync Date: ${docObj.timestamp}\n` +
        `============================================\n\n` +
        `${docObj.content}\n` +
        `\r\n--${boundary}--`;

      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!res.ok) {
        throw new Error("Failed to deploy stream.");
      }
      
      alert(`Success: Core schematic '${metadata.name}' exported to Google Drive Root!`);
    } catch (err: any) {
      alert("Neural export failed: " + err.message);
    } finally {
      setExportingLocalId(null);
    }
  };

  // Navigating back up one parent boundary
  const handleBreadcrumbClick = (id: string, index: number) => {
    setCurrentFolderId(id);
    setFolderBreadcrumbs(prev => prev.slice(0, index + 1));
    setSelectedDriveFile(null);
  };

  // Filtering local schemas
  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-black text-[#e2e2e2]"
    >
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md relative z-10 shrink-0">
        <button
          onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
          className="p-2 mr-2 rounded-full hover:bg-white/10 text-cyan-400 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold font-mono tracking-widest text-cyan-400">JARVIS INTELLIGENCE HUB</h2>
          <p className="text-[10px] text-gray-500 font-mono">Index system schemas & workspace assets</p>
        </div>
        {tab === "local" ? (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 rounded-full bg-cyan-950/60 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/30 transition-all cursor-pointer"
          >
            <Plus className={`w-4 h-4 transition-transform ${isAdding ? "rotate-45" : ""}`} />
          </button>
        ) : (
          (driveToken || getAccessToken()) && (
            <button
              onClick={() => setIsAddingDriveFile(!isAddingDriveFile)}
              className="p-2 rounded-full bg-cyan-950/60 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/30 transition-all cursor-pointer"
            >
              <UploadCloud className={`w-4 h-4 transition-transform ${isAddingDriveFile ? "scale-90 opacity-70" : ""}`} />
            </button>
          )
        )}
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/5 bg-zinc-950/60 sticky top-0 z-20 shrink-0">
        <button
          onClick={() => setTab("local")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all ${tab === "local" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
        >
          Core Memories
        </button>
        <button
          onClick={() => setTab("sources")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${tab === "sources" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Verification Core
        </button>
        <button
          onClick={() => setTab("drive")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${tab === "drive" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          Google Drive Sync
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative z-0 p-4">
        {/* Decorative background */}
        <div className="absolute inset-x-0 -top-40 h-80 bg-cyan-900/5 blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6">

          {/* TAB 1: LOCAL CORE MEMORIES */}
          {tab === "local" && (
            <>
              {/* Add Schema Form */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-zinc-900 border border-cyan-400/20 rounded-xl space-y-4 mb-6">
                      <h3 className="font-mono text-cyan-400 text-xs font-bold uppercase">Index New Local Schema</h3>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Document Title (e.g. Arc Reconfiguration Limits)"
                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none placeholder-gray-600"
                      />
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Neural Content Data..."
                        className="w-full h-32 px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none placeholder-gray-600 resize-none font-mono"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAdding(false)}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 text-gray-400 hover:bg-zinc-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreate}
                          disabled={!newTitle.trim() || !newContent.trim()}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          Save to Core
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search & Actions Bar */}
              <div className="flex gap-2.5 items-center">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Scan memory banks..."
                    className="w-full pl-9 pr-4 py-3 bg-zinc-900 border border-cyan-400/20 rounded-xl text-sm focus:border-cyan-400 focus:outline-none transition-all placeholder-cyan-900/50"
                  />
                </div>
                {documents.length > 0 && onClearDocuments && (
                  <button
                    type="button"
                    onClick={handlePurgeAllDocuments}
                    className="h-11 px-4 rounded-xl bg-red-950/45 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] text-[10px] font-mono font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Purge all system schemas permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>PURGE POOL</span>
                  </button>
                )}
              </div>

              {/* Local List */}
              <div className="space-y-3">
                {filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                    <ShieldAlert className="w-8 h-8 text-cyan-900 mb-3" />
                    <p className="text-gray-500 font-mono text-sm">No local schemas registered in holographic bank.</p>
                  </div>
                ) : (
                  filteredDocs.map((docObj) => (
                    <div key={docObj.id} className="p-4 bg-zinc-950 border border-white/5 rounded-xl hover:border-cyan-400/30 transition-all group overflow-hidden relative">
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <FileText className="w-4 h-4" />
                          <h4 className="font-bold text-sm tracking-tight">{docObj.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={exportingLocalId === docObj.id}
                            onClick={() => handleExportLocalToDrive(docObj)}
                            className="text-[10px] font-mono font-bold tracking-wider px-2 py-1 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded transition-all cursor-pointer flex items-center gap-1"
                            title="Export to Google Drive"
                          >
                            <UploadCloud className="w-3 h-3" />
                            <span>{exportingLocalId === docObj.id ? "SYNCING..." : "DEPLOY"}</span>
                          </button>
                          <button
                            onClick={() => onRemoveDocument(docObj.id)}
                            className="p-1.5 rounded bg-red-950/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-mono line-clamp-3 relative z-10 leading-relaxed">
                        {docObj.content}
                      </p>
                      <div className="mt-4 text-[9px] text-cyan-900 font-mono uppercase tracking-widest relative z-10">
                        Indexed: {docObj.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* TAB 2: GOOGLE DRIVE ONLINE SYNCHRONIZER */}
          {tab === "drive" && (
            <>
              {/* Auth Checker segment */}
              {!driveToken && !getAccessToken() ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-cyan-950/40 border border-cyan-400/30 flex items-center justify-center text-cyan-400 animate-pulse">
                    <HardDrive className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-widest">DRIVE PROTOCOL SYSTEM DECOY</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-mono">
                      Authorize Google Drive scopes below. This links JARVIS dynamically to your sheets, documents, and assets, enabling real-time schematic synchronization with permission.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const result = await signInWithGoogle();
                        const token = getAccessToken();
                        if (token) {
                          setDriveToken(token);
                        }
                      } catch (err) {
                        alert("Google authorization sequence bypassed or failed.");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-zinc-100 text-black rounded-xl transition-all font-sans font-bold shadow-2xl active:scale-95 cursor-pointer border border-white/20"
                  >
                    <svg className="w-5 h-5 shrink-0" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    <span className="font-mono text-xs tracking-wider uppercase">Authorize drive link</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Google Drive Breadcrumbs / Folder Nav */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 px-3 bg-zinc-950 border border-white/5 rounded-xl text-xs font-mono">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                    {folderBreadcrumbs.map((crumb, idx) => (
                      <div key={crumb.id} className="flex items-center gap-1">
                        <button
                          onClick={() => handleBreadcrumbClick(crumb.id, idx)}
                          className={`hover:text-cyan-400 font-bold max-w-[120px] truncate cursor-pointer ${idx === folderBreadcrumbs.length - 1 ? "text-cyan-400" : "text-gray-500"}`}
                        >
                          {crumb.name}
                        </button>
                        {idx < folderBreadcrumbs.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-gray-700" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Create / Upload form on Drive */}
                  <AnimatePresence>
                    {isAddingDriveFile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-zinc-900 border border-cyan-400/20 rounded-xl space-y-4 mb-2">
                          <h3 className="font-mono text-cyan-400 text-xs font-bold uppercase flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 animate-bounce" />
                            DEPLOY NEW SCHEMATIC TO DRIVE
                          </h3>
                          <input
                            type="text"
                            value={newDriveFileName}
                            onChange={(e) => setNewDriveFileName(e.target.value)}
                            placeholder="File Name (e.g. thruster_calibration)"
                            className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none placeholder-gray-600"
                          />
                          <textarea
                            value={newDriveFileContent}
                            onChange={(e) => setNewDriveFileContent(e.target.value)}
                            placeholder="Write schematic payload bytes..."
                            className="w-full h-32 px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:border-cyan-400 focus:outline-none placeholder-gray-600 resize-none font-mono"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setIsAddingDriveFile(false);
                                setNewDriveFileName("");
                                setNewDriveFileContent("");
                              }}
                              className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-800 text-gray-400 hover:bg-zinc-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleUploadToDrive}
                              disabled={uploadingToDrive || !newDriveFileName.trim() || !newDriveFileContent.trim()}
                              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                              {uploadingToDrive ? "Uploading..." : "Upload to Cloud"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Search and refresh */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                      <input
                        type="text"
                        value={driveSearchQuery}
                        onChange={(e) => setDriveSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            fetchDriveFiles(currentFolderId, driveSearchQuery);
                          }
                        }}
                        placeholder="Type and press Enter to search remote assets..."
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-cyan-400/20 rounded-xl text-xs font-mono focus:border-cyan-400 focus:outline-none placeholder-cyan-900/50 text-white"
                      />
                    </div>
                    <button
                      onClick={() => fetchDriveFiles(currentFolderId, driveSearchQuery)}
                      disabled={driveLoading}
                      className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-gray-400 hover:text-cyan-400 rounded-xl transition-all cursor-pointer active:scale-95 text-xs font-mono font-bold flex items-center justify-center"
                    >
                      Ref
                    </button>
                  </div>

                  {/* Drive Files Grid */}
                  <div className="space-y-2">
                    {driveLoading ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-8 h-8 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3" />
                        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">Consulting cloud files...</span>
                      </div>
                    ) : driveError ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center border border-pink-950/20 bg-pink-950/10 rounded-xl p-4">
                        <ShieldAlert className="w-8 h-8 text-pink-500 mb-2 animate-bounce" />
                        <p className="text-xs font-mono font-bold text-gray-400">{driveError}</p>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                        <Folder className="w-8 h-8 text-cyan-900 mb-2" />
                        <p className="text-gray-500 font-mono text-xs">No remote schematic folders found inside parent container.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 divide-y divide-white/5 border border-white/5 bg-zinc-950/40 rounded-xl overflow-hidden">
                        {driveFiles.map((file) => {
                          const isFolder = file.mimeType === "application/vnd.google-apps.folder";
                          return (
                            <div 
                              key={file.id} 
                              onClick={() => inspectDriveFile(file)}
                              className="flex items-center justify-between p-3.5 hover:bg-zinc-900/40 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                {isFolder ? (
                                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono font-bold text-gray-300 truncate group-hover:text-cyan-400 transition-colors">
                                    {file.name}
                                  </p>
                                  <p className="text-[10px] font-mono text-gray-600 truncate mt-0.5">
                                    {isFolder ? "Folder Storage Object" : `${file.mimeType.split("/").pop()?.toUpperCase()} • ${(file.size ? (Number(file.size) / 1024).toFixed(1) + " KB" : "Unknown size")}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleDeleteDriveFile(file.id, file.name)}
                                  className="p-1.5 rounded hover:bg-red-950/20 text-gray-600 hover:text-red-500 group-hover:opacity-100 opacity-60 transition-all cursor-pointer"
                                  title="Delete drive file"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 3: TRUSTED MULTI-SOURCE VERIFICATION LAYER */}
          {tab === "sources" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Uplink Telemetry Status Card */}
              <div className="p-5 bg-zinc-950 border border-cyan-400/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-950/15 blur-3xl pointer-events-none" />
                <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-4">
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 text-[9px] font-mono uppercase tracking-widest font-semibold rounded-full inline-flex items-center gap-1">
                      <Wifi className="w-3 h-3 animate-pulse text-cyan-400" />
                      Satellite Link Active
                    </span>
                    <h3 className="text-base font-bold font-mono text-white tracking-widest uppercase">
                      GROUND GROUNDING SYSTEM UPLINK
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-xl font-sans font-light">
                      JARVIS is plugged directly into high-fidelity news portals, knowledge databases, and orbital telemetry engines. Search tools are dynamically bound to Gemini-2.0-Flash-Exp for live information extraction.
                    </p>
                  </div>
                  
                  {/* Digital Meter */}
                  <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/5 font-mono text-[10px] space-y-1.5 shrink-0 w-full sm:w-auto">
                    <p className="flex justify-between gap-6 text-gray-500">Latency: <span className="text-cyan-400 font-bold">42 ms</span></p>
                    <p className="flex justify-between gap-6 text-gray-500">Port link: <span className="text-cyan-400">Dynamic</span></p>
                    <p className="flex justify-between gap-6 text-gray-500">Search model: <span className="text-yellow-500 font-bold">2.0-Flash-Exp</span></p>
                    <p className="flex justify-between gap-6 text-gray-500">Retrieval: <span className="text-emerald-400 font-bold">RAG Mode</span></p>
                  </div>
                </div>
              </div>

              {/* Trusted Knowledge Sources Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                    Trusted Knowledge Sources
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source 1: Wikiquote */}
                  <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-cyan-400/20 transition-all flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-white uppercase">Wikiquote Main Page</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase">Quotes & Sayings</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                        Historical attributions, famous proverbs, verified sayings, and contextual literary fragments checked via a multi-language attribution corpus.
                      </p>
                    </div>
                    <a
                      href="https://en.wikiquote.org/wiki/Main_Page"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-gray-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-colors border border-white/5 w-full cursor-pointer"
                    >
                      <span>en.wikiquote.org</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Source 2: Reuters */}
                  <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-cyan-400/20 transition-all flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-white uppercase">Reuters</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase">Global Wire Feed</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                        Real-time planetary affairs, legal adjustments, macroeconomic news streams, international treaties, and high-frequency factual global events.
                      </p>
                    </div>
                    <a
                      href="https://www.reuters.com/?utm_source=chatgpt.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-gray-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-colors border border-white/5 w-full cursor-pointer"
                    >
                      <span>reuters.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Source 3: NASA */}
                  <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-cyan-400/20 transition-all flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-white uppercase">NASA Ground Station</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase">Space Explorations</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                        Deep-space astrophysic operations, Perseverance rover telemetry coordinates, Artemis flight parameters, and rocket propulsion mission status values.
                      </p>
                    </div>
                    <a
                      href="https://www.nasa.gov/?utm_source=chatgpt.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-gray-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-colors border border-white/5 w-full cursor-pointer"
                    >
                      <span>nasa.gov</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Source 4: ESA */}
                  <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-cyan-400/20 transition-all flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-white uppercase">ESA Operations</span>
                        <span className="text-[9px] font-mono text-gray-600 uppercase">Cosmos Telemetry</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                        European space exploration frameworks, spacecraft sensor readouts, Jovian exploration parameters, and international orbit synchronization schedules.
                      </p>
                    </div>
                    <a
                      href="https://www.esa.int/?utm_source=chatgpt.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-gray-300 hover:text-cyan-400 rounded-lg text-xs font-mono font-bold flex items-center justify-between transition-colors border border-white/5 w-full cursor-pointer"
                    >
                      <span>esa.int</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Verification & RAG Engine Protocol Stack */}
              <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                    Verification Rule Configuration
                  </h4>
                </div>
                
                <div className="divide-y divide-white/5 font-mono text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-400">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-400/50" />
                      Multi-Source Cross Reference Engine
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 text-[9px] border border-emerald-500/20 rounded font-bold">
                      ENABLED (HARDWARE ENFORCED)
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-400">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-400/50" />
                      Dynamic Contradiction & Bias Filter
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 text-[9px] border border-emerald-500/20 rounded font-bold">
                      ENABLED (AUTO-TUNED)
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-400">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-400/50" />
                      Citations & Web Attributions Index mapping
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 text-[9px] border border-emerald-500/20 rounded font-bold">
                      APPEND CONSOLE MODE
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-400">
                      <CornerDownRight className="w-3.5 h-3.5 text-cyan-400/50" />
                      Offline Heuristic Backup Sandbox Mode
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 text-[9px] border border-emerald-500/20 rounded font-bold">
                      READY (AUTO-ROLLOVER)
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-950/20 border border-amber-500/15 rounded-xl flex gap-2 items-start mt-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-amber-200/80 font-sans">
                    <strong>Integrity Warning</strong>: If validation channels fail to return a verified factual proof within the maximum token thinking threshold, JARVIS will output a fail-safe offline fallback warning and cite existing non-outdated records representing training boundaries.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* File Inspector Sheet/Overlay (Live Readout) */}
      <AnimatePresence>
        {selectedDriveFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-end justify-center p-4 md:items-center"
            onClick={() => setSelectedDriveFile(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-950 border border-cyan-400/20 rounded-2xl overflow-hidden p-5 flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Overlay Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950/40 rounded-full inline-block mb-1">
                    LIVE INSPECT DECODING
                  </span>
                  <h3 className="text-sm font-bold font-mono text-white truncate pr-4">
                    {selectedDriveFile.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDriveFile(null)}
                  className="px-2 py-1 bg-zinc-900 border border-white/10 hover:border-cyan-400/40 rounded-lg text-xs leading-none cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Readout stats */}
              <div className="grid grid-cols-2 gap-2 py-3 bg-zinc-900/30 px-3 rounded-xl border border-white/5 my-3 text-[10px] font-mono text-gray-500 shrink-0">
                <p className="truncate">ID: <span className="text-gray-300">{selectedDriveFile.id}</span></p>
                <p className="truncate">FORMAT: <span className="text-gray-300">{selectedDriveFile.mimeType.split("/").pop()?.toUpperCase()}</span></p>
                <p className="truncate">CREATED: <span className="text-gray-300">{new Date(selectedDriveFile.createdTime || Date.now()).toLocaleDateString()}</span></p>
                <p className="truncate">MODIFIED: <span className="text-gray-300">{new Date(selectedDriveFile.modifiedTime || Date.now()).toLocaleDateString()}</span></p>
              </div>

              {/* Dynamic Content Readout window */}
              <div className="flex-1 bg-black rounded-lg border border-white/10 p-4 font-mono text-xs overflow-y-auto max-h-[40vh] relative min-h-[140px]">
                {loadingContent ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-r-transparent rounded-full animate-spin mb-2" />
                    <span className="text-[10px] text-cyan-500 tracking-wider">DECRYPTING PAYLOAD DATA...</span>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap leading-relaxed text-cyan-300 break-all select-text selection:bg-cyan-800">
                    {selectedFileContent || "No contents fetched."}
                  </pre>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3 shrink-0 gap-3">
                <a
                  href={`https://drive.google.com/open?id=${selectedDriveFile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-gray-400 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all text-center shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Drive Asset</span>
                </a>
                
                {selectedFileContent && !selectedFileContent.startsWith("[") && (
                  <button
                    onClick={handleIngestToCoreMemory}
                    className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-400/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-black animate-spin-slow" />
                    <span>INGEST SYSTEM CORE</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Operational Confirmation Dialogue */}
      <SleekConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        themeColor={confirmConfig.themeColor}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}
