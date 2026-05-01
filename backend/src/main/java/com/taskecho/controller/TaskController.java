package com.taskecho.controller;

import com.taskecho.model.Task;
import com.taskecho.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
        return taskService.create(body.get("title"));
    }

    @GetMapping
    public List<Task> list() {
        return taskService.findAll();
    }
}
