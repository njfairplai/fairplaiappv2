import { sql } from '@vercel/postgres'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { THEMES } from '@/lib/themes'

export const dynamic = 'force-dynamic'

interface FeedbackRow {
  id: string
  created_at: string
  palette_vote: string
  responses: {
    palette_words?: string[]
    feel?: Record<string, number | null>
    favourite_features?: string[]
    kill_features?: string[]
    nps?: number | null
  } | null
  whats_missing: string | null
  role: string | null
  email: string | null
  dwell_seconds: Record<string, number> | null
  user_agent: string | null
  referrer: string | null
}

async function fetchRows(): Promise<{ rows: FeedbackRow[]; error: string | null }> {
  if (!process.env.POSTGRES_URL) {
    return { rows: [], error: 'POSTGRES_URL not configured on this environment.' }
  }
  try {
    const { rows } = await sql<FeedbackRow>`
      SELECT id, created_at, palette_vote, responses, whats_missing,
             role, email, dwell_seconds, user_agent, referrer
      FROM feedback_responses
      ORDER BY created_at DESC
      LIMIT 200
    `
    return { rows, error: null }
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : 'Database error' }
  }
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function paletteName(id: string): string {
  return THEMES.find(t => t.id === id)?.name ?? id
}

const FEATURE_LABEL: Record<string, string> = {
  match_in_numbers: 'Match in Numbers',
  timeline: 'Timeline',
  clip: 'Clip + Stats',
  squad: 'Squad table',
  player_detail: 'Player detail',
  recap: 'Recap share',
  watch_match: 'Full match',
}

function featLabel(k: string): string {
  return FEATURE_LABEL[k] ?? k
}

function PaletteCount({ rows }: { rows: FeedbackRow[] }) {
  const counts = new Map<string, number>()
  for (const r of rows) counts.set(r.palette_vote, (counts.get(r.palette_vote) ?? 0) + 1)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
      {sorted.map(([id, n]) => (
        <div
          key={id}
          style={{
            padding: '10px 14px',
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--brand-indigo)',
          }}
        >
          <strong>{paletteName(id)}</strong> · {n} vote{n === 1 ? '' : 's'}
        </div>
      ))}
    </div>
  )
}

export default async function DemoAdminFeedbackPage() {
  const { rows, error } = await fetchRows()

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
        padding: '32px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <Link
          href="/demo-admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--brand-indigo)',
            textDecoration: 'none',
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={13} /> Back to demo admin
        </Link>

        <div
          style={{
            fontFamily: 'var(--font-fragment), monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            fontWeight: 800,
            color: 'var(--brand-indigo-mute)',
            marginBottom: 12,
          }}
        >
          FAIRPLAI · USER FEEDBACK
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
          <h1
            style={{
              fontFamily: 'var(--font-clash), serif',
              fontSize: 40,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              margin: 0,
              fontWeight: 700,
            }}
          >
            User testing feedback
          </h1>
          <div style={{ fontSize: 13, color: 'var(--brand-indigo-mute)', fontWeight: 600 }}>
            {rows.length} response{rows.length === 1 ? '' : 's'}
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--brand-indigo-mute)', margin: '0 0 28px', maxWidth: 540, lineHeight: 1.5 }}>
          Live from Neon. Reload the page to fetch the latest. Sorted newest first.
        </p>

        {error && (
          <div
            style={{
              padding: 16,
              background: 'var(--brand-yellow-soft)',
              border: '1px solid var(--brand-coral)',
              borderRadius: 8,
              marginBottom: 24,
              color: 'var(--brand-indigo)',
              fontSize: 14,
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {rows.length > 0 && <PaletteCount rows={rows} />}

        {rows.length === 0 && !error && (
          <div
            style={{
              padding: 24,
              background: 'var(--brand-paper)',
              border: '1px solid var(--brand-line)',
              borderRadius: 8,
              color: 'var(--brand-indigo-mute)',
              fontSize: 14,
            }}
          >
            No responses yet. Submit one through the user testing flow and reload.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(r => {
            const resp = r.responses ?? {}
            const npsValue = resp.nps ?? null
            const npsColor =
              npsValue === null
                ? 'var(--brand-indigo-mute)'
                : npsValue >= 9
                ? 'var(--brand-yellow)'
                : npsValue >= 7
                ? 'var(--brand-indigo)'
                : 'var(--brand-coral)'
            return (
              <div
                key={r.id}
                style={{
                  background: 'var(--brand-paper)',
                  border: '1px solid var(--brand-line)',
                  borderRadius: 10,
                  padding: 18,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--brand-indigo)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-clash), serif', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
                      {paletteName(r.palette_vote)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--brand-indigo-mute)' }}>
                      {fmtDate(r.created_at)} · {r.role ?? 'no role'} · {r.email ?? 'no email'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-clash), serif',
                        fontSize: 24,
                        fontWeight: 700,
                        color: npsColor,
                      }}
                    >
                      NPS {npsValue ?? '—'}
                    </div>
                  </div>
                </div>

                {resp.palette_words && resp.palette_words.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: 'var(--brand-indigo-mute)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>
                      WORDS ·{' '}
                    </span>
                    {resp.palette_words.join(', ')}
                  </div>
                )}

                {resp.feel && (
                  <div style={{ marginBottom: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--brand-indigo-mute)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>
                      FEEL ·
                    </span>
                    {Object.entries(resp.feel).map(([k, v]) => (
                      <span key={k}>
                        {k}: <strong>{v ?? '—'}/5</strong>
                      </span>
                    ))}
                  </div>
                )}

                {resp.favourite_features && resp.favourite_features.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: 'var(--brand-indigo-mute)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>
                      FAVOURITES ·{' '}
                    </span>
                    {resp.favourite_features.map(featLabel).join(', ')}
                  </div>
                )}

                {resp.kill_features && resp.kill_features.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ color: 'var(--brand-coral)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>
                      KILL ·{' '}
                    </span>
                    {resp.kill_features.map(featLabel).join(', ')}
                  </div>
                )}

                {r.whats_missing && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '10px 12px',
                      background: 'var(--brand-sand)',
                      border: '1px solid var(--brand-line-soft)',
                      borderRadius: 6,
                      fontStyle: 'italic',
                      color: 'var(--brand-indigo)',
                    }}
                  >
                    &ldquo;{r.whats_missing}&rdquo;
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
