package com.taskecho.model;

import java.time.Instant;
import java.util.UUID;

public class Subtask {

    private final String    id;
    private String          title;
    private Task.Status     status;
    private final Instant   createdAt;
    private Instant         completedAt;

    public Subtask(String title) {
        this.id        = UUID.randomUUID().toString();
        this.title     = title;
        this.status    = Task.Status.PENDING;
        this.createdAt = Instant.now();
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public String      getId()          { return id; }
    public String      getTitle()       { return title; }
    public Task.Status getStatus()      { return status; }
    public Instant     getCreatedAt()   { return createdAt; }
    public Instant     getCompletedAt() { return completedAt; }

    // ── Setters ──────────────────────────────────────────────────────────────

    public void setTitle(String title)              { this.title = title; }
    public void setStatus(Task.Status status)       { this.status = status; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
