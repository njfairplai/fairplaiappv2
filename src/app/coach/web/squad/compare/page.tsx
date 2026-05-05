import { redirect } from 'next/navigation'

/**
 * Legacy route. The original wrapper rendered the mobile-coach
 * `/coach/squad/compare` page (old design system) inside the web layout.
 * Compare lives at `/coach/web/compare` now (brand-aligned, scope-aware,
 * shared `PolyRadar` primitive). Redirect here so old bookmarks resolve.
 */
export default function WebSquadCompareRedirect() {
  redirect('/coach/web/compare')
}
