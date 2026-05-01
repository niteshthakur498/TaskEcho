package com.taskecho.model;

import java.time.Instant;
import java.util.UUID;

public class Task {

    public enum Status { PENDING, COMPLETED }

    private final String id;
    private String title;
    private Status status;
    private final Instant createdAt;
    private Instant completedAt;
    private String completionNote;

    public Task(String title) {
        this.id          = UUID.randomUUID().toString();
        this.title       = title;
        this.status      = Status.PENDING;
        this.createdAt   = Instant.now();
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public String  getId()             { return id; }
    public String  getTitle()          { return title; }
    public Status  getStatus()         { return status; }
    public Instant getCreatedAt()      { return createdAt; }
    public Instant getCompletedAt()    { return completedAt; }
    public String  getCompletionNote() { return completionNote; }

    // ── Setters ──────────────────────────────────────────────────────────────

    public void setTitle(String title)                   { this.title = title; }
    public void setStatus(Status status)                 { this.status = status; }
    public void setCompletedAt(Instant completedAt)      { this.completedAt = completedAt; }
    public void setCompletionNote(String completionNote) { this.completionNote = completionNote; }
}
