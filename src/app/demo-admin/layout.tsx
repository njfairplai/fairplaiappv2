/**
 * /demo-admin layout — bare. Middleware enforces the cookie gate before
 * we ever get here, so this file just provides a top-level wrapper for
 * the founder-only routes. No academy-admin sidebar; that's intentional
 * — /demo-admin is the founder space (portal picker + feedback viewer),
 * /admin is where the simulated academy admin lives.
 */
export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
