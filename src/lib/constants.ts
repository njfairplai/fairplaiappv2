export const COLORS = {
  // ─── Existing tokens (kept for back-compat across non-redesigned screens) ───
  primary: '#4A4AFF',
  primaryDark: '#4536F5',
  periwinkle: '#757FFF',
  darkBg: '#0D1020',
  // navy now aligned to landing-page brand (#1B1550, not #1B1650 — 1-digit fix)
  navy: '#1B1550',
  electricNavy: '#282689',
  white: '#F5F6FC',
  lightBg: '#F5F6FC',
  cardBg: '#FFFFFF',
  muted: '#6E7180',
  cloud: '#EDEFF7',
  border: '#E8EAED',
  // Score-band semantics — kept traffic-light for clarity (red/yellow/green per the locked plan)
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  phantom: '#1E1E24',
  arsenic: '#40424D',
  graphite: '#6E7180',
} as const

/**
 * BRAND v3 — Direction C palette from the landing-page-aligned redesign.
 *
 * Discipline: three colors, one job each.
 *   sand   = surface
 *   indigo = everything readable / clickable / structural
 *   yellow = the ONE thing you should look at first (≤6% of screen)
 *
 * Sand depth (sand → paper → paperHi) provides structural variety without new hues.
 * Indigo is paired with tonal variants (Mid / Soft / Mute) for hierarchy.
 * Yellow appears at most once per visual unit on the most important affordance.
 */
export const BRAND = {
  // sand surface family
  sand:        '#EEE4C8',                  // primary background
  sandDeep:    '#E0D2A8',                  // dividers / second-step shading
  sandDeeper:  '#D4C290',                  // bands / strips
  paper:       '#F8F2DE',                  // raised card
  paperHi:     '#FBF6E6',                  // top-of-stack card

  // indigo family
  indigo:      '#1B1550',                  // primary text + structure + CTAs
  indigoMid:   '#2E2674',                  // hover / secondary
  indigoSoft:  'rgba(27,21,80,0.10)',      // hairline / chip wash
  indigoMute:  'rgba(27,21,80,0.55)',      // muted body text
  ink:         '#0B0828',                  // deepest contrast (rare)

  // yellow accents — surface area kept tiny
  yellow:      '#FCD718',                  // emphasis only (MOTM, playhead, "why this matters", goal pin)
  yellowSoft:  'rgba(252,215,24,0.18)',    // ambient halo

  // dividers
  line:        'rgba(27,21,80,0.12)',
  lineSoft:    'rgba(27,21,80,0.06)',

  // optional: coral kept for warning/alert badges separate from the score-band error red
  coral:       '#EB4D6D',
} as const

/**
 * Type fields to use across the brand-aligned redesign.
 * Display = Clash Display (loud uppercase headlines, hero numerics).
 * Body    = Satoshi (UI copy, body, nav, buttons).
 * Mono    = Fragment Mono (timestamps, eyebrows, metadata).
 *
 * Wire actual font loading via next/font in src/app/layout.tsx (slice will follow).
 */
export const TYPE = {
  display: '"Clash Display", "Satoshi", system-ui, sans-serif',
  body:    '"Satoshi", system-ui, sans-serif',
  mono:    '"Fragment Mono", ui-monospace, "SF Mono", monospace',
} as const

export const RADIUS = {
  card: 12,
  input: 8,
  pill: 20,
} as const

export const SHADOWS = {
  card: '0 2px 12px rgba(0,0,0,0.06)',
  elevated: '0 8px 32px rgba(27,22,80,0.25)',
  nav: '0 -2px 16px rgba(0,0,0,0.06)',
} as const

export const NAV_HEIGHT = 80

export const DEMO_ACCOUNTS = [
  { email: 'super@fairplai.com', password: 'demo1234', role: 'super_admin' as const, label: 'Super Admin Portal' },
  { email: 'coach@makacademy.com', password: 'demo1234', role: 'coach' as const, label: 'Coach Portal' },
  { email: 'admin@makacademy.com', password: 'demo1234', role: 'academy_admin' as const, label: 'Academy Admin Portal' },
  { email: 'parent@makacademy.com', password: 'demo1234', role: 'parent' as const, label: 'Parent Portal' },
  { email: 'player@makacademy.com', password: 'demo1234', role: 'player' as const, label: 'Player Portal' },
  { email: 'facility@sportplex.com', password: 'demo1234', role: 'facility_admin' as const, label: 'Facility Admin Portal' },
] as const

export const ROLE_PATHS: Record<string, string> = {
  super_admin: '/super-admin/dashboard',
  facility_admin: '/facility/dashboard',
  academy_admin: '/admin/dashboard',
  coach: '/coach/home',
  parent: '/parent/home',
  player: '/player/home',
}
