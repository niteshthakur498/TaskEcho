package com.taskecho.service;

import com.taskecho.model.Task;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskService {

    private final Map<String, Task> store = new ConcurrentHashMap<>();

    public Task create(String title, Task.Priority priority) {
        Task task = new Task(title, priority);
        store.put(task.getId(), task);
        return task;
    }

    public List<Task> findAll() {
        return new ArrayList<>(store.values());
    }

    public Task update(String id, Task.Status status, Task.Priority priority, String note) {
        Task task = store.get(id);
        if (task == null) throw new IllegalArgumentException("Task not found: " + id);

        if (status != null) {
            task.setStatus(status);
            if (status == Task.Status.COMPLETED) {
                task.setCompletedAt(Instant.now());
                task.setCompletionNote(note);
            } else {
                task.setCompletedAt(null);
                task.setCompletionNote(null);
            }
        }
        if (priority != null) {
            task.setPriority(priority);
        }
        return task;
    }

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
