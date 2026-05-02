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
        return taskService.update(id, status, priority, body.getNote(), body.getTags(), body.getTitle());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/stats/weekly")
    public List<Map<String, Object>> weeklyStats() {
        return taskService.getWeeklyStats();
    }

    // ── Subtask endpoints ─────────────────────────────────────────────────────

    @PostMapping("/{id}/subtasks")
    @ResponseStatus(HttpStatus.CREATED)
    public Task addSubtask(@PathVariable String id, @RequestBody TaskRequest body) {
        return taskService.addSubtask(id, body.getTitle());
    }

    @PutMapping("/{id}/subtasks/{subtaskId}")
    public Task updateSubtask(
        @PathVariable String id,
        @PathVariable String subtaskId,
        @RequestBody TaskRequest body
    ) {
        Task.Status status = body.getStatus() != null
            ? Task.Status.valueOf(body.getStatus().toUpperCase())
            : null;
        return taskService.updateSubtask(id, subtaskId, status, body.getTitle());
    }

    @DeleteMapping("/{id}/subtasks/{subtaskId}")
    public Task deleteSubtask(@PathVariable String id, @PathVariable String subtaskId) {
        return taskService.deleteSubtask(id, subtaskId);
    }
}
