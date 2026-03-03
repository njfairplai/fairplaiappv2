export const COLORS = {
  primary: '#4A4AFF',
  primaryDark: '#4536F5',
  periwinkle: '#757FFF',
  darkBg: '#0D1020',
  navy: '#1B1650',
  electricNavy: '#282689',
  white: '#F5F6FC',
  lightBg: '#F5F6FC',
  cardBg: '#FFFFFF',
  muted: '#6E7180',
  cloud: '#EDEFF7',
  border: '#E8EAED',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  phantom: '#1E1E24',
  arsenic: '#40424D',
  graphite: '#6E7180',
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
  { email: 'coach@makacademy.com', password: 'demo1234', role: 'coach' as const, label: 'Coach Portal' },
  { email: 'admin@makacademy.com', password: 'demo1234', role: 'academy_admin' as const, label: 'Academy Admin Portal' },
  { email: 'parent@makacademy.com', password: 'demo1234', role: 'parent' as const, label: 'Parent Portal' },
  { email: 'facility@sportplex.com', password: 'demo1234', role: 'facility_admin' as const, label: 'Facility Admin Portal' },
] as const

export const ROLE_PATHS: Record<string, string> = {
  facility_admin: '/facility/dashboard',
  academy_admin: '/admin/dashboard',
  coach: '/coach/home',
  parent: '/parent/home',
}
