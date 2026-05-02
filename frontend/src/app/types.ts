export type TaskStatus   = "PENDING" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Subtask {
  id:          string;
  title:       string;
  status:      TaskStatus;
  createdAt:   string;
  completedAt: string | null;
}

export interface Task {
  id:             string;
  title:          string;
  status:         TaskStatus;
  priority:       TaskPriority;
  createdAt:      string;
  completedAt:    string | null;
  completionNote: string | null;
  tags:           string[];
  subtasks:       Subtask[];
}

export interface DayStat {
  day:       string;
  date:      string;
  isToday:   boolean;
  created:   number;
  completed: number;
}
