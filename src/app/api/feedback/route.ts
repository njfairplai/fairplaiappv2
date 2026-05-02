import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/feedback
 *
 * Receives a feedback submission from /user-testing/feedback and inserts
 * it into the `feedback_responses` table on Vercel Postgres.
 *
 * Schema (versioned, JSONB-flexible so we can evolve the form without
 * ALTER TABLE every time):
 *
 *   CREATE TABLE IF NOT EXISTS feedback_responses (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 *     palette_vote TEXT NOT NULL,    -- denormalized: which palette won
 *     responses JSONB NOT NULL,       -- structured Q&A: words, usefulness, feel, nps
 *     whats_missing TEXT,             -- the one open textarea
 *     role TEXT,
 *     email TEXT,
 *     dwell_seconds JSONB,            -- per-palette dwell time from localStorage
 *     user_agent TEXT,
 *     referrer TEXT
 *   );
 *
 * Setup (one-time, in Vercel dashboard, on the fairplaiappv2 project):
 *   1. Storage tab → Create Database → Postgres.
 *   2. Run the DDL above in Vercel's SQL editor.
 *   3. Redeploy so env vars (POSTGRES_URL etc.) are in scope.
 *
 * Local dev: `npx vercel link` once, then `npx vercel env pull .env.local`.
 *
 * If POSTGRES_URL isn't set, the route returns 503 with a helpful message
 * so local dev / preview deploys without the DB don't crash.
 */
export async function POST(req: NextRequest) {
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
    palette_vote?: string
    responses?: {
      palette_words?: string[]
      feel?: Record<string, number | null>
      favourite_features?: string[]
      kill_features?: string[]
      nps?: number | null
    }
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

  // Validate the required pieces (Slice 4.5 two-phase form). The form blocks
  // submission until these are filled, but we re-check server-side as a
  // contract guard. `kill_features` is allowed to be empty (it's "or none").
  const r = body.responses
  if (
    !body.palette_vote ||
    !r ||
    !Array.isArray(r.palette_words) || r.palette_words.length === 0 ||
    !r.feel || Object.values(r.feel).some(v => v === null) ||
    !Array.isArray(r.favourite_features) || r.favourite_features.length === 0 ||
    !Array.isArray(r.kill_features) ||
    r.nps === null || r.nps === undefined
  ) {
    return NextResponse.json(
      { ok: false, error: 'Missing required answers' },
      { status: 400 },
    )
  }

  try {
    await sql`
      INSERT INTO feedback_responses (
        palette_vote, responses, whats_missing,
        role, email, dwell_seconds, user_agent, referrer
      ) VALUES (
        ${body.palette_vote},
        ${JSON.stringify(body.responses)},
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
