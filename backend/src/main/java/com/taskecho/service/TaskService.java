package com.taskecho.service;

import com.taskecho.model.Task;
import org.springframework.stereotype.Service;

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
}
