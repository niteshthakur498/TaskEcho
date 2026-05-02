"use client";

import { useState, useEffect, useMemo } from "react";
import type { Task, TaskPriority, DayStat } from "./types";

const API = "http://localhost:8080/tasks";

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

export default function Home() {
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [stats, setStats]             = useState<DayStat[]>([]);
  const [input, setInput]             = useState("");
  const [priority, setPriority]       = useState<TaskPriority>("MEDIUM");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [animatingId, setAnimatingId]     = useState<string | null>(null);
  const [confirmingId, setConfirmingId]   = useState<string | null>(null);
  const [noteInput, setNoteInput]         = useState("");
  const [filterToday, setFilterToday]     = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(API).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() as Promise<Task[]>; }),
      fetch(`${API}/stats/weekly`).then(r => r.json() as Promise<DayStat[]>),
    ])
      .then(([t, s]) => { setTasks(t); setStats(s); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTask() {
    const title = input.trim();
    if (!title) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const created = (await res.json()) as Task;
      setTasks(prev => [created, ...prev]);
      setInput("");
      setPriority("MEDIUM");
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
    setAnimatingId(task.id);
    try {
      const body: Record<string, string> = { status: "COMPLETED" };
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

  async function refreshStats() {
    try {
      const s = await fetch(`${API}/stats/weekly`).then(r => r.json()) as DayStat[];
      setStats(s);
    } catch { /* non-critical */ }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addTask();
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
        {/* Decorative task preview on right */}
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

        {/* Gradient fade over preview */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/95 via-purple-500/80 to-transparent" />

        {/* Greeting text */}
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

        {/* Error */}
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

        {/* Add Task Row */}
        <div className="flex gap-2 mb-8">
          <div className="flex flex-1 items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
            <input
              type="text"
              placeholder="I want to..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
              disabled={loading}
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="text-xs text-gray-500 bg-transparent outline-none cursor-pointer border-l border-gray-200 pl-3"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <button
            onClick={addTask}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95"
          >
            Add Task
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Task Lists ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600" />
              </div>
            )}

            {/* Empty state */}
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
                    const isConfirming = confirmingId === task.id;
                    return (
                      <div
                        key={task.id}
                        className={`bg-white rounded-xl border shadow-sm transition-all duration-200 ${
                          isConfirming ? "border-indigo-300 shadow-indigo-100" : "border-gray-100 hover:shadow-md"
                        } ${animatingId === task.id ? "opacity-50 scale-95" : ""}`}
                      >
                        {/* Main task row */}
                        <div className="px-4 py-3.5 flex items-center gap-3">
                          <button
                            onClick={() => isConfirming ? cancelConfirm() : requestComplete(task)}
                            className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-colors ${
                              isConfirming
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 hover:border-indigo-500"
                            }`}
                            aria-label={`Complete ${task.title}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <span>📅</span>
                              {fmtDate(task.createdAt)}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                        </div>

                        {/* Inline note panel — shown when confirming */}
                        {isConfirming && (
                          <div className="px-4 pb-4 animate-fade-in">
                            <div className="border-t border-indigo-100 pt-3">
                              <p className="text-xs font-medium text-indigo-700 mb-2">
                                Add a completion note <span className="text-gray-400 font-normal">(optional)</span>
                              </p>
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

            {/* No results for filter */}
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
                  {completed.map(task => (
                    <div
                      key={task.id}
                      className={`bg-emerald-50 rounded-xl border border-emerald-100 px-4 py-3.5 transition-all duration-200 ${
                        animatingId === task.id ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
                          <p className="text-sm text-gray-400 line-through truncate">{task.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <span>✓</span>
                            {task.completedAt ? fmtDate(task.completedAt) : fmtDate(task.createdAt)}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                      </div>
                      {task.completionNote && (
                        <div className="mt-2 ml-8 px-3 py-2 bg-white border border-emerald-100 rounded-lg">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            <span className="font-medium text-emerald-600">Note: </span>
                            {task.completionNote}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right: Stats Sidebar ───────────────────────────────────────────── */}
          <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 space-y-4">

            {/* Daily Progress Chart */}
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
                    const createdH  = (day.created  / maxBar) * 100;
                    const completedH = day.created > 0 ? (day.completed / day.created) * 100 : 0;
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        {/* bar column */}
                        <div
                          className={`w-full relative rounded-t-md overflow-hidden transition-all duration-500 ${day.isToday ? "bg-indigo-200" : "bg-gray-200"}`}
                          style={{ height: `${Math.max(createdH, day.created > 0 ? 8 : 4)}%` }}
                        >
                          {/* completed fill from bottom */}
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

              {/* Legend */}
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-300 inline-block" />Created</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-600 inline-block" />Done</span>
              </div>
            </div>

            {/* Efficiency Card */}
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
