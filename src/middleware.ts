import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_ADMIN_COOKIE, DEMO_ADMIN_COOKIE_VALUE } from '@/lib/demo-admin-gate'

/**
 * Server-side gate for /demo-admin/*. Redirects to /demo-admin/unlock if
 * the founder cookie isn't present. The unlock page itself is exempt so
 * we don't redirect-loop. The /api/demo-admin/* routes are exempt because
 * they validate the password and set the cookie — gating them would be a
 * chicken-and-egg.
 *
 * Why middleware (vs a layout-level check): we want the redirect to fire
 * BEFORE any UI hydrates, so a locked tester never sees a flash of the
 * portal picker or the feedback table. Middleware runs at the edge.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/demo-admin/unlock') return NextResponse.next()

  const unlocked = req.cookies.get(DEMO_ADMIN_COOKIE)?.value === DEMO_ADMIN_COOKIE_VALUE
  if (unlocked) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = '/demo-admin/unlock'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/demo-admin/:path*'],
}
