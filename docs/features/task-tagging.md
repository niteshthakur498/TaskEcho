# Task Tagging

**Status:** In Development  
**Version:** 1.4.0  
**Branch:** `feat/task-tagging`  
**Date:** May 2026

---

## Functional Changes

- When adding a task, a **Tags** button in the form toolbar reveals an inline tag input row (max 3 tags per task)
- Tags are optional — tasks without tags behave exactly as before
- Type a tag name and press **Enter** or **,** to commit it as a chip; **Backspace** on an empty input removes the last chip; **×** removes an individual chip
- The Tags button shows a count badge when tags are staged, and highlights in indigo when the tag panel is open
- Tags are **never shown in the main task card view** — they stay hidden by default to keep the list clean
- Pending task cards show a **"More details"** toggle only when the task has tags; clicking it reveals the tag pills inline
- Completed task cards show the same **"More details"** toggle, revealing completion note + tags together in one expanded section
- Tags are rendered as colour-coded pills cycling through a 5-colour palette (violet, sky, amber, rose, teal)

---

## Technical Design

### Architecture

Both frontend and backend updated. No new endpoints — `POST /tasks` and `PUT /tasks/{id}` are extended with an optional `tags` field.

```
POST /tasks
Body: { "title": "...", "priority": "MEDIUM", "tags": ["design", "frontend"] }

PUT /tasks/{id}
Body: { "tags": ["design", "ux"] }   // can update tags independently
```

### Backend Changes

**`Task.java`** — new field:
```java
private List<String> tags;   // initialised to empty ArrayList in constructor
```
- Getter returns `Collections.unmodifiableList(tags)` to prevent external mutation
- Setter performs a defensive copy: `this.tags = new ArrayList<>(tags)`

**`TaskRequest.java`** (new DTO) — replaces the raw `Map<String, String>` previously used for request bodies. Needed because `Map<String, String>` cannot represent `List<String>`:
```java
public class TaskRequest {
    String title, priority, status, note;
    List<String> tags;
}
```

**`TaskService.java`** — new `sanitiseTags()` helper called before persisting:
- Filters blank entries, trims whitespace, lowercases, deduplicates, limits to 3
- `create()` and `update()` both accept a `List<String> tags` parameter

**`TaskController.java`** — POST and PUT now deserialise via `@RequestBody TaskRequest` instead of `Map<String, String>`.

### Frontend State

| New state | Type | Purpose |
|---|---|---|
| `showDetails` | `boolean` | Whether the tag panel in the add form is expanded |
| `tagInput` | `string` | Current text being typed in the tag input |
| `newTags` | `string[]` | Tags staged for the task being composed |
| `expandedTaskId` | `string \| null` | Which task card's details section is open |
| `tagInputRef` | `RefObject` | Auto-focuses tag input when panel opens |

### Add Form Layout

The form was redesigned into a single unified card with three layers:

```
┌──────────────────────────────────────────────────────┐
│  What do you want to get done?                       │  ← text input
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│  ← dashed divider (only when Tags open)
│  [design ×]  [work ×]  Type a tag and press Enter…  │  ← tag chips + inline input
├──────────────────────────────────────────────────────┤  ← solid toolbar divider
│  Medium priority ▼  │  🏷 Tags [2]    [Add Task →]  │  ← toolbar
└──────────────────────────────────────────────────────┘
```

---

## Tech Decisions & Rationale

### Tags hidden by default in task cards

**Decision:** Tags never appear in the main task card view. A "More details" toggle reveals them only on request.

**Why:** The task list is scanned quickly. Showing tags on every card adds visual noise and shifts attention away from the task title and priority — the two signals that matter most at a glance. Tags are supplementary metadata, not primary context.

### Max 3 tags enforced on both sides

**Decision:** Maximum 3 tags enforced in `TaskService.sanitiseTags()` (server) and the tag input UI (client disables when limit reached).

**Why:** More than 3 tags on a single task is rarely useful and usually indicates the task is too broad. The constraint is a soft nudge towards task clarity, and keeping both sides in sync means a malicious or misconfigured client cannot bypass the limit.

### Tags sanitised server-side (trim, lowercase, deduplicate)

**Decision:** Tags are normalised in `sanitiseTags()` regardless of what the client sends.

**Why:** Prevents "Design", "design", and " design " from being stored as three distinct tags. Lowercasing is a one-way normalisation so filtering and comparison are always case-insensitive without extra logic.

### TaskRequest DTO instead of Map

**Decision:** Replace `Map<String, String>` request bodies with a `TaskRequest` POJO.

**Why:** `Map<String, String>` cannot hold a `List<String>` — Jackson would deserialise an array into `String` and throw. A typed DTO makes the contract explicit, gives IDE support, and sets the pattern for future fields.

### Unified form card rather than a separate floating panel

**Decision:** The tag section expands *inside* the same card as the task input, with a dashed divider separating the two areas. The Add Task button moved into the card's toolbar.

**Why:** The original approach had the tag panel as a separate white card below the input row — visually disconnected, making tags feel like a different feature. Embedding everything in one card with a shared border makes it unambiguous that tags belong to the task being composed.

### Single `expandedTaskId` for both pending and completed cards

**Decision:** One `string | null` state controls which task (pending or completed) has its details expanded, rather than separate states per section.

**Why:** Only one task's details are ever useful at a time. A single state is simpler and naturally ensures expanding one card collapses any previously expanded card.

---

## Implementation Details

**Files modified:**

| File | Change |
|---|---|
| `backend/.../model/Task.java` | Added `List<String> tags` field, unmodifiable getter, defensive-copy setter |
| `backend/.../service/TaskService.java` | Added `sanitiseTags()`, updated `create()` and `update()` signatures |
| `backend/.../controller/TaskController.java` | Switched to `TaskRequest` DTO for POST and PUT |
| `frontend/src/app/types.ts` | Added `tags: string[]` to `Task` interface |
| `frontend/src/app/page.tsx` | New state, `commitTag`/`removeNewTag` helpers, tag input UI, card redesign, task detail toggles |

**Files created:**

| File | Purpose |
|---|---|
| `backend/.../controller/TaskRequest.java` | DTO for POST/PUT request bodies |

---

## Testing Recommendations

- [ ] Add task with no tags — card renders without "More details" toggle
- [ ] Add task with 1 tag — "More details" toggle appears; expands to show tag pill
- [ ] Add task with 3 tags — form disables tag input at limit; backend stores exactly 3
- [ ] Type a duplicate tag — deduplicated server-side; only one chip stored
- [ ] Type tag with mixed case ("Design") — stored as "design"
- [ ] Type tag with leading/trailing spaces — trimmed before storing
- [ ] Press Backspace on empty tag input — removes last chip in add form
- [ ] Click × on a chip — removes that individual tag from staged list
- [ ] Expand "More details" on pending task — shows tag pills; collapses on second click
- [ ] Expand one task's details then expand another — first collapses automatically
- [ ] Complete a task with tags — tags persist on completed card, shown in "More details"
- [ ] "More details" on completed task — shows note (if any) and tags together
- [ ] Revert completed task to pending — tags preserved
- [ ] Send `tags: ["a","b","c","d"]` directly to `POST /tasks` — backend stores only first 3

---

## Deployment Notes

- No database migrations (in-memory store)
- No new environment variables
- No breaking changes — `tags` is optional in both POST and PUT; clients that omit it receive an empty array in the response
- `TaskRequest` DTO is a drop-in replacement for the previous `Map<String, String>` — existing field names (`title`, `priority`, `status`, `note`) are unchanged
