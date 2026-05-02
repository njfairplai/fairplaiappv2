/**
 * Palette registry for the /user-testing flow.
 *
 * Each entry describes one theme that lives in src/app/globals.css as a
 * [data-theme="<id>"] block. Setting `<html data-theme="classic">` (or
 * any wrapper element) flips every BRAND token at runtime — no recompile,
 * no component edits.
 *
 * Voters cycle through these in order during the sequential walkthrough,
 * then pick a winner in the feedback form.
 */

export interface Theme {
  /** matches the CSS [data-theme="..."] selector in globals.css */
  id: string
  /** display name shown in the step bar and feedback form */
  name: string
  /** one-line tagline, shown next to the name in the step bar */
  tagline: string
  /** three swatches: surface, structure, accent — for the swatch-dot UI */
  swatches: [string, string, string]
}

export const THEMES: Theme[] = [
  {
    id: 'sand',
    name: 'Sand',
    tagline: 'Editorial calm',
    swatches: ['#EEE4C8', '#1B1550', '#FCD718'],
  },
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Match-day traditional',
    swatches: ['#F5F5F0', '#0A1F44', '#C8102E'],
  },
  {
    id: 'modern',
    name: 'Modern',
    tagline: 'Broadcast sport',
    swatches: ['#1A1D24', '#F5F7FA', '#00D4FF'],
  },
  {
    id: 'turf',
    name: 'Turf',
    tagline: 'Pitch-inspired',
    swatches: ['#1F3A2E', '#F4EBD3', '#E0B43B'],
  },
  {
    id: 'bold',
    name: 'Bold',
    tagline: 'Young and loud',
    swatches: ['#0A0A0A', '#FFFFFF', '#E1FF00'],
  },
]

/** Apply a theme by setting `data-theme` on <html>. Persists to localStorage
 *  so the choice survives navigation between routes. */
export function applyTheme(themeId: string): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', themeId)
  try {
    localStorage.setItem('fairplai-theme', themeId)
  } catch {
    // localStorage may be unavailable (private mode); no-op.
  }
}

/** Read the stored theme, falling back to the default 'sand'. */
export function readStoredTheme(): string {
  if (typeof window === 'undefined') return 'sand'
  try {
    return localStorage.getItem('fairplai-theme') ?? 'sand'
  } catch {
    return 'sand'
  }
}
