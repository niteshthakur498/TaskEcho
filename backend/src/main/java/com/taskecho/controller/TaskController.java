package com.taskecho.controller;

import com.taskecho.model.Task;
import com.taskecho.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@RequestBody TaskRequest body) {
        Task.Priority priority = body.getPriority() != null
            ? Task.Priority.valueOf(body.getPriority().toUpperCase())
            : Task.Priority.MEDIUM;
        return taskService.create(body.getTitle(), priority, body.getTags());
    }

    @GetMapping
    public List<Task> list() {
        return taskService.findAll();
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable String id, @RequestBody TaskRequest body) {
        Task.Status status = body.getStatus() != null
            ? Task.Status.valueOf(body.getStatus().toUpperCase())
            : null;
        Task.Priority priority = body.getPriority() != null
            ? Task.Priority.valueOf(body.getPriority().toUpperCase())
            : null;
        return taskService.update(id, status, priority, body.getNote(), body.getTags());
    }

    @GetMapping("/stats/weekly")
    public List<Map<String, Object>> weeklyStats() {
        return taskService.getWeeklyStats();
    }
}
