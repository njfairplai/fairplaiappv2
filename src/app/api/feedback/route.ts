import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/feedback
 *
 * Receives a feedback submission from /user-testing/feedback and inserts
 * it into the `feedback_responses` table on Vercel Postgres.
 *
 * Setup (one-time, in Vercel dashboard):
 * 1. Project: fairplaiappv2 → Storage tab → Create Database → Postgres.
 * 2. Once created, run this DDL in Vercel's SQL editor:
 *
 *    CREATE TABLE IF NOT EXISTS feedback_responses (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 *      theme_chosen TEXT NOT NULL,
 *      what_worked TEXT,
 *      what_didnt TEXT,
 *      whats_missing TEXT,
 *      role TEXT,
 *      email TEXT,
 *      dwell_seconds JSONB,
 *      user_agent TEXT,
 *      referrer TEXT
 *    );
 *
 * 3. For local dev, run `npx vercel env pull .env.local` to fetch the
 *    POSTGRES_URL into your local .env.local.
 *
 * If the DB env vars aren't set, this route returns 503 with a helpful
 * message so local dev / preview deploys without the DB don't crash.
 */
export async function POST(req: NextRequest) {
  // Bail out gracefully if the DB isn't configured yet.
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Postgres not configured. Create a database in Vercel → Storage → Postgres on the fairplaiappv2 project, then run the DDL in src/app/api/feedback/route.ts.',
      },
      { status: 503 },
    )
  }

  let body: {
    theme_chosen?: string
    what_worked?: string
    what_didnt?: string
    whats_missing?: string
    role?: string | null
    email?: string | null
    dwell_seconds?: Record<string, number>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.theme_chosen || !body.what_worked || !body.what_didnt) {
    return NextResponse.json(
      { ok: false, error: 'theme_chosen, what_worked, and what_didnt are required' },
      { status: 400 },
    )
  }

  try {
    await sql`
      INSERT INTO feedback_responses (
        theme_chosen, what_worked, what_didnt, whats_missing,
        role, email, dwell_seconds, user_agent, referrer
      ) VALUES (
        ${body.theme_chosen},
        ${body.what_worked},
        ${body.what_didnt},
        ${body.whats_missing ?? null},
        ${body.role ?? null},
        ${body.email ?? null},
        ${JSON.stringify(body.dwell_seconds ?? {})},
        ${req.headers.get('user-agent')},
        ${req.headers.get('referer')}
      )
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/feedback] Insert failed:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}
