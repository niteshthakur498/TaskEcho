# Subtasks Feature

**Branch:** `feat/subtasks`  
**Date:** May 2026  
**Version:** 1.5.0

---

## 1. Functional Changes

Tasks now support optional subtasks — a flat list of smaller work items nested under any pending task.

**Key capabilities:**
- Any existing pending task can have subtasks added at any time before it is completed
- Subtasks are added via a **3-dot menu (⋮)** on the right of each pending task card (after the priority badge)
- Each subtask has its own checkbox; checking it marks only that subtask complete (strikethrough + filled checkbox)
- Unchecking a completed subtask reverts it to pending
- Completing the **main task** cascades completion to all subtasks automatically
- Subtasks can be deleted individually by hovering the row and clicking the × button
- A **progress indicator** (`x/y subtasks`) appears in the task meta line when subtasks exist
- A **warning banner** in the completion confirm panel tells the user how many pending subtasks will be auto-completed
- Completed task cards show subtasks (all checked/strikethrough) in the "More details" section

**User workflow:**
1. Create a task normally
2. Click **⋮** (right side of task card) → **Add Subtask** to open the inline input
3. Type a subtask title and press **Enter** (or click **Add**)
4. Repeat to add more subtasks; press **Escape** or click **×** to close the input
5. Check/uncheck individual subtasks independently
6. Marking the main task complete auto-completes all remaining subtasks

---

## 2. Technical Design

### Backend

**New model:** `Subtask.java`
- Fields: `id` (UUID), `title`, `status` (`PENDING`/`COMPLETED`, reuses `Task.Status`), `createdAt`, `completedAt`
- Mutated directly by the service (no separate repository layer)

**Updated `Task.java`:**
- New field: `List<Subtask> subtasks` (initialized as empty `ArrayList`)
- Getter returns `Collections.unmodifiableList` (read-only for callers)
- Mutation via package-internal methods: `addSubtask(Subtask)`, `removeSubtask(String id)`

**Updated `TaskService.java`:**
- `addSubtask(taskId, title)` — creates and appends a `Subtask`; throws `IllegalStateException` if the parent task is already `COMPLETED`
- `updateSubtask(taskId, subtaskId, status)` — toggles `status` and sets/clears `completedAt`
- `deleteSubtask(taskId, subtaskId)` — removes the subtask by ID
- `update()` cascade — when a task is marked `COMPLETED`, iterates `task.getSubtasks()` and completes any still-pending ones (subtask objects are mutable even through the unmodifiable list view)

**New API endpoints in `TaskController.java`:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tasks/{id}/subtasks` | Add a subtask; body: `{ "title": "..." }` |
| `PUT` | `/tasks/{id}/subtasks/{subtaskId}` | Update subtask status; body: `{ "status": "COMPLETED" }` |
| `DELETE` | `/tasks/{id}/subtasks/{subtaskId}` | Remove a subtask |

All three endpoints return the full updated `Task` object so the frontend can replace the task in state without additional fetches.

### Frontend

**Updated `types.ts`:**
- New `Subtask` interface: `{ id, title, status, createdAt, completedAt }`
- `Task.subtasks: Subtask[]` field added

**New `SubtaskRow` component** (inline in `page.tsx`):
- Renders a small checkbox (4×4, same visual language as the main task checkbox)
- Title text with `line-through text-gray-400` when `COMPLETED`
- Delete button (×) hidden by default, shown on group hover

**State additions to `Home`:**
- `activeMenuId: string | null` — which task's 3-dot menu is open
- `addingSubtaskForId: string | null` — which task is showing the inline subtask input
- `subtaskInput: string` — controlled value for the inline input

**Outside-click handling:**
```typescript
useEffect(() => {
  if (!activeMenuId) return;
  const close = () => setActiveMenuId(null);
  document.addEventListener("click", close);
  return () => document.removeEventListener("click", close);
}, [activeMenuId]);
```
The ⋮ button uses `e.stopPropagation()` to prevent immediately closing the menu it just opened.

**Subtask input UX:**
- Inline input opens below the subtask list inside the task card
- Enter → add and keep input open (user can keep adding)
- Escape / × → close input
- After adding, `subtaskInput` clears but `addingSubtaskForId` stays set

---

## 3. Tech Decisions & Rationale

**Flat list (not recursive subtasks)**
Subtasks are a single level deep. Recursive subtask trees add significant complexity (rendering, completion cascade logic, API design) for minimal benefit in a task manager of this scope.

**Backend cascade, not frontend**
When the main task is marked complete, the cascade to all subtasks happens in `TaskService.update()` and the updated task (with all subtasks now `COMPLETED`) is returned. The frontend simply replaces the task in state — no extra API calls needed.

**Subtask objects mutable through `unmodifiableList`**
`Collections.unmodifiableList` prevents `add/remove` on the list wrapper, but the `Subtask` objects inside are plain mutable POJOs. The service iterates the unmodifiable view and calls `setStatus()`/`setCompletedAt()` directly on each subtask — this is intentional and correct. The `addSubtask`/`removeSubtask` methods on `Task` bypass the wrapper and mutate the backing `ArrayList`.

**Return full `Task` from subtask endpoints**
All three subtask endpoints (`POST`, `PUT`, `DELETE`) return the updated parent `Task`. This means the frontend always has the full consistent state (subtask list, task status) in a single response and can update via `setTasks(prev => prev.map(...))`.

**Add subtask only allowed on PENDING tasks**
Enforced on the backend (`IllegalStateException` if task is `COMPLETED`) and implicitly on the frontend (the ⋮ menu only appears on pending task cards). There is no way to add subtasks to a completed task.

**Subtask delete is instant (no confirm step)**
The main task uses a two-step completion confirmation with a note. Subtask deletion has no such confirmation — it's a lower-stakes destructive action and inline undo support would add complexity. The × delete button is also hidden behind a hover state to reduce accidental clicks.

---

## 4. Implementation Details

**Files created:**
- `backend/src/main/java/com/taskecho/model/Subtask.java`

**Files modified:**
- `backend/src/main/java/com/taskecho/model/Task.java` — added `subtasks` field, `addSubtask`, `removeSubtask`
- `backend/src/main/java/com/taskecho/service/TaskService.java` — added `addSubtask`, `updateSubtask`, `deleteSubtask`; cascade in `update()`
- `backend/src/main/java/com/taskecho/controller/TaskController.java` — three new subtask endpoints
- `frontend/src/app/types.ts` — `Subtask` interface, `Task.subtasks` field
- `frontend/src/app/page.tsx` — `SubtaskRow` component, state, handlers, updated task card JSX

---

## 5. Testing Recommendations

**Backend:**
- `POST /tasks/{id}/subtasks` adds subtask and returns updated task
- `PUT /tasks/{id}/subtasks/{subtaskId}` with `COMPLETED` sets `completedAt`; with `PENDING` clears it
- `DELETE /tasks/{id}/subtasks/{subtaskId}` removes subtask from returned task
- `PUT /tasks/{id}` with `COMPLETED` cascades to all pending subtasks
- `POST /tasks/{id}/subtasks` on a `COMPLETED` task returns 500 with error message

**Frontend:**
- ⋮ menu opens and closes on click; closes on outside click
- "Add Subtask" opens inline input; Enter adds and keeps input open; Escape closes
- Checking a subtask checkbox updates only that subtask (strikethrough)
- Unchecking a completed subtask reverts it
- Completing the main task: warning shows, all subtasks shown as complete in "More details"
- Completed task "More details" shows all subtasks strikethrough
- Subtask progress counter updates in real time (`x/y subtasks`)
- Hover on a subtask row reveals × delete button; clicking removes the subtask

---

## 6. Deployment Notes

No schema migrations (in-memory store). Restarting the backend resets all data including subtasks — same behaviour as the rest of the app.
