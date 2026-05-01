"use client";

import { useState } from "react";
import type { Task } from "./types";

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Set up monorepo structure",
    status: "COMPLETED",
    createdAt: "2026-05-01T08:00:00Z",
    completedAt: "2026-05-01T09:00:00Z",
    completionNote: "Done via Claude Code",
  },
  {
    id: "2",
    title: "Build Spring Boot backend",
    status: "COMPLETED",
    createdAt: "2026-05-01T09:00:00Z",
    completedAt: "2026-05-01T10:00:00Z",
    completionNote: null,
  },
  {
    id: "3",
    title: "Build Next.js frontend",
    status: "PENDING",
    createdAt: "2026-05-01T10:00:00Z",
    completedAt: null,
    completionNote: null,
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [input, setInput] = useState("");

  function addTask() {
    const title = input.trim();
    if (!title) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      completedAt: null,
      completionNote: null,
    };

    setTasks((prev) => [task, ...prev]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") addTask();
  }

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

      {/* Task list */}
      {tasks.length === 0 ? (
        <p style={{ color: "#888" }}>No tasks yet. Add one above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {tasks.map((task) => (
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
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: task.status === "COMPLETED" ? "#d1fae5" : "#fef9c3",
                  color: task.status === "COMPLETED" ? "#065f46" : "#713f12",
                  whiteSpace: "nowrap",
                }}
              >
                {task.status}
              </span>

              <span
                style={{
                  flex: 1,
                  textDecoration: task.status === "COMPLETED" ? "line-through" : "none",
                  color: task.status === "COMPLETED" ? "#9ca3af" : "inherit",
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
      )}
    </main>
  );
}
