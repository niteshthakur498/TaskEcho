package com.taskecho.controller;

import java.util.List;

public class TaskRequest {
    private String       title;
    private String       priority;
    private String       status;
    private String       note;
    private List<String> tags;

    public String       getTitle()    { return title; }
    public String       getPriority() { return priority; }
    public String       getStatus()   { return status; }
    public String       getNote()     { return note; }
    public List<String> getTags()     { return tags; }

    public void setTitle(String title)          { this.title = title; }
    public void setPriority(String priority)    { this.priority = priority; }
    public void setStatus(String status)        { this.status = status; }
    public void setNote(String note)            { this.note = note; }
    public void setTags(List<String> tags)      { this.tags = tags; }
}
