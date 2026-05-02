import { notFound } from 'next/navigation'

/**
 * /user-testing/results — TEMPORARILY DISABLED.
 *
 * The dashboard is built and ready (full implementation in git history at
 * commit 754517d), but it's currently a public route. Disabled until we
 * add password-gating / sign-in protection before sharing the test URL
 * with coaches at scale.
 *
 * To re-enable:
 *   1. Add auth (env-var password gate or NextAuth integration).
 *   2. `git revert` this file or `git show 754517d -- src/app/user-testing/results/page.tsx`
 *      to recover the dashboard implementation.
 *
 * Until then, run analysis queries directly in Vercel's SQL editor.
 */
export default function FeedbackResultsPage() {
  notFound()
}
