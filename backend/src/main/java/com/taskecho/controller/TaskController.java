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
    public Task create(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        Task.Priority priority = body.containsKey("priority")
            ? Task.Priority.valueOf(body.get("priority").toUpperCase())
            : Task.Priority.MEDIUM;
        return taskService.create(title, priority);
    }

    @GetMapping
    public List<Task> list() {
        return taskService.findAll();
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable String id, @RequestBody Map<String, String> body) {
        Task.Status status = body.containsKey("status")
            ? Task.Status.valueOf(body.get("status").toUpperCase())
            : null;
        Task.Priority priority = body.containsKey("priority")
            ? Task.Priority.valueOf(body.get("priority").toUpperCase())
            : null;
        return taskService.update(id, status, priority);
    }

    @GetMapping("/stats/weekly")
    public List<Map<String, Object>> weeklyStats() {
        return taskService.getWeeklyStats();
    }
}
