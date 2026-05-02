"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { Task, Subtask, TaskPriority, DayStat } from "./types";
import { t, tagColor } from "./theme";

const API = "http://localhost:8080/tasks";
const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 24;

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate();
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  HIGH:   "#High",
  MEDIUM: "#Medium",
  LOW:    "#Low",
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// ── Tag chip ──────────────────────────────────────────────────────────────
function TagPill({
  label,
  index,
  onRemove,
}: {
  label: string;
  index: number;
  onRemove?: () => void;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${tagColor(index)}`}
    >
      #{label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-60 transition-opacity leading-none"
          aria-label={`Remove tag ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

// ── Subtask row ───────────────────────────────────────────────────────────
function SubtaskRow({
  subtask,
  taskId,
  onToggle,
  onDelete,
  onEdit,
}: {
  subtask: Subtask;
  taskId: string;
  onToggle: (taskId: string, subtask: Subtask) => void;
  onDelete: (taskId: string, subtaskId: string) => void;
  onEdit:   (taskId: string, subtaskId: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(subtask.title);
  const done = subtask.status === "COMPLETED";

  function commitEdit() {
    const v = editVal.trim();
    if (v && v !== subtask.title) onEdit(taskId, subtask.id, v);
    else setEditVal(subtask.title);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-4 h-4 rounded border-2 border-dashed border-border-default flex-shrink-0" />
        <input
          autoFocus
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter")  { e.preventDefault(); commitEdit(); }
            if (e.key === "Escape") { setEditVal(subtask.title); setEditing(false); }
          }}
          onBlur={commitEdit}
          className="flex-1 text-xs text-text-primary bg-surface-2 border border-accent/40 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 group">
      <button
        onClick={() => onToggle(taskId, subtask)}
        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          done ? "border-emerald-500 bg-emerald-500" : "border-border-default hover:border-accent"
        }`}
        aria-label={done ? `Undo subtask: ${subtask.title}` : `Complete subtask: ${subtask.title}`}
      >
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span
        onClick={() => { if (!done) { setEditVal(subtask.title); setEditing(true); } }}
        className={`text-xs flex-1 min-w-0 truncate ${
          done
            ? "line-through text-text-muted"
            : "text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
        }`}
        title={done ? undefined : "Click to edit"}
      >
        {subtask.title}
      </span>

      <button
        onClick={() => onDelete(taskId, subtask.id)}
        className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-text-muted hover:text-danger transition-all text-base leading-none"
        aria-label={`Delete subtask: ${subtask.title}`}
      >
        ×
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Home() {
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [stats, setStats]               = useState<DayStat[]>([]);
  const [input, setInput]               = useState("");
  const [priority, setPriority]         = useState<TaskPriority>("MEDIUM");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [animatingId, setAnimatingId]   = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [noteInput, setNoteInput]       = useState("");
  const [filterToday, setFilterToday]   = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);

  // ── Tag state for new task form ──────────────────────────────────────────
  const [showDetails, setShowDetails] = useState(false);
  const [tagInput, setTagInput]       = useState("");
  const [newTags, setNewTags]         = useState<string[]>([]);
  const tagInputRef                   = useRef<HTMLInputElement>(null);

  // ── Expanded details per task card ──────────────────────────────────────
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // ── Subtask state ────────────────────────────────────────────────────────
  const [activeMenuId, setActiveMenuId]             = useState<string | null>(null);
  const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput]             = useState("");

  // ── Edit / delete state ──────────────────────────────────────────────────
  const [editingTaskId,    setEditingTaskId]    = useState<string | null>(null);
  const [editTaskInput,    setEditTaskInput]    = useState("");
  const [confirmDeleteId,  setConfirmDeleteId]  = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(API).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() as Promise<Task[]>; }),
      fetch(`${API}/stats/weekly`).then(r => r.json() as Promise<DayStat[]>),
    ])
      .then(([t, s]) => { setTasks(t); setStats(s); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Close the 3-dot menu when clicking outside it
  useEffect(() => {
    if (!activeMenuId) return;
    const close = () => setActiveMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [activeMenuId]);

  // ── Tag helpers ──────────────────────────────────────────────────────────
  function commitTag() {
    const raw = tagInput.trim().toLowerCase().replace(/^#+/, "");
    if (!raw || newTags.length >= MAX_TAGS || newTags.includes(raw)) {
      setTagInput(""); return;
    }
    setNewTags(prev => [...prev, raw.slice(0, MAX_TAG_LENGTH)]);
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); commitTag();
    } else if (e.key === "Backspace" && tagInput === "" && newTags.length > 0) {
      setNewTags(prev => prev.slice(0, -1));
    }
  }

  function removeNewTag(tag: string) {
    setNewTags(prev => prev.filter(tt => tt !== tag));
  }

  // ── Add task ─────────────────────────────────────────────────────────────
  async function addTask() {
    const title = input.trim();
    if (!title) return;

    const pendingTag = tagInput.trim().toLowerCase().replace(/^#+/, "");
    const finalTags  = pendingTag && newTags.length < MAX_TAGS && !newTags.includes(pendingTag)
      ? [...newTags, pendingTag.slice(0, MAX_TAG_LENGTH)]
      : newTags;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority, tags: finalTags }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const created = (await res.json()) as Task;
      setTasks(prev => [created, ...prev]);
      setInput("");
      setPriority("MEDIUM");
      setNewTags([]);
      setTagInput("");
      setShowDetails(false);
      refreshStats();
    } catch (e) { setError((e as Error).message); }
  }

  function requestComplete(task: Task) {
    setConfirmingId(task.id);
    setNoteInput("");
  }

  function cancelConfirm() {
    setConfirmingId(null);
    setNoteInput("");
  }

  async function completeWithNote(task: Task) {
    setConfirmingId(null);
    setAddingSubtaskForId(null);
    setAnimatingId(task.id);
    try {
      const body: Record<string, unknown> = { status: "COMPLETED" };
      if (noteInput.trim()) body.note = noteInput.trim();
      const res = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === task.id ? updated : tt));
      setNoteInput("");
      refreshStats();
    } catch (e) { setError((e as Error).message); }
    finally { setTimeout(() => setAnimatingId(null), 300); }
  }

  async function revertToPending(task: Task) {
    setAnimatingId(task.id);
    try {
      const res = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDING" }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === task.id ? updated : tt));
      refreshStats();
    } catch (e) { setError((e as Error).message); }
    finally { setTimeout(() => setAnimatingId(null), 300); }
  }

  // ── Subtask operations ────────────────────────────────────────────────────
  async function addSubtask(taskId: string) {
    const title = subtaskInput.trim();
    if (!title) return;
    try {
      const res = await fetch(`${API}/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === taskId ? updated : tt));
      setSubtaskInput("");
    } catch (e) { setError((e as Error).message); }
  }

  async function toggleSubtask(taskId: string, subtask: Subtask) {
    const newStatus = subtask.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch(`${API}/${taskId}/subtasks/${subtask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === taskId ? updated : tt));
    } catch (e) { setError((e as Error).message); }
  }

  async function deleteSubtask(taskId: string, subtaskId: string) {
    try {
      const res = await fetch(`${API}/${taskId}/subtasks/${subtaskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === taskId ? updated : tt));
    } catch (e) { setError((e as Error).message); }
  }

  async function saveTaskEdit(taskId: string) {
    const title = editTaskInput.trim();
    setEditingTaskId(null);
    if (!title) return;
    const original = tasks.find(tt => tt.id === taskId);
    if (!original || title === original.title) return;
    try {
      const res = await fetch(`${API}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === taskId ? updated : tt));
    } catch (e) { setError((e as Error).message); }
  }

  async function deleteTask(taskId: string) {
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`${API}/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`${res.status}`);
      setTasks(prev => prev.filter(tt => tt.id !== taskId));
      refreshStats();
    } catch (e) { setError((e as Error).message); }
  }

  async function editSubtask(taskId: string, subtaskId: string, title: string) {
    try {
      const res = await fetch(`${API}/${taskId}/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(tt => tt.id === taskId ? updated : tt));
    } catch (e) { setError((e as Error).message); }
  }

  async function refreshStats() {
    try {
      const s = await fetch(`${API}/stats/weekly`).then(r => r.json()) as DayStat[];
      setStats(s);
    } catch { /* non-critical */ }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addTask();
  }

  function toggleTaskDetails(id: string) {
    setExpandedTaskId(prev => prev === id ? null : id);
  }

  const pending   = tasks.filter(tt => tt.status === "PENDING");
  const completed = tasks.filter(tt => tt.status === "COMPLETED");

  const visiblePending = useMemo(() => {
    let list = filterToday ? pending.filter(tt => isToday(tt.createdAt)) : pending;
    if (sortByPriority) list = [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return list;
  }, [pending, filterToday, sortByPriority]);

  const displayedPending = showAllPending ? visiblePending : visiblePending.slice(0, 3);

  const maxBar = useMemo(() => Math.max(...stats.map(d => d.created + d.completed), 1), [stats]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface-bg">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden hero-gradient h-48 sm:h-56">
        {/* Ghost task preview — decorative right panel */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 flex flex-col justify-center px-6 gap-2.5 opacity-[0.15] pointer-events-none select-none">
          <p className="text-text-secondary text-xs font-medium mb-0.5">Pending ({pending.length})</p>
          {pending.slice(0, 3).map(task => (
            <div key={task.id} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5">
              <span className="w-3.5 h-3.5 rounded border border-white/20 flex-shrink-0" />
              <span className="text-white text-xs truncate">{task.title}</span>
            </div>
          ))}
        </div>

        {/* Left fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-indigo-900/40 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight tracking-tight">
            {getGreeting()},
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-2">
            You have{" "}
            <span className="font-semibold text-accent-text">{pending.length}</span>{" "}
            pending task{pending.length !== 1 ? "s" : ""} for today
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {error && (
          <div className="mb-6 px-4 py-3 bg-danger-muted border border-danger/20 rounded-xl text-danger-text text-sm">
            Error: {error}
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className={t.pageTitle}>My Tasks</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSortByPriority(v => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                sortByPriority ? t.pillActive : t.pillInactive
              }`}
            >
              Priority View
            </button>
            <button
              onClick={() => setFilterToday(v => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filterToday ? t.pillActive : t.pillInactive
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* ── Add Task Card ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className={`bg-surface-1 rounded-2xl border shadow-lg shadow-black/30 transition-all ${
            showDetails ? "border-accent/30" : "border-border-default"
          } focus-within:border-accent/25`}>

            {/* Title input */}
            <div className="px-5 pt-4 pb-3">
              <input
                type="text"
                placeholder="What do you want to get done?"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                className="w-full text-base text-text-primary placeholder-text-muted bg-transparent outline-none"
                disabled={loading}
              />
            </div>

            {/* Tag expansion area */}
            {showDetails && (
              <div className="px-5 pb-3 border-t border-dashed border-border-subtle pt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {newTags.map((tag, i) => (
                    <TagPill key={tag} label={tag} index={i} onRemove={() => removeNewTag(tag)} />
                  ))}
                  {newTags.length < MAX_TAGS ? (
                    <input
                      ref={tagInputRef}
                      type="text"
                      placeholder={newTags.length === 0 ? "Type a tag and press Enter…" : "Add another…"}
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={commitTag}
                      maxLength={MAX_TAG_LENGTH + 1}
                      className="flex-1 min-w-32 text-xs text-text-primary placeholder-text-muted bg-transparent outline-none"
                    />
                  ) : (
                    <span className="text-xs text-text-muted italic">Max {MAX_TAGS} tags</span>
                  )}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="text-xs text-text-muted bg-transparent outline-none cursor-pointer pr-1 hover:text-text-secondary transition-colors"
                >
                  <option value="LOW">Low priority</option>
                  <option value="MEDIUM">Medium priority</option>
                  <option value="HIGH">High priority</option>
                </select>

                <span className="w-px h-3.5 bg-border-default mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(v => !v);
                    if (!showDetails) setTimeout(() => tagInputRef.current?.focus(), 50);
                  }}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                    showDetails || newTags.length > 0
                      ? "text-accent-text bg-accent-muted hover:bg-accent-muted/80"
                      : "text-text-muted hover:text-text-secondary hover:bg-surface-3"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                  {newTags.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-accent text-white rounded-full text-xs font-bold leading-none">
                      {newTags.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={addTask}
                disabled={loading || !input.trim()}
                className="btn-primary"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Task Lists */}
          <div className="flex-1 min-w-0 space-y-8">

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-surface-3 border-t-accent" />
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-text-muted text-sm">No tasks yet — add one above</p>
              </div>
            )}

            {/* ── Pending Tasks ──────────────────────────────────────────────── */}
            {!loading && visiblePending.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-label">
                    Pending Tasks ({visiblePending.length})
                  </h2>
                  {visiblePending.length > 3 && (
                    <button
                      onClick={() => setShowAllPending(v => !v)}
                      className="text-xs text-accent hover:text-accent-text font-medium transition-colors"
                    >
                      {showAllPending ? "Show less" : "View All →"}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {displayedPending.map(task => {
                    const isConfirming    = confirmingId   === task.id;
                    const isExpanded      = expandedTaskId === task.id;
                    const isDeletingTask  = confirmDeleteId === task.id;
                    const hasTags         = task.tags     && task.tags.length > 0;
                    const hasSubtasks     = task.subtasks && task.subtasks.length > 0;
                    const isAddingSubtask = addingSubtaskForId === task.id;
                    const doneSubtasks    = task.subtasks?.filter(s => s.status === "COMPLETED").length ?? 0;
                    const totalSubtasks   = task.subtasks?.length ?? 0;

                    return (
                      <div
                        key={task.id}
                        className={`${t.cardPending} ${
                          isConfirming   ? "border-accent/30"  :
                          isDeletingTask ? "border-danger/25"  :
                          "hover:border-border-default/60"
                        } ${animatingId === task.id ? "opacity-50 scale-95" : ""}`}
                      >
                        {/* Main task row */}
                        <div className="px-5 py-4 flex items-center gap-3">

                          {/* Completion checkbox */}
                          <button
                            onClick={() => isConfirming ? cancelConfirm() : requestComplete(task)}
                            className={isConfirming ? t.checkboxConfirming : t.checkboxPending}
                            aria-label={`Complete ${task.title}`}
                          />

                          {/* Title + meta */}
                          <div className="flex-1 min-w-0">
                            {editingTaskId === task.id ? (
                              <input
                                autoFocus
                                value={editTaskInput}
                                onChange={e => setEditTaskInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter")  { e.preventDefault(); saveTaskEdit(task.id); }
                                  if (e.key === "Escape") setEditingTaskId(null);
                                }}
                                onBlur={() => saveTaskEdit(task.id)}
                                className="w-full text-base font-medium text-text-primary bg-surface-2 border border-accent/40 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                            ) : (
                              <p className={t.taskTitle}>{task.title}</p>
                            )}
                            <p className={t.taskMeta}>
                              <span>📅</span>
                              {fmtDate(task.createdAt)}
                              {totalSubtasks > 0 && (
                                <>
                                  <span className="text-border-default">·</span>
                                  <span className={doneSubtasks === totalSubtasks ? "text-emerald-400" : "text-text-muted"}>
                                    {doneSubtasks}/{totalSubtasks} subtasks
                                  </span>
                                </>
                              )}
                            </p>
                          </div>

                          {/* Priority badge */}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${t.priority[task.priority]}`}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>

                          {/* 3-dot menu */}
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setActiveMenuId(prev => prev === task.id ? null : task.id);
                              }}
                              className={`w-7 h-7 ${t.iconBtn}`}
                              aria-label="Task options"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5"  r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>

                            {activeMenuId === task.id && (
                              <div className={t.menuShell} onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingTaskId(task.id);
                                    setEditTaskInput(task.title);
                                    setConfirmDeleteId(null);
                                    setConfirmingId(null);
                                    setActiveMenuId(null);
                                  }}
                                  className={t.menuItem}
                                >
                                  <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                                  </svg>
                                  Edit title
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setAddingSubtaskForId(task.id);
                                    setSubtaskInput("");
                                    setActiveMenuId(null);
                                  }}
                                  className={t.menuItem}
                                >
                                  <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add Subtask
                                </button>
                                <div className="border-t border-border-subtle my-1.5" />
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(task.id);
                                    setConfirmingId(null);
                                    setEditingTaskId(null);
                                    setActiveMenuId(null);
                                  }}
                                  className={t.menuItemDanger}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtasks */}
                        {(hasSubtasks || isAddingSubtask) && (
                          <div className="px-5 pb-4 border-t border-border-subtle">
                            <div className="ml-8 space-y-2 pt-3">
                              {task.subtasks.map(subtask => (
                                <SubtaskRow
                                  key={subtask.id}
                                  subtask={subtask}
                                  taskId={task.id}
                                  onToggle={toggleSubtask}
                                  onDelete={deleteSubtask}
                                  onEdit={editSubtask}
                                />
                              ))}
                              {isAddingSubtask && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  <div className="w-4 h-4 rounded border-2 border-dashed border-border-default flex-shrink-0" />
                                  <input
                                    autoFocus
                                    type="text"
                                    placeholder="Subtask title…"
                                    value={subtaskInput}
                                    onChange={e => setSubtaskInput(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === "Enter")  { e.preventDefault(); addSubtask(task.id); }
                                      if (e.key === "Escape") { setAddingSubtaskForId(null); setSubtaskInput(""); }
                                    }}
                                    className="flex-1 text-xs text-text-primary placeholder-text-muted bg-surface-2 border border-border-default rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                                  />
                                  <button
                                    onClick={() => addSubtask(task.id)}
                                    disabled={!subtaskInput.trim()}
                                    className="px-2.5 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-30 text-white text-xs font-medium rounded-lg transition-colors"
                                  >
                                    Add
                                  </button>
                                  <button
                                    onClick={() => { setAddingSubtaskForId(null); setSubtaskInput(""); }}
                                    className="w-5 h-5 flex items-center justify-center text-text-muted hover:text-text-secondary text-base leading-none"
                                    aria-label="Cancel adding subtask"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags toggle */}
                        {hasTags && (
                          <div className="px-5 pb-4">
                            <button
                              type="button"
                              onClick={() => toggleTaskDetails(task.id)}
                              className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
                            >
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                              {isExpanded ? "Hide details" : "More details"}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-border-subtle">
                                <p className={t.detailLabel}>Tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {task.tags.map((tag, i) => <TagPill key={tag} label={tag} index={i} />)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delete confirmation */}
                        {isDeletingTask && (
                          <div className="px-5 pb-5 animate-fade-in">
                            <div className={t.panelBorderDanger}>
                              <p className="text-xs font-medium text-danger mb-3">Delete this task permanently?</p>
                              <div className="flex gap-2">
                                <button onClick={() => deleteTask(task.id)} className="btn-danger">
                                  Delete
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Complete confirmation + note */}
                        {isConfirming && (
                          <div className="px-5 pb-5 animate-fade-in">
                            <div className={t.panelBorderAccent}>
                              <p className="text-xs font-medium text-accent-text mb-3">
                                Add a completion note{" "}
                                <span className="text-text-muted font-normal">(optional)</span>
                              </p>
                              {totalSubtasks > 0 && doneSubtasks < totalSubtasks && (
                                <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/30 rounded-xl px-3 py-2 mb-3">
                                  {totalSubtasks - doneSubtasks} subtask{totalSubtasks - doneSubtasks !== 1 ? "s" : ""} will also be marked complete.
                                </p>
                              )}
                              <textarea
                                autoFocus
                                rows={2}
                                value={noteInput}
                                onChange={e => setNoteInput(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); completeWithNote(task); }
                                  if (e.key === "Escape") cancelConfirm();
                                }}
                                placeholder="What did you accomplish? Any blockers? (optional)"
                                className="w-full text-sm text-text-primary placeholder-text-muted bg-surface-2 border border-border-default rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                              />
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => completeWithNote(task)}
                                  className="flex-1 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl transition-colors active:scale-95"
                                >
                                  ✓ Mark Complete
                                </button>
                                <button onClick={cancelConfirm} className="btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {!loading && pending.length > 0 && visiblePending.length === 0 && (
              <p className="text-sm text-text-muted text-center py-6">No pending tasks match this filter</p>
            )}

            {/* ── Completed Tasks ───────────────────────────────────────────── */}
            {!loading && completed.length > 0 && (
              <section>
                <h2 className="section-label mb-4">
                  Completed Tasks ({completed.length})
                </h2>
                <div className="space-y-3">
                  {completed.map(task => {
                    const isExpanded  = expandedTaskId === task.id;
                    const hasTags     = task.tags     && task.tags.length > 0;
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                    const hasDetails  = hasTags || !!task.completionNote || hasSubtasks;

                    return (
                      <div
                        key={task.id}
                        className={`${t.cardCompleted} ${animatingId === task.id ? "opacity-50 scale-95" : ""}`}
                      >
                        <div className="px-5 py-4 flex items-center gap-3">
                          <button
                            onClick={() => revertToPending(task)}
                            className={t.checkboxDone}
                            aria-label={`Undo ${task.title}`}
                          >
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className="text-base text-text-muted line-through truncate">{task.title}</p>
                            <p className={t.taskMeta}>
                              <span>✓</span>
                              {task.completedAt ? fmtDate(task.completedAt) : fmtDate(task.createdAt)}
                              {hasSubtasks && (
                                <>
                                  <span className="text-border-default">·</span>
                                  <span>{task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}</span>
                                </>
                              )}
                            </p>
                          </div>

                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.priority[task.priority]}`}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className={`w-6 h-6 ${t.iconBtn} hover:text-danger hover:bg-danger-muted`}
                            aria-label={`Delete ${task.title}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                            </svg>
                          </button>
                        </div>

                        {hasDetails && (
                          <div className="px-5 pb-4">
                            <button
                              type="button"
                              onClick={() => toggleTaskDetails(task.id)}
                              className="flex items-center gap-1 text-xs text-text-muted hover:text-emerald-400 transition-colors"
                            >
                              <svg
                                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                              {isExpanded ? "Hide details" : "More details"}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-3">
                                {task.completionNote && (
                                  <div className="px-3 py-2.5 bg-surface-2 border border-border-subtle rounded-xl">
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                      <span className="font-medium text-emerald-400">Note: </span>
                                      {task.completionNote}
                                    </p>
                                  </div>
                                )}
                                {hasSubtasks && (
                                  <div>
                                    <p className={t.detailLabel}>Subtasks ({task.subtasks.length})</p>
                                    <div className="space-y-1.5">
                                      {task.subtasks.map(st => (
                                        <div key={st.id} className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                          <span className="text-xs line-through text-text-muted truncate">{st.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {hasTags && (
                                  <div>
                                    <p className={t.detailLabel}>Tags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {task.tags.map((tag, i) => <TagPill key={tag} label={tag} index={i} />)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Right: Stats Sidebar ───────────────────────────────────────── */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-4">

            {/* Daily Progress */}
            <div className="card p-5">
              <p className="section-label mb-5">Daily Progress</p>

              {stats.length === 0 ? (
                <div className="flex items-end justify-between gap-1.5 h-24">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-surface-3 rounded-t-sm" style={{ height: "40px" }} />
                      <span className="text-xs text-text-muted">{d}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-end justify-between gap-1.5" style={{ height: "88px" }}>
                  {stats.map(day => {
                    const createdH   = (day.created / maxBar) * 100;
                    const completedH = day.created > 0 ? (day.completed / day.created) * 100 : 0;
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          className={`w-full relative rounded-t-md overflow-hidden transition-all duration-500 ${
                            day.isToday ? "bg-indigo-100" : "bg-surface-3"
                          }`}
                          style={{ height: `${Math.max(createdH, day.created > 0 ? 8 : 4)}%` }}
                        >
                          <div
                            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
                              day.isToday ? "bg-accent" : "bg-accent/50"
                            }`}
                            style={{ height: `${completedH}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium mt-1 ${day.isToday ? "text-accent-text" : "text-text-muted"}`}>
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-surface-3 inline-block" />Created
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-accent inline-block" />Done
                </span>
              </div>
            </div>

            {/* Efficiency */}
            <div className="bg-accent rounded-2xl border border-accent/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">Efficiency</p>
              <p className="text-3xl font-bold text-white tracking-tight">
                {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
              </p>
              <p className="text-xs text-white/60 mt-1">tasks completed</p>
              <div className="mt-4 bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all duration-700"
                  style={{ width: `${tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
