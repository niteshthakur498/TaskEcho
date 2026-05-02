"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { Task, Subtask, TaskPriority, DayStat } from "./types";

const API = "http://localhost:8080/tasks";
const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 24;

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
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
  HIGH: "#High",
  MEDIUM: "#Medium",
  LOW: "#Low",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  HIGH:   "text-red-600 bg-red-50",
  MEDIUM: "text-indigo-600 bg-indigo-50",
  LOW:    "text-green-600 bg-green-50",
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// ── Tag chip colours (cycles through a palette) ────────────────────────────
const TAG_COLORS = [
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-sky-50 text-sky-700 border-sky-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-teal-50 text-teal-700 border-teal-200",
];
function tagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length];
}

// ── Small reusable tag pill ────────────────────────────────────────────────
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

// ── Single subtask row (used in pending task cards) ───────────────────────
function SubtaskRow({
  subtask,
  taskId,
  onToggle,
  onDelete,
}: {
  subtask: Subtask;
  taskId: string;
  onToggle: (taskId: string, subtask: Subtask) => void;
  onDelete: (taskId: string, subtaskId: string) => void;
}) {
  const done = subtask.status === "COMPLETED";
  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={() => onToggle(taskId, subtask)}
        className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          done
            ? "border-emerald-500 bg-emerald-500"
            : "border-gray-300 hover:border-indigo-400"
        }`}
        aria-label={done ? `Undo subtask: ${subtask.title}` : `Complete subtask: ${subtask.title}`}
      >
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`text-xs flex-1 min-w-0 truncate ${done ? "line-through text-gray-400" : "text-gray-600"}`}>
        {subtask.title}
      </span>
      <button
        onClick={() => onDelete(taskId, subtask.id)}
        className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all text-base leading-none"
        aria-label={`Delete subtask: ${subtask.title}`}
      >
        ×
      </button>
    </div>
  );
}

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
  const [showDetails, setShowDetails]   = useState(false);
  const [tagInput, setTagInput]         = useState("");
  const [newTags, setNewTags]           = useState<string[]>([]);
  const tagInputRef                     = useRef<HTMLInputElement>(null);

  // ── Expanded details per task card ──────────────────────────────────────
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // ── Subtask state ────────────────────────────────────────────────────────
  const [activeMenuId, setActiveMenuId]           = useState<string | null>(null);
  const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput]           = useState("");

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

  // ── Tag input helpers ────────────────────────────────────────────────────
  function commitTag() {
    const raw = tagInput.trim().toLowerCase().replace(/^#+/, "");
    if (!raw || newTags.length >= MAX_TAGS || newTags.includes(raw)) {
      setTagInput("");
      return;
    }
    const trimmed = raw.slice(0, MAX_TAG_LENGTH);
    setNewTags(prev => [...prev, trimmed]);
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Backspace" && tagInput === "" && newTags.length > 0) {
      setNewTags(prev => prev.slice(0, -1));
    }
  }

  function removeNewTag(tag: string) {
    setNewTags(prev => prev.filter(t => t !== tag));
  }

  // ── Add task ─────────────────────────────────────────────────────────────
  async function addTask() {
    const title = input.trim();
    if (!title) return;

    const pendingTag = tagInput.trim().toLowerCase().replace(/^#+/, "");
    const finalTags = pendingTag && newTags.length < MAX_TAGS && !newTags.includes(pendingTag)
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
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
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
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
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
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setSubtaskInput("");
      // Keep input open so user can add more
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
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (e) { setError((e as Error).message); }
  }

  async function deleteSubtask(taskId: string, subtaskId: string) {
    try {
      const res = await fetch(`${API}/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
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

  const pending   = tasks.filter(t => t.status === "PENDING");
  const completed = tasks.filter(t => t.status === "COMPLETED");

  const visiblePending = useMemo(() => {
    let list = filterToday ? pending.filter(t => isToday(t.createdAt)) : pending;
    if (sortByPriority) list = [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return list;
  }, [pending, filterToday, sortByPriority]);

  const displayedPending = showAllPending ? visiblePending : visiblePending.slice(0, 3);

  const maxBar = useMemo(() => {
    const max = Math.max(...stats.map(d => d.created + d.completed), 1);
    return max;
  }, [stats]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 h-44 sm:h-52">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 flex flex-col justify-center px-6 gap-2 opacity-30 pointer-events-none select-none">
          <p className="text-white text-xs font-medium mb-1">Pending Tasks ({pending.length})</p>
          {pending.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-white/20 rounded-md px-3 py-1.5">
              <span className="w-3.5 h-3.5 rounded border border-white/60 flex-shrink-0" />
              <span className="text-white text-xs truncate">{t.title}</span>
            </div>
          ))}
          {completed.length > 0 && (
            <p className="text-white text-xs font-medium mt-1">Completed Tasks ({completed.length})</p>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/95 via-purple-500/80 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {getGreeting()},
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base mt-1">
            You have <span className="font-semibold text-white">{pending.length}</span> pending task{pending.length !== 1 ? "s" : ""} for today
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Error: {error}
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSortByPriority(v => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                sortByPriority
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}
            >
              Priority View
            </button>
            <button
              onClick={() => setFilterToday(v => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filterToday
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* ── Add Task Area — unified card ─────────────────────────────────── */}
        <div className="mb-8">
          <div className={`bg-white rounded-xl border shadow-sm transition-all ${
            showDetails ? "border-indigo-200 shadow-indigo-50" : "border-gray-200"
          } focus-within:border-indigo-300 focus-within:shadow-indigo-50`}>

            {/* Text input row */}
            <div className="px-4 pt-3 pb-2">
              <input
                type="text"
                placeholder="What do you want to get done?"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                disabled={loading}
              />
            </div>

            {/* Tag expansion area */}
            {showDetails && (
              <div className="px-4 pb-2.5 border-t border-dashed border-gray-200 pt-2.5">
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
                      className="flex-1 min-w-32 text-xs text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 italic">Max {MAX_TAGS} tags</span>
                  )}
                </div>
              </div>
            )}

            {/* Toolbar row */}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="text-xs text-gray-500 bg-transparent outline-none cursor-pointer pr-1 hover:text-gray-700 transition-colors"
                >
                  <option value="LOW">Low priority</option>
                  <option value="MEDIUM">Medium priority</option>
                  <option value="HIGH">High priority</option>
                </select>

                <span className="w-px h-3.5 bg-gray-200 mx-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowDetails(v => !v);
                    if (!showDetails) setTimeout(() => tagInputRef.current?.focus(), 50);
                  }}
                  className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
                    showDetails || newTags.length > 0
                      ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                  {newTags.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-bold leading-none">
                      {newTags.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={addTask}
                disabled={loading || !input.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Task Lists ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600" />
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📝</div>
                <p className="text-gray-500">No tasks yet — add one above</p>
              </div>
            )}

            {/* Pending Tasks */}
            {!loading && visiblePending.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Pending Tasks ({visiblePending.length})
                  </h2>
                  {visiblePending.length > 3 && (
                    <button
                      onClick={() => setShowAllPending(v => !v)}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      {showAllPending ? "Show less" : `View All →`}
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {displayedPending.map(task => {
                    const isConfirming     = confirmingId === task.id;
                    const isExpanded       = expandedTaskId === task.id;
                    const hasTags          = task.tags && task.tags.length > 0;
                    const hasSubtasks      = task.subtasks && task.subtasks.length > 0;
                    const isAddingSubtask  = addingSubtaskForId === task.id;
                    const doneSubtasks     = task.subtasks?.filter(s => s.status === "COMPLETED").length ?? 0;
                    const totalSubtasks    = task.subtasks?.length ?? 0;
                    return (
                      <div
                        key={task.id}
                        className={`bg-white rounded-xl border shadow-sm transition-all duration-200 ${
                          isConfirming ? "border-indigo-300 shadow-indigo-100" : "border-gray-100 hover:shadow-md"
                        } ${animatingId === task.id ? "opacity-50 scale-95" : ""}`}
                      >
                        {/* Main task row */}
                        <div className="px-3 py-3.5 flex items-center gap-2">

                          {/* Completion checkbox */}
                          <button
                            onClick={() => isConfirming ? cancelConfirm() : requestComplete(task)}
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-colors ${
                              isConfirming
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-500"
                            }`}
                            aria-label={`Complete ${task.title}`}
                          />

                          {/* Title and meta */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span>📅</span>
                              {fmtDate(task.createdAt)}
                              {totalSubtasks > 0 && (
                                <>
                                  <span className="text-gray-200">·</span>
                                  <span className={doneSubtasks === totalSubtasks ? "text-emerald-500" : "text-gray-400"}>
                                    {doneSubtasks}/{totalSubtasks} subtasks
                                  </span>
                                </>
                              )}
                            </p>
                          </div>

                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[task.priority]}`}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>

                          {/* 3-dot menu */}
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setActiveMenuId(prev => prev === task.id ? null : task.id);
                              }}
                              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                              aria-label="Task options"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>
                            {activeMenuId === task.id && (
                              <div
                                className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[136px]"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setAddingSubtaskForId(task.id);
                                    setSubtaskInput("");
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add Subtask
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtasks section */}
                        {(hasSubtasks || isAddingSubtask) && (
                          <div className="px-3 pb-3 border-t border-gray-50">
                            <div className="ml-8 space-y-1.5 pt-2">
                              {task.subtasks.map(subtask => (
                                <SubtaskRow
                                  key={subtask.id}
                                  subtask={subtask}
                                  taskId={task.id}
                                  onToggle={toggleSubtask}
                                  onDelete={deleteSubtask}
                                />
                              ))}
                              {isAddingSubtask && (
                                <div className="flex items-center gap-2 pt-0.5">
                                  <div className="w-4 h-4 rounded border-2 border-dashed border-gray-200 flex-shrink-0" />
                                  <input
                                    autoFocus
                                    type="text"
                                    placeholder="Subtask title…"
                                    value={subtaskInput}
                                    onChange={e => setSubtaskInput(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === "Enter") { e.preventDefault(); addSubtask(task.id); }
                                      if (e.key === "Escape") { setAddingSubtaskForId(null); setSubtaskInput(""); }
                                    }}
                                    className="flex-1 text-xs text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300"
                                  />
                                  <button
                                    onClick={() => addSubtask(task.id)}
                                    disabled={!subtaskInput.trim()}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium rounded transition-colors"
                                  >
                                    Add
                                  </button>
                                  <button
                                    onClick={() => { setAddingSubtaskForId(null); setSubtaskInput(""); }}
                                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 text-base leading-none"
                                    aria-label="Cancel adding subtask"
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* More details toggle (tags) */}
                        {hasTags && (
                          <div className="px-4 pb-2">
                            <button
                              type="button"
                              onClick={() => toggleTaskDetails(task.id)}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
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
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-400 font-medium mb-1.5">Tags</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {task.tags.map((tag, i) => (
                                    <TagPill key={tag} label={tag} index={i} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Inline note panel — shown when confirming */}
                        {isConfirming && (
                          <div className="px-4 pb-4 animate-fade-in">
                            <div className="border-t border-indigo-100 pt-3">
                              <p className="text-xs font-medium text-indigo-700 mb-2">
                                Add a completion note <span className="text-gray-400 font-normal">(optional)</span>
                              </p>
                              {totalSubtasks > 0 && doneSubtasks < totalSubtasks && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
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
                                className="w-full text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => completeWithNote(task)}
                                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95"
                                >
                                  ✓ Mark Complete
                                </button>
                                <button
                                  onClick={cancelConfirm}
                                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                                >
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
              <p className="text-sm text-gray-400 text-center py-6">No pending tasks match this filter</p>
            )}

            {/* Completed Tasks */}
            {!loading && completed.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Completed Tasks ({completed.length})
                </h2>
                <div className="space-y-2">
                  {completed.map(task => {
                    const isExpanded  = expandedTaskId === task.id;
                    const hasTags     = task.tags && task.tags.length > 0;
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                    const hasDetails  = hasTags || !!task.completionNote || hasSubtasks;
                    return (
                      <div
                        key={task.id}
                        className={`bg-emerald-50 rounded-xl border border-emerald-100 transition-all duration-200 ${
                          animatingId === task.id ? "opacity-50 scale-95" : ""
                        }`}
                      >
                        <div className="px-4 py-3.5 flex items-center gap-3">
                          <button
                            onClick={() => revertToPending(task)}
                            className="w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex-shrink-0 flex items-center justify-center transition-colors hover:bg-emerald-400"
                            aria-label={`Undo ${task.title}`}
                          >
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-400 truncate">{task.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span>✓</span>
                              {task.completedAt ? fmtDate(task.completedAt) : fmtDate(task.createdAt)}
                              {hasSubtasks && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span>{task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}</span>
                                </>
                              )}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                        </div>

                        {/* More details toggle for completed tasks */}
                        {hasDetails && (
                          <div className="px-4 pb-3">
                            <button
                              type="button"
                              onClick={() => toggleTaskDetails(task.id)}
                              className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-700 transition-colors"
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
                              <div className="mt-2 space-y-2.5">
                                {task.completionNote && (
                                  <div className="px-3 py-2 bg-white border border-emerald-100 rounded-lg">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                      <span className="font-medium text-emerald-600">Note: </span>
                                      {task.completionNote}
                                    </p>
                                  </div>
                                )}
                                {hasSubtasks && (
                                  <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1.5">
                                      Subtasks ({task.subtasks.length})
                                    </p>
                                    <div className="space-y-1">
                                      {task.subtasks.map(st => (
                                        <div key={st.id} className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded border-2 border-emerald-400 bg-emerald-400 flex-shrink-0 flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                          <span className="text-xs line-through text-gray-400 truncate">{st.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {hasTags && (
                                  <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1.5">Tags</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {task.tags.map((tag, i) => (
                                        <TagPill key={tag} label={tag} index={i} />
                                      ))}
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

          {/* ── Right: Stats Sidebar ───────────────────────────────────────────── */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-4">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Daily Progress</p>

              {stats.length === 0 ? (
                <div className="flex items-end justify-between gap-1.5 h-24">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-gray-100 rounded-t-sm" style={{ height: "40px" }} />
                      <span className="text-xs text-gray-400">{d}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-end justify-between gap-1.5" style={{ height: "88px" }}>
                  {stats.map(day => {
                    const createdH   = (day.created  / maxBar) * 100;
                    const completedH = day.created > 0 ? (day.completed / day.created) * 100 : 0;
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          className={`w-full relative rounded-t-md overflow-hidden transition-all duration-500 ${day.isToday ? "bg-indigo-200" : "bg-gray-200"}`}
                          style={{ height: `${Math.max(createdH, day.created > 0 ? 8 : 4)}%` }}
                        >
                          <div
                            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${day.isToday ? "bg-indigo-600" : "bg-indigo-400"}`}
                            style={{ height: `${completedH}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium mt-1 ${day.isToday ? "text-indigo-600" : "text-gray-400"}`}>
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-300 inline-block" />Created</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-600 inline-block" />Done</span>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-2">Efficiency</p>
              <p className="text-3xl font-bold">
                {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
              </p>
              <p className="text-xs text-indigo-200 mt-1">tasks completed</p>
              <div className="mt-3 bg-indigo-500 rounded-full h-1.5">
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
