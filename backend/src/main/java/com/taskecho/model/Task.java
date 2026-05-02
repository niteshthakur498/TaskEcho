package com.taskecho.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Task {

    public enum Status   { PENDING, COMPLETED }
    public enum Priority { LOW, MEDIUM, HIGH }

    private final String   id;
    private String         title;
    private Status         status;
    private Priority       priority;
    private final Instant  createdAt;
    private Instant        completedAt;
    private String         completionNote;
    private List<String>   tags;
    private List<Subtask>  subtasks;

    public Task(String title, Priority priority) {
        this.id        = UUID.randomUUID().toString();
        this.title     = title;
        this.status    = Status.PENDING;
        this.priority  = priority != null ? priority : Priority.MEDIUM;
        this.createdAt = Instant.now();
        this.tags      = new ArrayList<>();
        this.subtasks  = new ArrayList<>();
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public String        getId()             { return id; }
    public String        getTitle()          { return title; }
    public Status        getStatus()         { return status; }
    public Priority      getPriority()       { return priority; }
    public Instant       getCreatedAt()      { return createdAt; }
    public Instant       getCompletedAt()    { return completedAt; }
    public String        getCompletionNote() { return completionNote; }
    public List<String>  getTags()           { return Collections.unmodifiableList(tags); }
    public List<Subtask> getSubtasks()       { return Collections.unmodifiableList(subtasks); }

    // ── Setters ──────────────────────────────────────────────────────────────

    public void setTitle(String title)                   { this.title = title; }
    public void setStatus(Status status)                 { this.status = status; }
    public void setPriority(Priority priority)           { this.priority = priority; }
    public void setCompletedAt(Instant completedAt)      { this.completedAt = completedAt; }
    public void setCompletionNote(String completionNote) { this.completionNote = completionNote; }
    public void setTags(List<String> tags)               { this.tags = tags != null ? new ArrayList<>(tags) : new ArrayList<>(); }

    // ── Subtask mutation (called by service only) ─────────────────────────────

    public void addSubtask(Subtask subtask)       { subtasks.add(subtask); }
    public void removeSubtask(String subtaskId)   { subtasks.removeIf(s -> s.getId().equals(subtaskId)); }
}
