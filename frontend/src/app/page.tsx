"use client";

import { useState, useEffect } from "react";
import type { Task } from "./types";

const API = "http://localhost:8080/tasks";

export default function Home() {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

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
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addTask();
  }

  // Separate tasks by status
  const pendingTasks = tasks.filter((task) => task.status === "PENDING");
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");

  return (
    <main>
      <h1 style={{ marginBottom: 24 }}>TaskEcho</h1>

      {/* Add task */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="New task title..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: "8px 12px", fontSize: 16, border: "1px solid #ccc", borderRadius: 4 }}
        />
        <button
          onClick={addTask}
          style={{ padding: "8px 16px", fontSize: 16, cursor: "pointer", borderRadius: 4, border: "1px solid #ccc" }}
        >
          Add
        </button>
      </div>

      {/* Feedback */}
      {error   && <p style={{ color: "#dc2626", marginBottom: 16 }}>Error: {error}</p>}
      {loading && <p style={{ color: "#888" }}>Loading tasks…</p>}

      {/* Empty state */}
      {!loading && !error && tasks.length === 0 && (
        <p style={{ color: "#888" }}>No tasks yet. Add one above.</p>
      )}

      {/* Pending Tasks Section */}
      {!loading && pendingTasks.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#1f2937" }}>
            Pending Tasks ({pendingTasks.length})
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {pendingTasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleTaskStatus(task)}
                  style={{ cursor: "pointer", width: 20, height: 20 }}
                  aria-label={`Mark ${task.title} as complete`}
                />

                <span
                  style={{
                    flex: 1,
                    color: "inherit",
                  }}
                >
                  {task.title}
                </span>

                <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Completed Tasks Section */}
      {!loading && completedTasks.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#1f2937" }}>
            Completed Tasks ({completedTasks.length})
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {completedTasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleTaskStatus(task)}
                  style={{ cursor: "pointer", width: 20, height: 20 }}
                  aria-label={`Mark ${task.title} as pending`}
                />

                <span
                  style={{
                    flex: 1,
                    textDecoration: "line-through",
                    color: "#9ca3af",
                  }}
                >
                  {task.title}
                </span>

                <span style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleDateString()
                    : new Date(task.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
