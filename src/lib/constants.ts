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
 * BRAND v3 — Direction C palette, themed via CSS variables.
 *
 * Discipline: three colors, one job each.
 *   sand   = surface
 *   indigo = everything readable / clickable / structural
 *   yellow = the ONE thing you should look at first (≤6% of screen)
 *
 * Each value here is `var(--brand-*)`, defined in src/app/globals.css. That
 * means inline-styled components (`style={{ background: BRAND.sand }}`) and
 * Tailwind utilities (`className="bg-brand-sand"`) read from the SAME source
 * of truth. To switch the entire app to a different palette, either:
 *   1. Edit the :root values in globals.css (permanent)
 *   2. Set `data-theme="<name>"` on a parent element to swap to a defined
 *      [data-theme="..."] block in globals.css (runtime — used by /user-testing)
 *
 * BRAND_RAW (below) keeps literal hex values for cases where a CSS var()
 * call isn't accepted (some SVG attributes in older renderers, gradient
 * stops in canvas drawing, etc.).
 */
export const BRAND = {
  // sand surface family
  sand:        'var(--brand-sand)',
  sandDeep:    'var(--brand-sand-deep)',
  sandDeeper:  'var(--brand-sand-deeper)',
  paper:       'var(--brand-paper)',
  paperHi:     'var(--brand-paper-hi)',

  // indigo family
  indigo:      'var(--brand-indigo)',
  indigoMid:   'var(--brand-indigo-mid)',
  indigoSoft:  'var(--brand-indigo-soft)',
  indigoMute:  'var(--brand-indigo-mute)',
  ink:         'var(--brand-ink)',

  // yellow accents
  yellow:      'var(--brand-yellow)',
  yellowSoft:  'var(--brand-yellow-soft)',

  // dividers
  line:        'var(--brand-line)',
  lineSoft:    'var(--brand-line-soft)',

  // coral for warnings / alerts
  coral:       'var(--brand-coral)',
} as const

/** Literal hex/rgba values for cases where var() isn't supported. Mirror BRAND. */
export const BRAND_RAW = {
  sand:        '#EEE4C8',
  sandDeep:    '#E0D2A8',
  sandDeeper:  '#D4C290',
  paper:       '#F8F2DE',
  paperHi:     '#FBF6E6',
  indigo:      '#1B1550',
  indigoMid:   '#2E2674',
  indigoSoft:  'rgba(27,21,80,0.10)',
  indigoMute:  'rgba(27,21,80,0.55)',
  ink:         '#0B0828',
  yellow:      '#FCD718',
  yellowSoft:  'rgba(252,215,24,0.18)',
  line:        'rgba(27,21,80,0.12)',
  lineSoft:    'rgba(27,21,80,0.06)',
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
