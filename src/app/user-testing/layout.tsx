import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fairplai — User Testing',
  description: 'Help us pick the right look for the Fairplai coach portal.',
}

/**
 * Standalone layout for /user-testing.
 *
 * No coach header, no super-admin nav, no sign-in chrome — just the
 * children. The children apply their own data-theme to a wrapper so each
 * route stays in control of which palette is active.
 */
export default function UserTestingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--brand-sand)', color: 'var(--brand-indigo)' }}>
      {children}
    </div>
  )
}
