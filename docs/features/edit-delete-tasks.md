# Edit & Delete Tasks / Subtasks

**Branch:** `feat/edit-delete-tasks`  
**Version:** 1.6.0  
**Date:** May 2026  
**Status:** Released

---

## 1. Functional Changes

Users can now rename and permanently delete tasks and subtasks without leaving the task list.

### Task editing
- Open the 3-dot menu (⋮) on any pending task card and choose **Edit title**
- The task title area transforms into an inline text input
- Save: press **Enter** or click away (blur)
- Cancel: press **Escape**

### Task deletion
- Open the 3-dot menu (⋮) on any pending task card and choose **Delete**
- A red confirmation strip appears at the bottom of the card
- Confirm with **Delete** or dismiss with **Cancel**
- Completed task cards have a direct trash-icon button; one click removes the task immediately (no extra confirmation since the task is already done)

### Subtask editing
- Click directly on any **non-completed** subtask title to enter edit mode
- The title text becomes an inline input
- Save: press **Enter** or blur; Cancel: press **Escape**
- Completed subtasks are not editable (they are historical records)

### Subtask deletion (unchanged)
- The existing hover-revealed **×** button on each subtask row continues to delete immediately

---

## 2. Technical Design

### Backend

| Layer | Change |
|-------|--------|
| `TaskService` | `deleteTask(id)` — removes from the in-memory store; `update()` signature extended with `title` param; `updateSubtask()` signature extended with `title` param |
| `TaskController` | New `DELETE /tasks/{id}` endpoint (returns 204); `PUT /tasks/{id}` and `PUT /tasks/{id}/subtasks/{stId}` now forward `body.getTitle()` to the service |
| `TaskRequest` | No change — `title` field already existed |

#### New / modified endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `DELETE` | `/tasks/{id}` | Permanently delete a task and all its subtasks |
| `PUT` | `/tasks/{id}` | Extended — now also accepts `{ title }` to rename |
| `PUT` | `/tasks/{id}/subtasks/{stId}` | Extended — now also accepts `{ title }` to rename |

### Frontend (`page.tsx`)

**New state:**
```typescript
const [editingTaskId,   setEditingTaskId]   = useState<string | null>(null);
const [editTaskInput,   setEditTaskInput]   = useState("");
const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
```

**New functions:**
- `saveTaskEdit(taskId)` — `PUT /tasks/{id}` with `{ title }`; no-ops if title is empty or unchanged
- `deleteTask(taskId)` — `DELETE /tasks/{id}`; removes task from local state and refreshes stats
- `editSubtask(taskId, subtaskId, title)` — `PUT /tasks/{id}/subtasks/{stId}` with `{ title }`

**`SubtaskRow` component changes:**
- Added `onEdit` prop
- Added local `editing` / `editVal` state; no lifting of edit state to parent needed
- Title `<span>` gains `onClick` handler (no-op when subtask is completed)
- Renders an `<input>` in place of the span while editing

---

## 3. Tech Decisions & Rationale

### Inline editing over a modal
A modal interrupts the user's flow and adds visual overhead for a simple text rename. Inline editing (input replacing the title in-place) is faster and keeps context. The pattern is already established in the subtask-add flow.

### Confirmation for pending task delete, direct delete for completed
Pending tasks represent active work — accidental deletion would lose in-progress context. A one-step confirmation strip (similar to the existing completion note panel) adds a safety gate without a modal. Completed tasks are historical; deleting them is a deliberate housekeeping action, so a direct single-click is appropriate.

### Local state for subtask edit inside `SubtaskRow`
Lifting subtask edit state up to `Home` would require two more state variables and passing them as props through every render cycle. Since editing is a short-lived, self-contained interaction, local state in `SubtaskRow` is simpler and correct.

### No soft-delete / undo
The current data layer is in-memory (no persistence). Soft-delete would need a `deletedAt` timestamp and a filtered view — complexity not warranted until a persistent store is introduced. A `TODO:` in the planned features section tracks this upgrade path.

---

## 4. Implementation Details

### Files modified

| File | Change |
|------|--------|
| `backend/src/main/java/com/taskecho/controller/TaskController.java` | Added `DELETE /tasks/{id}`; forwarded `title` to service in both PUT handlers |
| `backend/src/main/java/com/taskecho/service/TaskService.java` | Added `deleteTask()`; added `title` parameter to `update()` and `updateSubtask()` |
| `frontend/src/app/page.tsx` | New state + functions; updated `SubtaskRow`; updated 3-dot menu; inline edit/delete UI |

### Key code paths

- `SubtaskRow.commitEdit()` — trims input, calls `onEdit` only if value changed, resets on empty
- `saveTaskEdit()` — guards against empty/unchanged title before making the network call
- `deleteTask()` — calls `refreshStats()` after removal so the weekly chart stays accurate

---

## 5. Testing Recommendations

### Frontend
- [ ] Edit a pending task title — verify saved on Enter and blur
- [ ] Press Escape during edit — verify title reverts to original
- [ ] Submit an empty title during edit — verify no API call, title unchanged
- [ ] Delete a pending task — verify confirmation strip appears and task is removed on confirm
- [ ] Cancel delete on pending task — verify task remains
- [ ] Delete a completed task via trash icon — verify immediate removal
- [ ] Click a pending subtask title — verify inline edit activates
- [ ] Click a completed subtask title — verify no edit mode activates
- [ ] Edit subtask title — verify changes persist and display correctly

### Backend
- [ ] `DELETE /tasks/{id}` with valid id — returns 204
- [ ] `DELETE /tasks/{id}` with unknown id — returns 4xx
- [ ] `PUT /tasks/{id}` with `{ title }` — task renamed, other fields unchanged
- [ ] `PUT /tasks/{id}` with blank title — title unchanged (service ignores blank)
- [ ] `PUT /tasks/{id}/subtasks/{stId}` with `{ title }` — subtask renamed
- [ ] `PUT /tasks/{id}/subtasks/{stId}` with `{ status }` only — subtask title unchanged

---

## 6. Deployment Notes

- No database migrations (in-memory store)
- No breaking changes to existing API consumers — `title` in PUT bodies is additive/optional
- Backend requires restart to pick up Java changes; frontend hot-reloads automatically
