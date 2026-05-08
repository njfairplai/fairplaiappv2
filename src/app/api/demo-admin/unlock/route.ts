import { NextRequest, NextResponse } from 'next/server'
import {
  DEMO_ADMIN_COOKIE,
  DEMO_ADMIN_COOKIE_VALUE,
  DEMO_ADMIN_MAX_AGE_S,
  DEMO_ADMIN_PASSWORD,
} from '@/lib/demo-admin-gate'

/**
 * POST /api/demo-admin/unlock
 *
 * Validates the founder password (case-insensitive + trimmed, matching
 * the legacy /admin gate's behaviour so mobile autocorrect / capitalised
 * first letter / trailing space don't silently reject the right password)
 * and sets the gate cookie if it checks out.
 *
 * The cookie is httpOnly so client JS can't read or forge it; sameSite
 * Lax so it survives normal navigation; secure in production.
 */
export async function POST(req: NextRequest) {
  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const provided = (body.password ?? '').trim().toLowerCase()
  if (provided !== DEMO_ADMIN_PASSWORD.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "That's not it." }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: DEMO_ADMIN_COOKIE,
    value: DEMO_ADMIN_COOKIE_VALUE,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DEMO_ADMIN_MAX_AGE_S,
  })
  return res
}
