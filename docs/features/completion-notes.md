# Completion Notes

**Status:** In Development  
**Version:** 1.3.0  
**Branch:** `feat/completion-notes`  
**Date:** May 2026

---

## Functional Changes

- When a user clicks the checkbox on a pending task, the task card **expands inline** to reveal a note panel instead of completing immediately
- The note panel contains a textarea with placeholder: *"What did you accomplish? Any blockers? (optional)"*
- The textarea **auto-focuses** so the user can start typing immediately
- **Enter** submits the note and completes the task; **Shift+Enter** adds a newline; **Escape** cancels
- Two explicit action buttons: **✓ Mark Complete** (indigo) and **Cancel** (gray)
- The note is optional — clicking Mark Complete with an empty textarea completes the task without a note
- Completed task cards display the note in a subtle inset box beneath the title when one is present
- Reverting a completed task back to pending (clicking the green checkbox) **clears the note**

---

## Technical Design

### Architecture

No new endpoints. The existing `PUT /tasks/{id}` now accepts an optional `note` field:

```
PUT /tasks/{id}
Body: { "status": "COMPLETED", "note": "Optional note text" }
```

The `completionNote` field already existed on the `Task` model — this feature wires it up end-to-end for the first time.

### Backend Changes

**`TaskService.update()`** — signature updated to accept `String note`:
- When `status == COMPLETED`: saves `note` to `task.completionNote` (null if omitted)
- When `status == PENDING`: clears `completionNote` to null (reverting removes the note)

**`TaskController.PUT /tasks/{id}`** — reads `note` from request body with `getOrDefault("note", null)` and passes it to the service.

### Frontend State

| New state | Type | Purpose |
|---|---|---|
| `confirmingId` | `string \| null` | ID of the task whose note panel is open |
| `noteInput` | `string` | Current textarea value |

### Function Split

The previous single `toggleStatus()` was split into three focused functions:

| Function | Trigger | Does |
|---|---|---|
| `requestComplete(task)` | Checkbox click on PENDING task | Sets `confirmingId`, clears `noteInput` |
| `completeWithNote(task)` | Mark Complete button / Enter key | Calls API with `status + note`, clears `confirmingId` |
| `revertToPending(task)` | Checkbox click on COMPLETED task | Calls API with `status: PENDING`, backend clears note |
| `cancelConfirm()` | Cancel button / Escape key | Clears `confirmingId` and `noteInput`, no API call |

### UX Detail — Card Expansion

When `confirmingId === task.id` the card:
- Gets an indigo border and shadow (`border-indigo-300 shadow-indigo-100`) to signal active state
- Checkbox button turns light indigo to show it is "engaged"
- A border-top divider separates the note panel from the task row
- The textarea renders with `autoFocus` so no extra click is needed

---

## Tech Decisions & Rationale

### Inline panel vs modal

**Decision:** Expand the task card inline rather than open a modal dialog.

**Why:** A modal interrupts the user's spatial context and requires an overlay. Inline expansion keeps the note visually attached to the task, making the connection clear. It also works better on mobile where modals can obscure the keyboard.

### Note is optional, no separate "skip" button

**Decision:** Mark Complete works with an empty textarea; there is no separate "Complete without note" button.

**Why:** Adding a second button creates a decision burden for every completion. Making the single button work for both cases (empty = no note, filled = with note) keeps the UI minimal. The `(optional)` label communicates this clearly.

### Note cleared on revert

**Decision:** When a task is reverted to PENDING, its `completionNote` is cleared server-side.

**Why:** A note written for a completion attempt is no longer accurate if the task is uncompleted. Preserving it would show stale context the next time the task is completed. Starting fresh is cleaner.

### Enter submits, Shift+Enter newlines

**Decision:** Plain Enter submits the form; Shift+Enter inserts a line break.

**Why:** Notes are expected to be short (one or two sentences). The dominant use case is quick submission, so Enter-to-submit is the right default. Power users who want multi-line notes can use Shift+Enter.

---

## Implementation Details

**Files modified:**

| File | Change |
|---|---|
| `backend/.../service/TaskService.java` | `update()` signature + note save/clear logic |
| `backend/.../controller/TaskController.java` | Read `note` from request body |
| `frontend/src/app/page.tsx` | State, function split, inline note panel JSX, note display on completed cards |

**No changes to:** `types.ts` (Task already had `completionNote: string | null`), `globals.css`, `layout.tsx`, any backend model file.

---

## Testing Recommendations

- [ ] Click checkbox on pending task — note panel expands, textarea focuses
- [ ] Type a note, press **Enter** — task moves to Completed, note appears on card
- [ ] Click checkbox on pending task, leave textarea empty, click **Mark Complete** — task completes with no note shown
- [ ] Click checkbox on pending task, press **Escape** — panel collapses, task stays pending
- [ ] Click checkbox on pending task, click **Cancel** — panel collapses, task stays pending
- [ ] Click the green checkbox on a completed task — task reverts to pending, note is gone
- [ ] Complete the same task again with a different note — new note shown
- [ ] Very long note — textarea should not overflow card
- [ ] Mobile (375px) — panel fits within card width, Mark Complete button is tappable

---

## Deployment Notes

- No database migrations (in-memory store)
- No new environment variables
- No breaking changes — `note` field in `PUT /tasks/{id}` is optional; existing clients that omit it continue to work
