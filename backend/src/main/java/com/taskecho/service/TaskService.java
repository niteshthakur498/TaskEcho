package com.taskecho.service;

import com.taskecho.model.Subtask;
import com.taskecho.model.Task;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;

@Service
public class TaskService {

    private final Map<String, Task> store = new ConcurrentHashMap<>();

    private static final int MAX_TAGS = 3;

    private List<String> sanitiseTags(List<String> raw) {
        if (raw == null) return List.of();
        return raw.stream()
            .filter(t -> t != null && !t.isBlank())
            .map(t -> t.trim().toLowerCase())
            .distinct()
            .limit(MAX_TAGS)
            .toList();
    }

    public Task create(String title, Task.Priority priority, List<String> tags) {
        Task task = new Task(title, priority);
        task.setTags(sanitiseTags(tags));
        store.put(task.getId(), task);
        return task;
    }

    public List<Task> findAll() {
        return new ArrayList<>(store.values());
    }

    public void deleteTask(String id) {
        if (store.remove(id) == null) throw new IllegalArgumentException("Task not found: " + id);
    }

    public Task update(String id, Task.Status status, Task.Priority priority, String note, List<String> tags, String title) {
        Task task = store.get(id);
        if (task == null) throw new IllegalArgumentException("Task not found: " + id);

        if (title != null && !title.isBlank()) {
            task.setTitle(title.trim());
        }
        if (status != null) {
            task.setStatus(status);
            if (status == Task.Status.COMPLETED) {
                task.setCompletedAt(Instant.now());
                task.setCompletionNote(note);
                // Cascade completion to all pending subtasks
                task.getSubtasks().forEach(s -> {
                    if (s.getStatus() != Task.Status.COMPLETED) {
                        s.setStatus(Task.Status.COMPLETED);
                        s.setCompletedAt(Instant.now());
                    }
                });
            } else {
                task.setCompletedAt(null);
                task.setCompletionNote(null);
            }
        }
        if (priority != null) {
            task.setPriority(priority);
        }
        if (tags != null) {
            task.setTags(sanitiseTags(tags));
        }
        return task;
    }

    // ── Subtask operations ────────────────────────────────────────────────────

    public Task addSubtask(String taskId, String title) {
        Task task = store.get(taskId);
        if (task == null) throw new IllegalArgumentException("Task not found: " + taskId);
        if (task.getStatus() == Task.Status.COMPLETED) {
            throw new IllegalStateException("Cannot add subtask to a completed task");
        }
        task.addSubtask(new Subtask(title.trim()));
        return task;
    }

    public Task updateSubtask(String taskId, String subtaskId, Task.Status status, String title) {
        Task task = store.get(taskId);
        if (task == null) throw new IllegalArgumentException("Task not found: " + taskId);

        Subtask subtask = task.getSubtasks().stream()
            .filter(s -> s.getId().equals(subtaskId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Subtask not found: " + subtaskId));

        if (title != null && !title.isBlank()) {
            subtask.setTitle(title.trim());
        }
        if (status != null) {
            subtask.setStatus(status);
            subtask.setCompletedAt(status == Task.Status.COMPLETED ? Instant.now() : null);
        }
        return task;
    }

    public Task deleteSubtask(String taskId, String subtaskId) {
        Task task = store.get(taskId);
        if (task == null) throw new IllegalArgumentException("Task not found: " + taskId);
        task.removeSubtask(subtaskId);
        return task;
    }

    // ── Weekly stats ──────────────────────────────────────────────────────────

    public List<Map<String, Object>> getWeeklyStats() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        List<Task> allTasks = new ArrayList<>(store.values());

        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate day = monday.plusDays(i);
            long created = allTasks.stream()
                .filter(t -> t.getCreatedAt().atZone(zone).toLocalDate().equals(day))
                .count();
            long completed = allTasks.stream()
                .filter(t -> t.getCompletedAt() != null &&
                             t.getCompletedAt().atZone(zone).toLocalDate().equals(day))
                .count();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("day", dayNames[i]);
            entry.put("date", day.toString());
            entry.put("isToday", day.equals(today));
            entry.put("created", created);
            entry.put("completed", completed);
            result.add(entry);
        }
        return result;
    }
}
