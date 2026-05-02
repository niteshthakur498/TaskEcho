# TaskEcho Features Changelog

## Overview

This document tracks all features implemented in TaskEcho, their status, and when they were added.

---

## ✅ Released Features

### 1. Task Management (Core)
**Status:** Released  
**Version:** 0.0.1  
**Branch:** master  
**Date:** May 2026

**Features:**
- Create new tasks with title
- View all tasks in a list
- Display task creation date
- Status badge (PENDING/COMPLETED)

**Details:** [Core Task Management](features/core-task-management.md)

---

### 2. Task Completion Checkbox
**Status:** Released  
**Version:** 1.0.0  
**Branch:** master  
**Merged:** [Pending User Confirmation]  
**Date:** May 2026

**Features:**
- Mark tasks as completed via checkbox (not a feature flag)
- Switch task status between PENDING and COMPLETED states
- Separate UI sections for Pending and Completed tasks
- Task count in each section header
- Visual styling for completed tasks (strikethrough, gray text)
- Automatic `completedAt` timestamp on completion

**Details:** [Task Completion Feature](features/task-completion.md)

**API Changes:**
- New: `PUT /tasks/{id}` — Update task status

---

### 3. Modern UI/UX Redesign
**Status:** In Development  
**Version:** 1.1.0  
**Branch:** `feat/ui-redesign`  
**Date:** May 2026

**Features:**
- Modern, clean interface with Tailwind CSS
- Centered max-width layout with soft gradient background
- Card-based task design with subtle shadows and hover effects
- Smooth animations (slide-up, fade-in) for task transitions
- Purple + green color scheme (primary actions, success states)
- Completed tasks highlighted with green styling + strike-through
- Progress tracking footer (total, completed, percentage)
- Responsive design (mobile 375px, desktop 1280px+)
- Enhanced input field with focus states
- Loading spinner and error state handling
- Empty state with emoji guidance

**Technical Stack:**
- Tailwind CSS 3.4.1 for utility-first styling
- Custom animations in `tailwind.config.js`
- PostCSS for CSS processing
- No heavy component libraries (Material UI, Bootstrap excluded)

**Details:** [UI Redesign Feature](features/ui-redesign.md)

**Files Modified:**
- `frontend/package.json` — Added Tailwind, PostCSS, Autoprefixer
- `frontend/src/app/page.tsx` — Complete UI rewrite with Tailwind classes
- `frontend/src/app/layout.tsx` — Imported global styles

**Files Created:**
- `frontend/tailwind.config.js` — Theme config with custom colors/animations
- `frontend/postcss.config.js` — PostCSS plugin configuration
- `frontend/src/app/globals.css` — Tailwind directives + custom components

---

## 🚀 Upcoming Features

### Task Deletion
**Status:** Planned  
**Priority:** High  
**Estimated Version:** 1.1.0

- Delete completed tasks
- Soft delete (archive instead of hard delete)
- Undo delete for 30 seconds
- Bulk delete completed tasks

---

### Task Editing
**Status:** Planned  
**Priority:** High  
**Estimated Version:** 1.2.0

- Edit task title after creation
- Edit task description/notes
- Show last modified date
- Edit history (optional)

---

### Task Tagging
**Status:** In Development  
**Version:** 1.4.0  
**Branch:** `feat/task-tagging`  
**Date:** May 2026

**Features:**
- Add up to 3 optional tags per task via an expandable tag panel in the add form
- Tags hidden from main task card view — revealed only via "More details" toggle
- Colour-coded tag pills with inline chip editing (Enter/comma to add, backspace/× to remove)
- Server-side sanitisation: trimmed, lowercased, deduplicated, max-3 enforced
- Unified add-task form card (input + tags + toolbar in one cohesive UI)

**Details:** [Task Tagging Feature](features/task-tagging.md)

**API Changes:**
- Extended: `POST /tasks` — now accepts optional `tags: string[]`
- Extended: `PUT /tasks/{id}` — now accepts optional `tags: string[]`

---

### Task Filtering & Search
**Status:** Planned  
**Priority:** Medium  
**Estimated Version:** 1.4.0

- Search tasks by title
- Filter by status (pending/completed)
- Filter by date range
- Filter by tags
- Saved filters/views

---

### Recurring Tasks
**Status:** Planned  
**Priority:** Low  
**Estimated Version:** 2.0.0

- Set task recurrence (daily, weekly, monthly)
- Auto-generate next task on completion
- Skip single occurrence option
- Recurrence rules customization

---

### Task Priority Levels
**Status:** Planned  
**Priority:** Medium  
**Estimated Version:** 1.5.0

- Set priority: Low, Medium, High, Urgent
- Sort by priority
- Visual indicators for priority
- Filter by priority range

---

## 📋 Feature Request Process

When proposing a new feature:

1. **Create an issue** with feature description
2. **Document in this file** with Status: Proposed
3. **Discuss trade-offs** with team
4. **Create feature branch** with format: `feat/feature-name`
5. **Write feature documentation** in `docs/features/feature-name.md`
6. **Open pull request** and request review
7. **Merge to master** with documentation
8. **Update this file** with release details

---

## 🔄 Version History

| Version | Date | Features | Status |
|---------|------|----------|--------|
| 0.0.1 | May 2026 | Core task management | Released |
| 1.0.0 | May 2026 | Task completion toggle | Merged (Pending) |
| 1.1.0 | May 2026 | Modern UI redesign (Tailwind) | In Development |
| 1.2.0 | TBD | Task deletion | Planned |
| 1.3.0 | TBD | Task editing | Planned |
| 1.4.0 | May 2026 | Task tagging (max 3, expandable details) | In Development |
| 1.5.0 | TBD | Advanced filtering | Planned |
| 1.6.0 | TBD | Priority levels | Planned |
| 2.0.0 | TBD | Recurring tasks | Planned |

---

## 📞 Reporting Issues

Found a bug or problem with a feature?

1. Check if issue already exists
2. Create a new issue with: `fix/description`
3. Include: Steps to reproduce, expected behavior, actual behavior
4. Reference feature documentation if applicable

---

## 📚 Documentation Links

- [Task Completion Feature](features/task-completion.md) — Detailed tech design and decisions
- [Development Standards](../CLAUDE.md) — Code standards and git workflow
- [Project README](../README.md) — General project information
