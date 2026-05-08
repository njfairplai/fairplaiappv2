/**
 * Admin gate constants — single source of truth for the founder-only
 * /admin password gate. Imported by /admin/layout (the gate enforcer)
 * and /admin/unlock (the password screen).
 *
 * SECURITY NOTE: this is a soft gate. The password is in client code,
 * the unlock state is in localStorage, and anyone with browser devtools
 * can flip it. Acceptable because (a) the platform has no real backend
 * auth, so there's nothing of value behind the door anyway, and (b)
 * the goal is just to keep curious clickers out of the founder's
 * platform-wide entry point — not to defend against attackers.
 */

/** localStorage key set when the password is correct. Long-lived (no
 *  expiry) — this is for the founder, not a customer session. */
export const ADMIN_UNLOCKED_KEY = 'fairplai_admin_unlocked'

/** The shibboleth. Trim + case-sensitive compare. */
export const ADMIN_PASSWORD = 'fairplai911'

export function isAdminUnlocked(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(ADMIN_UNLOCKED_KEY) === 'true'
  } catch {
    return false
  }
}

export function unlockAdmin(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ADMIN_UNLOCKED_KEY, 'true')
  } catch {
    /* ignore */
  }
}
