"use client";

import { useState, useEffect } from "react";
import type { Task } from "./types";

const API = "http://localhost:8080/tasks";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<Task[]>;
      })
      .then(setTasks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTask() {
    const title = input.trim();
    if (!title) return;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const created = (await res.json()) as Task;
      setTasks((prev) => [created, ...prev]);
      setInput("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleTaskStatus(task: Task) {
    const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";
    setAnimatingTaskId(task.id);

    try {
      const res = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const updated = (await res.json()) as Task;
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
      setTimeout(() => setAnimatingTaskId(null), 300);
    } catch (err) {
      setError((err as Error).message);
      setAnimatingTaskId(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addTask();
  }

  const pendingTasks = tasks.filter((task) => task.status === "PENDING");
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");
  const totalTasks = tasks.length;

  return (
    <main className="min-h-screen py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            My Tasks
          </h1>
          <p className="text-gray-600 text-sm">
            Stay organized and track your progress
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
            <p className="text-red-800 text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {/* Add Task Input */}
        <div className="mb-8 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="I want to..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <button
              onClick={addTask}
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-gray-500 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary mb-3"></div>
              <p className="text-sm">Loading tasks…</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && totalTasks === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <p className="text-gray-400 text-sm mt-2">Add one above to get started</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && totalTasks > 0 && (
          <div className="space-y-8">
            {/* Pending Tasks Section */}
            {pendingTasks.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">
                    Pending Tasks
                    <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                      {pendingTasks.length}
                    </span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {pendingTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`task-card flex items-center gap-4 transition-all duration-300 ${
                        animatingTaskId === task.id
                          ? "opacity-50 scale-95"
                          : "opacity-100 scale-100"
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "slide-up 0.3s ease-out",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleTaskStatus(task)}
                        className="w-5 h-5 text-primary bg-white border-2 border-gray-300 rounded-full cursor-pointer transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label={`Mark ${task.title} as complete`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">
                          {task.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(task.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">
                    Completed Tasks
                    <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-success text-white text-xs font-bold">
                      {completedTasks.length}
                    </span>
                  </h2>
                </div>
                <div className="space-y-3">
                  {completedTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`task-card flex items-center gap-4 bg-success-light bg-opacity-40 border-success border-opacity-30 transition-all duration-300 ${
                        animatingTaskId === task.id
                          ? "opacity-50 scale-95"
                          : "opacity-100 scale-100"
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "slide-up 0.3s ease-out",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => toggleTaskStatus(task)}
                        className="w-5 h-5 text-success bg-white border-2 border-success rounded-full cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2"
                        aria-label={`Mark ${task.title} as pending`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 line-through truncate">
                          {task.title}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : new Date(task.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Footer Stats */}
        {!loading && totalTasks > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {totalTasks}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Total Tasks
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-success">
                  {completedTasks.length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <p className="text-2xl sm:text-3xl font-bold text-gray-400">
                  {totalTasks > 0
                    ? Math.round(
                        (completedTasks.length / totalTasks) * 100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Progress
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
