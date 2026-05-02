/**
 * Centralized Tailwind class constants.
 * Import as: import { t } from "./theme"
 * Add new entries here rather than scattering one-off class strings across page.tsx.
 */

export const t = {
  // ── Priority badge colours (text + bg for dark surfaces) ─────────────────
  priority: {
    HIGH:   "text-rose-400   bg-rose-950/50   border border-rose-800/30",
    MEDIUM: "text-indigo-300 bg-indigo-950/50 border border-indigo-800/30",
    LOW:    "text-emerald-400 bg-emerald-950/50 border border-emerald-800/30",
  } as const,

  // ── Tag pill colour palette (cycles by index) ─────────────────────────────
  tagColors: [
    "bg-violet-950/60 text-violet-300 border-violet-800/30",
    "bg-sky-950/60    text-sky-300    border-sky-800/30",
    "bg-amber-950/60  text-amber-300  border-amber-800/30",
    "bg-rose-950/60   text-rose-300   border-rose-800/30",
    "bg-teal-950/60   text-teal-300   border-teal-800/30",
  ] as const,

  // ── Cards ─────────────────────────────────────────────────────────────────
  cardPending:   "bg-surface-1 rounded-2xl border border-border-default shadow-lg shadow-black/30 transition-all duration-200",
  cardCompleted: "bg-success-muted rounded-2xl border border-emerald-900/30 transition-all duration-200",

  // ── Filter / toggle pills ─────────────────────────────────────────────────
  pillActive:   "bg-accent text-white border-accent",
  pillInactive: "bg-surface-2 text-text-secondary border-border-default hover:border-accent/40 hover:text-text-primary",

  // ── Icon button (3-dot menu trigger, trash, etc.) ─────────────────────────
  iconBtn: "flex items-center justify-center rounded-lg transition-colors text-text-muted hover:text-text-primary hover:bg-surface-3",

  // ── Dropdown menu shell ───────────────────────────────────────────────────
  menuShell: "absolute right-0 top-8 z-20 bg-surface-2 border border-border-default rounded-xl shadow-2xl shadow-black/50 py-1.5 min-w-[152px]",
  menuItem:  "w-full text-left px-3.5 py-2 text-xs text-text-secondary hover:bg-surface-3 hover:text-text-primary flex items-center gap-2 transition-colors",
  menuItemDanger: "w-full text-left px-3.5 py-2 text-xs text-danger hover:bg-danger-muted flex items-center gap-2 transition-colors",

  // ── Inline panel dividers ─────────────────────────────────────────────────
  panelBorderAccent: "border-t border-accent/20 pt-4",
  panelBorderDanger: "border-t border-danger/20 pt-4",
  panelBorderSubtle: "border-t border-border-subtle",

  // ── Checkbox styles ───────────────────────────────────────────────────────
  checkboxPending:    "w-5 h-5 rounded border-2 border-border-default hover:border-accent flex-shrink-0 transition-colors",
  checkboxConfirming: "w-5 h-5 rounded border-2 border-accent bg-accent/20 flex-shrink-0 transition-colors",
  checkboxDone:       "w-5 h-5 rounded border-2 border-emerald-600 bg-emerald-600 flex-shrink-0 flex items-center justify-center transition-colors hover:bg-emerald-500",

  // ── Typography ────────────────────────────────────────────────────────────
  pageTitle:   "text-2xl sm:text-3xl font-bold text-text-primary tracking-tight",
  taskTitle:   "text-sm font-medium text-text-primary truncate",
  taskMeta:    "text-xs text-text-muted mt-1 flex items-center gap-1.5",
  detailLabel: "text-xs text-text-muted font-medium mb-2",
} as const;

/** Returns the tag pill colour class for a given index. */
export function tagColor(index: number): string {
  return t.tagColors[index % t.tagColors.length];
}
