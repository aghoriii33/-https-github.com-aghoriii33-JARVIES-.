import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Mail,
  Calendar,
  CheckSquare,
  Lock,
  Plus,
  Trash2,
  Send,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  Grid,
  Check,
  MapPin,
  FileText,
  User
} from "lucide-react";
import { ActiveScreen } from "../types";
import { getAccessToken, signInWithGoogle } from "../firebase";

interface WorkspaceScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  key?: string;
}

export default function WorkspaceScreen({ onNavigate }: WorkspaceScreenProps) {
  const [activeTab, setActiveTab] = useState<"gmail" | "calendar" | "tasks">("gmail");
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMess, setErrorMess] = useState<string | null>(null);

  // Gmail Data State
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [selectedEmailBody, setSelectedEmailBody] = useState<string | null>(null);
  const [gmailSearch, setGmailSearch] = useState("");
  // Compose Email Modal
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // Calendar Data State
  const [events, setEvents] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventSummary, setEventSummary] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndTime, setEventEndTime] = useState("11:00");

  // Tasks Data State
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Retrieve auth token on load
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Fetch corresponding data when tab/list changes or auth happens
  useEffect(() => {
    if (authToken) {
      if (activeTab === "gmail") {
        fetchEmails();
      } else if (activeTab === "calendar") {
        fetchEvents();
      } else if (activeTab === "tasks") {
        fetchTaskLists();
      }
    }
  }, [activeTab, authToken]);

  useEffect(() => {
    if (authToken && selectedListId && activeTab === "tasks") {
      fetchTasks(selectedListId);
    }
  }, [selectedListId]);

  // LOGIN FLOW GOOGLE
  const handleConnect = async () => {
    try {
      await signInWithGoogle();
      const token = getAccessToken();
      if (token) {
        setAuthToken(token);
        setErrorMess(null);
      }
    } catch (err: any) {
      setErrorMess("Connection failed. Please retry connection.");
    }
  };

  // --- GMAIL SERVICES ---
  const fetchEmails = async () => {
    if (!authToken) return;
    setLoading(true);
    setErrorMess(null);
    try {
      let url = "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12";
      if (gmailSearch.trim()) {
        url += `&q=${encodeURIComponent(gmailSearch)}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthToken(null);
          throw new Error("Google access token expired. Re-auth required.");
        }
        throw new Error("Failed to scan tactical mailbox.");
      }
      const data = await res.json();
      const msgs = data.messages || [];

      // Fetch batch headers for each email outline
      const outlined = await Promise.all(
        msgs.map(async (msg: any) => {
          try {
            const detailRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (!detailRes.ok) return { id: msg.id, snippet: "Brief header download error" };
            const detailData = await detailRes.json();
            const headers = detailData.payload?.headers || [];
            const subject = headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)";
            const from = headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
            const date = headers.find((h: any) => h.name === "Date")?.value || "";
            return {
              id: msg.id,
              snippet: detailData.snippet || "",
              subject,
              from,
              date: new Date(date).toLocaleDateString([], { month: "short", day: "numeric" }),
              internalDate: detailData.internalDate
            };
          } catch {
            return { id: msg.id, snippet: "Decryption error", subject: "Failed load", from: "Security Boundary" };
          }
        })
      );
      setEmails(outlined.sort((a: any, b: any) => Number(b.internalDate || 0) - Number(a.internalDate || 0)));
    } catch (e: any) {
      setErrorMess(e.message || "Failed to load mail client.");
    } finally {
      setLoading(false);
    }
  };

  const inspectEmail = async (msg: any) => {
    if (!authToken) return;
    setSelectedEmail(msg);
    setSelectedEmailBody(null);
    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error("Decryption payload request rejected.");
      const data = await res.json();
      
      // Parse payload body
      let bodyText = "";
      const payload = data.payload;
      
      const decodeBody = (dataStr: string) => {
        try {
          const base64 = dataStr.replace(/-/g, "+").replace(/_/g, "/");
          return decodeURIComponent(
            escape(atob(base64))
          );
        } catch {
          return "Binary readout format unmapped.";
        }
      };

      if (payload?.body?.data) {
        bodyText = decodeBody(payload.body.data);
      } else if (payload?.parts) {
        // Try simple traversal to find text/plain
        const textPart = payload.parts.find((p: any) => p.mimeType === "text/plain");
        const htmlPart = payload.parts.find((p: any) => p.mimeType === "text/html");
        
        if (textPart?.body?.data) {
          bodyText = decodeBody(textPart.body.data);
        } else if (htmlPart?.body?.data) {
          bodyText = decodeBody(htmlPart.body.data).replace(/<[^>]*>/g, " "); // Strip simple HTML
        } else {
          bodyText = data.snippet || "Vocal payload summary unlocked.";
        }
      } else {
        bodyText = data.snippet || "Tactical message contains no body text stream.";
      }

      setSelectedEmailBody(bodyText);
    } catch (err: any) {
      setSelectedEmailBody(`[Tactical Decryption Error: ${err.message}]`);
    }
  };

  const handleSendEmail = async () => {
    if (!authToken || !composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;
    setActionLoading(true);
    try {
      const emailContent = `To: ${composeTo}\r\nSubject: ${composeSubject}\r\n\r\n${composeBody}`;
      const raw = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
      });

      if (!res.ok) throw new Error("Mail submission refused by Google SMTP interface.");
      alert("Success: Tactical email dispatched safely by JARVIS.");
      setShowCompose(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      fetchEmails();
    } catch (e: any) {
      alert("Failed dispatch: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- GOOGLE CALENDAR SERVICES ---
  const fetchEvents = async () => {
    if (!authToken) return;
    setLoading(true);
    setErrorMess(null);
    try {
      const timeMin = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${timeMin}&maxResults=15`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!res.ok) {
        if (res.status === 401) {
          setAuthToken(null);
          throw new Error("Session expired. Connect again.");
        }
        throw new Error("Tactical navigation coordinate sync failed.");
      }
      const data = await res.json();
      setEvents(data.items || []);
    } catch (e: any) {
      setErrorMess(e.message || "Failed to load Google Calendar events.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!authToken || !eventSummary.trim() || !eventDate) return;
    setActionLoading(true);
    try {
      const startDateTime = `${eventDate}T${eventStartTime}:00`;
      const endDateTime = `${eventDate}T${eventEndTime}:00`;

      const reqBody = {
        summary: eventSummary,
        description: eventDesc || "JARVIS Console-generated event log.",
        start: {
          dateTime: new Date(startDateTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: new Date(endDateTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) throw new Error("Failed to deploy calendar log.");
      alert("Success: Logged in primary calendar sync registry.");
      setShowEventModal(false);
      setEventSummary("");
      setEventDesc("");
      setEventDate("");
      fetchEvents();
    } catch (e: any) {
      alert("Calendar registration failure: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, summary: string) => {
    if (!authToken) return;
    const confirmed = window.confirm(`JARVIS: Are you absolutely sure you want to remove '${summary}' from your Google Calendar schedule?`);
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error("Event elimination disapproved by server.");
      fetchEvents();
    } catch (e: any) {
      alert("Failed removal: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- GOOGLE TASKS SERVICES ---
  const fetchTaskLists = async () => {
    if (!authToken) return;
    setLoading(true);
    setErrorMess(null);
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthToken(null);
          throw new Error("Tactical channel closed relative to security expiry.");
        }
        throw new Error("Tasks indexing protocols failed.");
      }
      const data = await res.json();
      const lists = data.items || [];
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (e: any) {
      setErrorMess(e.message || "Failed to catalog user task boards.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (listId: string) => {
    if (!authToken) return;
    setLoading(true);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error("Could not index tasks list contents.");
      const data = await res.json();
      setTasks(data.items || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskList = async () => {
    if (!authToken || !newListName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newListName })
      });
      if (!res.ok) throw new Error("Server disapproved board authorization.");
      const newList = await res.json();
      alert(`Success: Board '${newListName}' created!`);
      setNewListName("");
      setShowListModal(false);
      fetchTaskLists().then(() => {
        setSelectedListId(newList.id);
      });
    } catch (e: any) {
      alert("List deployment mistake: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!authToken || !newTaskTitle.trim() || !selectedListId) return;
    setActionLoading(true);
    try {
      const payload: any = {
        title: newTaskTitle,
        notes: newTaskNotes || "Deployed via JARVIS Neural Core."
      };
      if (newTaskDue) {
        payload.due = new Date(newTaskDue).toISOString();
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Endpoint rejected scheduled task index.");
      setNewTaskTitle("");
      setNewTaskNotes("");
      setNewTaskDue("");
      setShowAddTask(false);
      fetchTasks(selectedListId);
    } catch (e: any) {
      alert("Core task injection mismatch: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTaskStatus = async (task: any) => {
    if (!authToken || !selectedListId) return;
    const isCompleted = task.status === "completed";
    const nextStatus = isCompleted ? "needsAction" : "completed";
    
    // Optimistic local state update helper
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error("Could not propagate task state update.");
      fetchTasks(selectedListId);
    } catch (e: any) {
      alert("Task completion parity update failed: " + e.message);
      fetchTasks(selectedListId);
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!authToken || !selectedListId) return;
    const confirmed = window.confirm(`JARVIS: Purge '${title}' completely from list memory?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error("Could not clear task structure.");
      fetchTasks(selectedListId);
    } catch (e: any) {
      alert("Clear error: " + e.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-black text-[#e2e2e2]"
    >
      {/* HUD Header */}
      <header className="flex items-center px-4 py-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md relative z-10 shrink-0">
        <button
          onClick={() => onNavigate(ActiveScreen.DASHBOARD)}
          className="p-2 mr-2 rounded-full hover:bg-white/10 text-cyan-400 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold font-mono tracking-widest text-cyan-400">JARVIS WORKSPACE COCKPIT</h2>
          <p className="text-[10px] text-gray-500 font-mono">Synced Google Workspace Integrations</p>
        </div>
        {authToken && (
          <button
            onClick={() => {
              if (activeTab === "gmail") fetchEmails();
              else if (activeTab === "calendar") fetchEvents();
              else if (activeTab === "tasks" && selectedListId) fetchTasks(selectedListId);
            }}
            disabled={loading}
            className="p-2 rounded-full text-cyan-400 hover:bg-zinc-800 transition-colors"
            title="Reload Workspace Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </header>

      {/* Synchronizer Sub-tabs */}
      <div className="flex border-b border-white/5 bg-zinc-950/60 sticky top-0 z-20 shrink-0">
        <button
          onClick={() => setActiveTab("gmail")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === "gmail" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/25" : "text-gray-500 hover:text-white"}`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Tactical Mail</span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === "calendar" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/25" : "text-gray-500 hover:text-white"}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeTab === "tasks" ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/25" : "text-gray-500 hover:text-white"}`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks List</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto relative p-4 z-0">
        <div className="absolute inset-x-0 -top-40 h-80 bg-cyan-950/15 blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6">

          {/* NO GOOGLE TOKEN DISPLAY */}
          {!authToken ? (
            <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-cyan-400/30 flex items-center justify-center text-cyan-400 animate-pulse">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-widest">WORKSPACE LOCKED</h3>
                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  Authenticate your Google account. This securely exposes your tactical scheduled logs, pending tasks, and task list components inside JARVIS core dashboards.
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="w-full py-3 bg-white hover:bg-zinc-100 text-black rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Connect Workspace Accounts
              </button>
            </div>
          ) : (
            <>
              {errorMess && (
                <div className="p-3 bg-pink-950/40 border border-pink-500/30 rounded-xl flex items-center gap-3 text-xs font-mono text-pink-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMess}</span>
                </div>
              )}

              {/* ------ TAB 1: GMAIL SYSTEM CONTROLS ------ */}
              {activeTab === "gmail" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400/80">TACTICAL COMMUNICATIONS BANK</h3>
                    <button
                      onClick={() => setShowCompose(true)}
                      className="px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Draft Message</span>
                    </button>
                  </div>

                  {/* Gmail Mail Filter Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                    <input
                      type="text"
                      value={gmailSearch}
                      onChange={(e) => setGmailSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") fetchEmails();
                      }}
                      placeholder="Type query + enter to scan inbox items..."
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-xs focus:border-cyan-400 focus:outline-none placeholder-gray-600 font-mono text-white"
                    />
                  </div>

                  {/* Emails List */}
                  {loading && emails.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-r-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Decryption query dispatched...</span>
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-zinc-950/30">
                      <Mail className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                      <p className="text-xs font-mono text-gray-500">No communication streams indexed inside this quadrant.</p>
                    </div>
                  ) : (
                    <div className="border border-white/5 rounded-xl bg-zinc-950/40 overflow-hidden divide-y divide-white/5">
                      {emails.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => inspectEmail(e)}
                          className="p-3.5 hover:bg-zinc-900/30 transition-all cursor-pointer flex justify-between items-start gap-4 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-cyan-400 truncate max-w-[130px]">{e.from}</span>
                              <span className="text-[9px] font-mono text-gray-600 shrink-0">{e.date}</span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-cyan-300 transition-colors">{e.subject}</h4>
                            <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5">{e.snippet}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all mt-1" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ------ TAB 2: CALENDAR SCHEDULER SYSTEM ------ */}
              {activeTab === "calendar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400/80">MISSION TIMELINE CHRONOLOGY</h3>
                    <button
                      onClick={() => setShowEventModal(true)}
                      className="px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Coordinator</span>
                    </button>
                  </div>

                  {loading && events.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-r-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Syncing orbital clock vectors...</span>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-zinc-950/30">
                      <Calendar className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                      <p className="text-xs font-mono text-gray-500">No scheduled events logged inside the primary chronology loop.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((evt) => {
                        const start = new Date(evt.start?.dateTime || evt.start?.date);
                        const isAllDay = !evt.start?.dateTime;
                        return (
                          <div
                            key={evt.id}
                            className="p-4 bg-zinc-950 border border-white/5 rounded-xl flex justify-between items-start gap-4 hover:border-cyan-500/20 group transition-all"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-cyan-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                                  {!isAllDay && ` @ ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                                  {isAllDay && " (ALL DAY)"}
                                </span>
                              </div>
                              <h4 className="text-xs font-sans font-bold text-white tracking-tight">{evt.summary}</h4>
                              {evt.description && (
                                <p className="text-[10px] text-gray-500 font-mono mt-1 line-clamp-2 leading-relaxed">{evt.description}</p>
                              )}
                              {evt.location && (
                                <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-500 font-mono">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{evt.location}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteEvent(evt.id, evt.summary)}
                              className="p-1.5 rounded text-gray-700 hover:text-red-400 hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                              title="Delete event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ------ TAB 3: TASKS REGISTRY HUD ------ */}
              {activeTab === "tasks" && (
                <div className="space-y-4">
                  {/* Selector of Board */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-widest shrink-0">Quadrant:</span>
                      <select
                        value={selectedListId}
                        onChange={(e) => setSelectedListId(e.target.value)}
                        className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-400 select-none cursor-pointer focus:outline-none"
                      >
                        {taskLists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.title.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowListModal(true)}
                        className="p-1.5 rounded-lg border border-white/10 text-cyan-500 hover:border-cyan-400/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center cursor-pointer"
                        title="Create New List Category"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowAddTask(true)}
                        className="px-3 py-1.5 bg-cyan-950 text-cyan-400 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Task</span>
                      </button>
                    </div>
                  </div>

                  {/* Tasks inside current board */}
                  {loading && tasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-r-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Traversing pending matrix...</span>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-zinc-950/30">
                      <CheckSquare className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                      <p className="text-xs font-mono text-gray-500">Board has no logged deliverables currently mapping.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {tasks.map((tsk) => {
                        const isCompleted = tsk.status === "completed";
                        return (
                          <div
                            key={tsk.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 group relative ${isCompleted ? "bg-zinc-950/10 border-white/5 opacity-60" : "bg-zinc-950 border-white/5 hover:border-cyan-400/20"}`}
                          >
                            <button
                              onClick={() => handleToggleTaskStatus(tsk)}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${isCompleted ? "bg-cyan-500 border-cyan-400 text-black" : "border-white/30 hover:border-cyan-400"}`}
                            >
                              {isCompleted && <Check className="w-3 h-3 text-black stroke-[3]" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs font-sans font-bold tracking-tight text-white ${isCompleted ? "line-through text-gray-600" : ""}`}>
                                {tsk.title}
                              </h4>
                              {tsk.notes && (
                                <p className="text-[10px] text-gray-500 font-mono mt-1 break-words">{tsk.notes}</p>
                              )}
                              {tsk.due && (
                                <div className="text-[9px] font-mono text-rose-500/70 mt-1.5 uppercase flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Due: {new Date(tsk.due).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteTask(tsk.id, tsk.title)}
                              className="p-1 rounded text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mt-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ------ EMAIL INSPECTOR SHEET ------ */}
      <AnimatePresence>
        {selectedEmail && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-end justify-center p-4 md:items-center"
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-950 border border-cyan-400/20 rounded-2xl overflow-hidden p-5 flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3 shrink-0">
                <div className="min-w-0 flex-1 pr-4">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950/40 rounded-full inline-block mb-1.5 uppercase">
                    JARVIS DECODED DATA
                  </span>
                  <h3 className="text-sm font-sans font-bold text-white truncate">{selectedEmail.subject}</h3>
                  <p className="text-[10px] font-mono text-cyan-600 truncate mt-0.5">From: {selectedEmail.from}</p>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-2.5 py-1 bg-zinc-900 hover:border-cyan-400/30 border border-white/10 rounded-lg text-[10px] font-mono cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>

              {/* Message content stream */}
              <div className="flex-1 overflow-y-auto my-4 p-4 bg-black rounded-xl border border-white/5 relative min-h-[160px] text-xs font-mono">
                {!selectedEmailBody ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-r-transparent rounded-full animate-spin mb-2" />
                    <span className="text-[9px] text-gray-500 tracking-wider">HARVESTING ENCRYPTED SIGNAL...</span>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap leading-relaxed text-[#c1e5f0] font-sans font-light select-text selection:bg-cyan-800 break-all text-xs">
                    {selectedEmailBody}
                  </pre>
                )}
              </div>

              <div className="flex gap-2 justify-end shrink-0">
                <button
                  onClick={() => {
                    const subjectReply = selectedEmail.subject.startsWith("Re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject}`;
                    setComposeTo(selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from);
                    setComposeSubject(subjectReply);
                    setSelectedEmail(null);
                    setShowCompose(true);
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------ COMPOSE EMAIL MODAL ------ */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-zinc-950 border border-cyan-400/20 p-5 rounded-2xl space-y-4 shadow-2xl relative"
            >
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">
                DEPLOY SECURE EMAIL TRANSMISSION
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-gray-500">RECIPIENT IP / ADR:</label>
                  <input
                    type="email"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="e.g. operator@domain.com"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500">TACTICAL SUBJECT:</label>
                  <input
                    type="text"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="e.g. Reactor core diagnostics complete"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500">EMAIL BODY STREAM:</label>
                  <textarea
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Specify strategic directions..."
                    className="w-full h-36 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs resize-none font-sans font-light"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-gray-400 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={actionLoading || !composeTo.trim() || !composeSubject.trim() || !composeBody.trim()}
                  className="px-4 py-2 bg-cyan-500 text-black text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Sending..." : "Dispatch Stream"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------ NEW EVENT LOG WINDOW ------ */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-zinc-950 border border-cyan-400/20 p-5 rounded-2xl space-y-4 shadow-2xl relative"
            >
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">
                SCHEDULE CALENDAR DEPLOYMENT
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-gray-500">EVENT SUMMARY:</label>
                  <input
                    type="text"
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    placeholder="e.g. Arc Reconfiguration Sync"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500">DESCRIPTION NOTES:</label>
                  <input
                    type="text"
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Optional telemetry descriptions..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 col-span-1">
                    <label className="text-gray-500">TIMELINE DATE:</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500">START HR:</label>
                    <input
                      type="time"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500">END HR:</label>
                    <input
                      type="time"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-gray-400 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={actionLoading || !eventSummary.trim() || !eventDate}
                  className="px-4 py-2 bg-cyan-500 text-black text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Registering..." : "Publish Event"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------ NEW TASK LOG COMPONENT ------ */}
      <AnimatePresence>
        {showAddTask && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-zinc-950 border border-cyan-400/20 p-5 rounded-2xl space-y-4 shadow-2xl relative"
            >
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">
                APPEND MANDATORY DELIVERABLE
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-gray-500">TASK TARGET TITLE:</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Conduct thruster integrity sweeps"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500">EXPLANATORY NOTES:</label>
                  <input
                    type="text"
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    placeholder="Details about task specs..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500">TARGET DUE LIMITS:</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-gray-400 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={actionLoading || !newTaskTitle.trim()}
                  className="px-4 py-2 bg-cyan-500 text-black text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Deploying..." : "Inject Task"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------ NEW LIST MODAL ------ */}
      <AnimatePresence>
        {showListModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm bg-zinc-950 border border-cyan-400/20 p-5 rounded-2xl space-y-4 shadow-2xl relative"
            >
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-2">
                INITIALIZE NEW TASK LIST
              </h3>

              <div className="space-y-1 font-mono text-xs">
                <label className="text-gray-500">BOARD NAME:</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Stark Heavy Industries Projects"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowListModal(false);
                    setNewListName("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 text-gray-400 hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTaskList}
                  disabled={actionLoading || !newListName.trim()}
                  className="px-4 py-2 bg-cyan-500 text-black text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  Create Board
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
