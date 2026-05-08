import { cookies } from 'next/headers'

/**
 * Demo-admin cookie gate. Distinct from the legacy /admin gate (which
 * lives in src/lib/admin-gate.ts and uses localStorage). This gate:
 *
 *   - validates the password server-side (kept out of the client bundle)
 *   - sets an httpOnly cookie so client-side storage tampering / mobile
 *     storage restrictions / Private Browsing can't unlock or break it
 *   - is enforced in middleware.ts on every /demo-admin/* request
 *
 * Soft-gate threat model still: this is to keep curious clickers out of
 * the founder space, not to defend against an attacker. But moving to a
 * server-validated cookie does eliminate the "press enter, lands back on
 * the unlock screen" symptom seen with localStorage on some browsers.
 */

export const DEMO_ADMIN_COOKIE = 'fairplai_demo_admin'
export const DEMO_ADMIN_PASSWORD = 'fairplai911'
export const DEMO_ADMIN_COOKIE_VALUE = 'unlocked'

/** 30 days in seconds — long-lived per the founder-only intent. */
export const DEMO_ADMIN_MAX_AGE_S = 60 * 60 * 24 * 30

export async function isDemoAdminUnlockedFromRequest(): Promise<boolean> {
  const store = await cookies()
  return store.get(DEMO_ADMIN_COOKIE)?.value === DEMO_ADMIN_COOKIE_VALUE
}
