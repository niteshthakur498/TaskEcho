/**
 * Centralized Tailwind class constants.
 * Import as: import { t } from "./theme"
 * Add new entries here rather than scattering one-off class strings across page.tsx.
 */

export const t = {
  // ── Priority badge colours (text + bg for dark surfaces) ─────────────────
  priority: {
    HIGH:   "text-red-600    bg-red-50    border border-red-200",
    MEDIUM: "text-indigo-600 bg-indigo-50 border border-indigo-200",
    LOW:    "text-emerald-600 bg-emerald-50 border border-emerald-200",
  } as const,

  // ── Tag pill colour palette (cycles by index) ─────────────────────────────
  tagColors: [
    "bg-violet-50 text-violet-700 border-violet-200",
    "bg-sky-50    text-sky-700    border-sky-200",
    "bg-amber-50  text-amber-700  border-amber-200",
    "bg-rose-50   text-rose-700   border-rose-200",
    "bg-teal-50   text-teal-700   border-teal-200",
  ] as const,

  // ── Cards ─────────────────────────────────────────────────────────────────
  cardPending:   "bg-surface-1 rounded-2xl border border-border-default shadow-lg shadow-black/30 transition-all duration-200",
  cardCompleted: "bg-success-muted rounded-2xl border border-emerald-200 transition-all duration-200",

  // ── Filter / toggle pills ─────────────────────────────────────────────────
  pillActive:   "bg-accent text-white border-accent",
  pillInactive: "bg-surface-2 text-text-secondary border-border-default hover:border-accent/40 hover:text-text-primary",

  // ── Icon button (3-dot menu trigger, trash, etc.) ─────────────────────────
  iconBtn: "flex items-center justify-center rounded-lg transition-colors text-text-muted hover:text-text-primary hover:bg-surface-3",

  // ── Dropdown menu shell ───────────────────────────────────────────────────
  menuShell: "absolute right-0 top-8 z-20 bg-white border border-border-default rounded-xl shadow-xl shadow-black/10 py-1.5 min-w-[152px]",
  menuItem:  "w-full text-left px-3.5 py-2 text-xs text-text-secondary hover:bg-surface-3 hover:text-text-primary flex items-center gap-2 transition-colors",
  menuItemDanger: "w-full text-left px-3.5 py-2 text-xs text-danger hover:bg-danger-muted flex items-center gap-2 transition-colors",

  // ── Inline panel dividers ─────────────────────────────────────────────────
  panelBorderAccent: "border-t border-accent/20 pt-4",
  panelBorderDanger: "border-t border-danger/20 pt-4",
  panelBorderSubtle: "border-t border-border-subtle",

  // ── Checkbox styles ───────────────────────────────────────────────────────
  checkboxPending:    "w-5 h-5 rounded border-2 border-border-default hover:border-accent flex-shrink-0 transition-colors",
  checkboxConfirming: "w-5 h-5 rounded border-2 border-accent bg-accent/20 flex-shrink-0 transition-colors",
  checkboxDone:       "w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex-shrink-0 flex items-center justify-center transition-colors hover:bg-emerald-400",

  // ── Typography ────────────────────────────────────────────────────────────
  pageTitle:   "text-2xl sm:text-3xl font-bold text-text-primary tracking-tight",
  taskTitle:   "text-[17px] font-medium text-text-primary truncate",
  taskMeta:    "text-[13px] text-text-secondary mt-1.5 flex items-center gap-1.5",
  detailLabel: "text-xs font-semibold text-text-muted uppercase tracking-wide mb-2",
} as const;

/** Returns the tag pill colour class for a given index. */
export function tagColor(index: number): string {
  return t.tagColors[index % t.tagColors.length];
}
