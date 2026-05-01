package com.taskecho.service;

import com.taskecho.model.Task;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskService {

    private final Map<String, Task> store = new ConcurrentHashMap<>();

    public Task create(String title) {
        Task task = new Task(title);
        store.put(task.getId(), task);
        return task;
    }

    public List<Task> findAll() {
        return new ArrayList<>(store.values());
    }

    public Task updateStatus(String id, Task.Status status) {
        Task task = store.get(id);
        if (task == null) {
            throw new IllegalArgumentException("Task not found: " + id);
        }
        task.setStatus(status);
        if (status == Task.Status.COMPLETED) {
            task.setCompletedAt(Instant.now());
        }
        return task;
    }
}
