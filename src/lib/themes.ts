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
    id: 'almanac',
    name: 'Almanac',
    tagline: 'The football reference',
    swatches: ['#EEE4C8', '#1B1550', '#FCD718'],
  },
  {
    id: 'cloudline',
    name: 'Cloudline',
    tagline: 'Brand at full sun',
    swatches: ['#EDEFF7', '#1B1650', '#4A4AFF'],
  },
  {
    id: 'voltage',
    name: 'Voltage',
    tagline: 'Stadium tunnel, kickoff',
    swatches: ['#1E1E24', '#F5F6FC', '#4536F5'],
  },
  {
    id: 'stadia',
    name: 'Stadia',
    tagline: 'The football monograph',
    swatches: ['#F6F3EC', '#0C0C10', '#EE5A36'],
  },
  // Touchline review pair — slot 5 is split into two variants for visual
  // comparison. After the visual review one will be dropped and the
  // winner renamed to plain `touchline`.
  {
    id: 'touchline-cards',
    name: 'Touchline · Cards',
    tagline: 'Sage cards on cream',
    swatches: ['#F1EFE4', '#1E3527', '#6FA77B'],
  },
  {
    id: 'touchline-page',
    name: 'Touchline · Page',
    tagline: 'Sage ground, cream cards',
    swatches: ['#C8DCC8', '#1E3527', '#2F6B47'],
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

/** Read the stored theme, falling back to the default 'almanac'. */
export function readStoredTheme(): string {
  if (typeof window === 'undefined') return 'almanac'
  try {
    return localStorage.getItem('fairplai-theme') ?? 'almanac'
  } catch {
    return 'almanac'
  }
}
