# UI Revamp — Sidebar Navigation & Layout Redesign

**Status:** In Progress  
**Version:** 1.6.0  
**Branch:** `feat/ui-revamp`  

## Overview

Redesigns the TaskEcho layout with a persistent left sidebar, view-based navigation, a dedicated Completed history page, a mobile-first hamburger menu, and typography improvements. The app moves from a single-column scrolling page to a two-panel layout (sidebar + content area) matching modern productivity app conventions.

---

## 1. Functional Changes

### User-Facing Features

- **Left sidebar navigation** — always-visible on desktop; contains the TaskEcho logo/branding and three nav items: Tasks, Completed, Analytics. Settings is pinned at the bottom.
- **Removed Calendar** — Calendar nav item removed entirely; no replacement functionality (was a placeholder).
- **Analytics page** — Empty placeholder page with a "coming soon" message. Selecting it from the nav highlights it as active.
- **Completed history view** — Selecting "Completed" in the nav shows only tasks completed *before today*, with a green banner and count. Uses the same card layout as the pending tasks list.
- **Completed Today section** — Tasks completed on the current day remain visible on the main Tasks screen, under a "Completed Today" heading below the pending list.
- **Mobile hamburger menu** — On screens below 1024px, the sidebar is hidden. A hamburger (≡) button in the top bar opens the sidebar as a full-screen overlay. Tapping the backdrop or the × button closes it.
- **Hero banner legibility** — Heading and subtitle text in the hero banner changed to white/white-70 so they are readable over the indigo/purple gradient.
- **Task card font size** — Task title bumped from 16px to 17px; meta line from 14px to 13px for a cleaner size hierarchy.

### User Workflow Benefits

- Navigation is persistent and always in view on desktop — no scrolling to switch context.
- Historical completed tasks are separated from today's work, reducing noise on the main screen.
- Mobile users get a natural hamburger-menu pattern without losing any functionality.

---

## 2. Technical Design

### Architecture Overview

**Frontend only** — no backend changes. All new behaviour is client-side state switching.

```
<div class="flex min-h-screen">
  <Sidebar />          ← fixed on mobile, relative/static on desktop (lg:)
  <div class="flex-1">
    <MobileHeader />   ← lg:hidden, contains hamburger button
    <main>
      {activeView === "tasks"     && <TasksView />}
      {activeView === "completed" && <CompletedHistoryView />}
      {activeView === "analytics" && <AnalyticsView />}
    </main>
  </div>
</div>
```

### Component Structure

**New components (all in `page.tsx`):**

| Component | Responsibility |
|---|---|
| `Sidebar` | Logo, nav links, settings footer; handles open/close on mobile |
| `NavItem` | Single nav button; active/inactive styling |
| `CompletedCard` | Shared card used in both "Completed Today" (Tasks view) and Completed history view |
| `AnalyticsView` | Empty placeholder with icon and coming-soon text |
| Icon components (`IconTasks`, `IconCompleted`, etc.) | Inline SVG icons for nav items |

**State additions to `Home`:**

| State | Type | Purpose |
|---|---|---|
| `activeView` | `"tasks" \| "completed" \| "analytics"` | Which view is rendered |
| `sidebarOpen` | `boolean` | Mobile sidebar open/close toggle |
| `showAllHistory` | `boolean` | Expand beyond 3 cards in Completed history |

### Completed Split Logic

```ts
const completedToday   = completed.filter(tt => tt.completedAt ? isToday(tt.completedAt) : false);
const completedHistory = completed.filter(tt => tt.completedAt ? !isToday(tt.completedAt) : true);
```

Tasks with no `completedAt` fall into history (treated as legacy data).

### Responsive Behaviour

| Breakpoint | Sidebar |
|---|---|
| `< lg` (< 1024px) | Hidden; `fixed inset-0 w-full` overlay when `sidebarOpen = true` |
| `≥ lg` (≥ 1024px) | `relative`, always visible, `w-56 xl:w-64`, `min-h-screen` |

Mobile top bar (`lg:hidden`) contains only the hamburger button and the app name.

---

## 3. Tech Decisions & Rationale

### 1. Client-side view switching (not Next.js routing)

**Why:** The app has no URL-based navigation; adding `router.push()` would require converting the single `page.tsx` into multiple route segments. The view content is lightweight and already shares all task state, making co-location simpler.

**Trade-off:** The URL doesn't reflect the active view (no deep-linking). If deep-linking or bookmarking per-view is needed later, migrating to Next.js route segments (`/completed`, `/analytics`) is straightforward — each view is already self-contained.

### 2. `CompletedCard` extracted as a shared component

**Why:** The completed task card is rendered in two places: "Completed Today" on the Tasks screen and every card in the Completed history view. A shared component eliminates duplication and ensures both views update together.

**Trade-off:** Slightly more prop-passing. Acceptable given the component is simple and both call sites live in the same file.

### 3. Full-screen mobile sidebar (not a drawer/slide-in partial)

**Why:** The user explicitly requested "full screen" when expanded on mobile. A full-screen sidebar is also simpler to implement than a partial-width drawer with z-index layering and animation coordination.

**Trade-off:** Less context visible behind the menu on mobile. Acceptable for a small nav with only 3–4 items.

### 4. Inline SVG icons (not an icon library)

**Why:** The project has no icon library dependency. Adding one for fewer than 10 icons would add bundle weight for minimal benefit.

**Trade-off:** Slightly more verbose JSX. If the icon count grows significantly, migrating to `lucide-react` or `heroicons` is a one-line install.

---

## 4. Implementation Details

### Files Modified

- `frontend/src/app/page.tsx` — Full layout restructure (sidebar, mobile header, view switching, shared CompletedCard, AnalyticsView placeholder, hero banner text colours)
- `frontend/src/app/theme.ts` — `taskTitle` changed from `text-base` to `text-[17px]`; `taskMeta` changed from `text-sm` to `text-[13px]`

### Files Created

- `docs/features/ui-revamp.md` — this file

### Key Before/After

**Layout wrapper (before):**
```tsx
<main className="min-h-screen bg-surface-bg">
  {/* hero + content directly in main */}
</main>
```

**Layout wrapper (after):**
```tsx
<div className="min-h-screen bg-surface-bg flex">
  <Sidebar ... />
  <div className="flex-1 min-w-0 flex flex-col">
    <header className="lg:hidden ...">...</header>
    <main className="flex-1">
      {/* view content */}
    </main>
  </div>
</div>
```

**Hero banner text (before):**
```tsx
<h2 className="... text-text-primary">   {/* near-black on dark gradient */}
<p  className="text-text-secondary ...">
```

**Hero banner text (after):**
```tsx
<h2 className="... text-white">          {/* white on dark gradient */}
<p  className="text-white/70 ...">
```

---

## 5. Testing Recommendations

### Frontend Checklist

- [ ] Desktop (≥1024px): sidebar visible on all views, no hamburger button shown
- [ ] Desktop: clicking Tasks, Completed, Analytics switches the content area
- [ ] Desktop: active nav item highlighted in accent blue
- [ ] Desktop: Settings item visible at bottom of sidebar, non-functional
- [ ] Mobile (<1024px): hamburger button visible in top bar, sidebar hidden
- [ ] Mobile: tapping hamburger opens full-screen sidebar
- [ ] Mobile: tapping backdrop closes sidebar
- [ ] Mobile: tapping × button closes sidebar
- [ ] Mobile: selecting a nav item closes sidebar and switches view
- [ ] Tasks view: pending tasks, add task, subtasks, tags, filters unchanged
- [ ] Tasks view: tasks completed today appear under "Completed Today"
- [ ] Tasks view: tasks completed on previous days do NOT appear here
- [ ] Completed view: tasks completed before today listed as cards
- [ ] Completed view: tasks completed today do NOT appear here
- [ ] Completed view: empty state shows when no historical tasks
- [ ] Completed view: "View All →" shows when more than 3 cards
- [ ] Analytics view: placeholder icon and text render; no errors
- [ ] Hero banner: heading and subtitle legible (white text on gradient)
- [ ] Task cards: title visually larger than before

### Edge Cases

- [ ] Task just completed — verify it appears under "Completed Today", not in Completed history
- [ ] No completed tasks at all — "Completed Today" section hidden, Completed history shows empty state
- [ ] All tasks completed today — Completed history still shows empty state
- [ ] Resize window from mobile to desktop — sidebar snaps to static without flicker
- [ ] Resize from desktop to mobile — sidebar hides, hamburger appears

---

## 6. Deployment Notes

### Build Requirements

No new dependencies added. Standard build process unchanged:

```bash
cd frontend
npm install
npm run build
```

### No Database Migrations

No data model changes. The completed/history split is a pure frontend filter on `completedAt` date.

### No Breaking Changes

All existing task features (add, complete, revert, edit, delete, subtasks, tags, priority, filters) are fully preserved. The layout restructure wraps existing content; it does not modify any business logic.

### Rollback

Revert to the prior commit on `feat/ui-revamp` (`af59367`) to restore the single-column layout.

---

## Related Files

- Implementation: [frontend/src/app/page.tsx](../../frontend/src/app/page.tsx)
- Theme tokens: [frontend/src/app/theme.ts](../../frontend/src/app/theme.ts)
- Tailwind config: [frontend/tailwind.config.js](../../frontend/tailwind.config.js)
- Feature index: [docs/FEATURES.md](../FEATURES.md)
