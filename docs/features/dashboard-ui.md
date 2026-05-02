# Dashboard UI — Hero Banner, Weekly Chart & Priority Filtering

**Status:** In Development  
**Version:** 1.2.0  
**Branch:** `feat/dashboard-ui`  
**Date:** May 2026

---

## Functional Changes

### Hero Banner
- Displays a time-based greeting: "Good morning", "Good afternoon", "Good evening", or "Good night"
- Shows a live count of pending tasks ("You have N pending tasks for today")
- Renders a decorative semi-transparent preview of the task list on the right side of the banner

### Priority Levels on Tasks
- Every task now has a priority: **Low**, **Medium** (default), or **High**
- Priority is set at creation via a dropdown in the add-task input row
- Tasks display a colour-coded priority tag: `#High` (red), `#Medium` (indigo), `#Low` (green)

### Filter & Sort Controls
- **Priority View** toggle: sorts pending tasks High → Medium → Low; button fills when active
- **Today** toggle: filters pending tasks to those created today; button fills when active
- Filters compose — both can be active simultaneously

### Daily Progress Chart
- Bar chart in the right sidebar showing Mon–Sun of the current week
- Bar height reflects how many tasks were **created** that day
- The filled (darker) portion of each bar reflects how many were **completed**
- Today's bar is highlighted in indigo-600; other days use indigo-400/gray-200

### Efficiency Card
- Shows the overall completion percentage (completed / total × 100)
- Includes an animated progress bar that updates in real time after each toggle

### View All / Show Less
- Pending list is capped at 3 items by default
- "View All →" button appears when there are more than 3; "Show less" collapses back

### Two-Column Layout
- On desktop (lg+): task list on the left, stats sidebar on the right
- On mobile: stacks to a single column

---

## Technical Design

### Architecture Overview

```
Browser
  └── page.tsx (React, "use client")
        ├── GET /tasks          → renders task cards
        ├── GET /tasks/stats/weekly → renders Daily Progress chart
        ├── POST /tasks         → add task (with priority)
        └── PUT /tasks/{id}     → toggle status or update priority

Backend (Spring Boot, port 8080)
  └── TaskController
        ├── TaskService
        │     └── ConcurrentHashMap<String, Task>  (in-memory)
        └── Task (model)
              ├── Status:   PENDING | COMPLETED
              └── Priority: LOW | MEDIUM | HIGH
```

### New API Endpoint

**`GET /tasks/stats/weekly`**

Returns an array of 7 objects, one per day of the current week (Mon–Sun):

```json
[
  {
    "day": "Mon",
    "date": "2026-04-27",
    "isToday": false,
    "created": 2,
    "completed": 1
  },
  ...
]
```

### Updated Endpoints

| Endpoint | Change |
|---|---|
| `POST /tasks` | Now accepts optional `priority` field (`"LOW"`, `"MEDIUM"`, `"HIGH"`); defaults to `MEDIUM` |
| `PUT /tasks/{id}` | Now accepts optional `status` and/or `priority`; either field can be omitted |

### Data Model Change

```java
// Task.java — added
public enum Priority { LOW, MEDIUM, HIGH }
private Priority priority;  // default: MEDIUM
```

### Frontend State

| State | Type | Purpose |
|---|---|---|
| `tasks` | `Task[]` | All tasks from API |
| `stats` | `DayStat[]` | Weekly chart data |
| `filterToday` | `boolean` | Today filter toggle |
| `sortByPriority` | `boolean` | Priority View toggle |
| `showAllPending` | `boolean` | View All / Show Less |
| `animatingId` | `string \| null` | Drives task toggle animation |

### New Types

```typescript
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface DayStat {
  day:       string;
  date:      string;
  isToday:   boolean;
  created:   number;
  completed: number;
}
```

---

## Tech Decisions & Rationale

### 1. In-browser filtering vs server-side filtering

**Decision:** All filtering and sorting is done on the frontend from the full task list already in memory.

**Why:** The task list is already fetched on mount. Adding query params (`?today=true&sort=priority`) would require extra round trips and complicate the backend for marginal gain at this scale. Frontend filtering is instantaneous and keeps the API surface small.

**Migration path:** Move to server-side filtering with query params if the task list grows large enough that loading everything upfront is slow.

### 2. Weekly stats as a dedicated endpoint vs derived from task list

**Decision:** Added `GET /tasks/stats/weekly` instead of computing the chart from the task list already returned by `GET /tasks`.

**Why:** The weekly stats include day-of-week labels and an `isToday` flag, which are timezone-sensitive server-side calculations. Computing them on the frontend from raw ISO timestamps would couple the frontend to timezone logic and be error-prone. A dedicated endpoint keeps that logic in one place.

### 3. Priority stored as enum, not as a free-form string

**Decision:** `Priority` is a Java enum (`LOW`, `MEDIUM`, `HIGH`) rather than a string field.

**Why:** Enums are validated at parse time — invalid values throw immediately rather than silently storing garbage. They also make ordering logic (`PRIORITY_ORDER` map on the frontend) unambiguous.

### 4. CSS bar chart vs a charting library

**Decision:** Built the Daily Progress chart from plain Tailwind `div` elements with percentage heights.

**Why:** No external dependency, zero bundle size impact, fully controllable styling. The chart is simple enough (7 bars, 2 values each) that a library like Chart.js or Recharts would be overkill. If requirements grow (tooltips, animations, zoom) a library can be added later.

### 5. Time-based greeting without user name

**Decision:** Greeting shows only the time of day ("Good morning,") with no user name.

**Why:** The app has no authentication or user profile, so there is no name to display. The greeting still provides a warm, personalised feel based on local time without requiring a login flow.

---

## Implementation Details

### Files Modified

| File | Change |
|---|---|
| `backend/.../model/Task.java` | Added `Priority` enum and `priority` field with getter/setter |
| `backend/.../service/TaskService.java` | Updated `create()`, replaced `updateStatus()` with `update()`, added `getWeeklyStats()` |
| `backend/.../controller/TaskController.java` | Updated `POST` and `PUT` handlers, added `GET /stats/weekly`, expanded CORS |
| `frontend/src/app/types.ts` | Added `TaskPriority` type, `DayStat` interface, updated `Task` interface |
| `frontend/src/app/page.tsx` | Full dashboard layout rewrite |

### Key Functions

**`TaskService.getWeeklyStats()`** — iterates Mon–Sun of the current week using `LocalDate` + `ZoneId.systemDefault()`, counts tasks per day using stream filters on `createdAt` and `completedAt`.

**`toggleStatus(task)`** — sets `animatingId` for the CSS transition, calls `PUT /tasks/{id}`, updates local state, then calls `refreshStats()` to re-fetch the weekly chart without a full page reload.

**`visiblePending` (useMemo)** — applies `filterToday` and `sortByPriority` to the `pending` list derived from `tasks`, recomputing only when dependencies change.

---

## Testing Recommendations

### Frontend
- [ ] Hero greeting changes based on system time (mock `Date` if testing all cases)
- [ ] Pending count in hero matches actual pending task count
- [ ] Task preview in hero background updates when tasks are added/completed
- [ ] Add task with each priority — verify correct colour tag appears
- [ ] Priority View button fills when active; tasks sort High → Medium → Low
- [ ] Today button fills when active; tasks from previous days disappear
- [ ] Both filters active simultaneously — list shows only today's tasks sorted by priority
- [ ] View All shows full list; Show Less collapses to 3
- [ ] Completing a task updates the chart's filled bar and Efficiency %
- [ ] Reverting a completed task updates the chart and Efficiency %
- [ ] Mobile (375px): layout stacks, chart and efficiency card appear below task list

### Backend
- [ ] `POST /tasks` with no `priority` → task created with `MEDIUM`
- [ ] `POST /tasks` with `priority: "HIGH"` → task created with `HIGH`
- [ ] `PUT /tasks/{id}` with only `status` → priority unchanged
- [ ] `PUT /tasks/{id}` with only `priority` → status unchanged
- [ ] `PUT /tasks/{id}` reverting to PENDING → `completedAt` cleared to null
- [ ] `GET /tasks/stats/weekly` → 7 entries, correct `isToday` flag, counts match tasks

---

## Deployment Notes

- No database migrations (in-memory store)
- No new environment variables
- No breaking changes — `priority` defaults to `MEDIUM`; existing API clients that omit it continue to work
- Frontend bundle size unchanged (no new dependencies)
