import { sql } from '@vercel/postgres'
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
        <div key={id} style={{
          padding: '10px 14px',
          background: '#fff',
          border: '1px solid #E8EAED',
          borderRadius: 8,
          fontSize: 13,
        }}>
          <strong>{paletteName(id)}</strong> · {n} vote{n === 1 ? '' : 's'}
        </div>
      ))}
    </div>
  )
}

export default async function AdminFeedbackPage() {
  const { rows, error } = await fetchRows()

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>User testing feedback</h1>
        <div style={{ fontSize: 13, color: '#6E7180' }}>{rows.length} response{rows.length === 1 ? '' : 's'}</div>
      </div>
      <p style={{ fontSize: 13, color: '#6E7180', marginTop: 0, marginBottom: 24 }}>
        Live from Neon. Reload the page to fetch the latest. Sorted newest first.
      </p>

      {error && (
        <div style={{ padding: 16, background: '#FEE', border: '1px solid #FAA', borderRadius: 8, marginBottom: 24, color: '#900', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {rows.length > 0 && <PaletteCount rows={rows} />}

      {rows.length === 0 && !error && (
        <div style={{ padding: 24, background: '#fff', border: '1px solid #E8EAED', borderRadius: 8, color: '#6E7180', fontSize: 14 }}>
          No responses yet. Submit one through the user testing flow and reload.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(r => {
          const resp = r.responses ?? {}
          return (
            <div key={r.id} style={{
              background: '#fff',
              border: '1px solid #E8EAED',
              borderRadius: 10,
              padding: 18,
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{paletteName(r.palette_vote)}</div>
                  <div style={{ fontSize: 12, color: '#6E7180' }}>
                    {fmtDate(r.created_at)} · {r.role ?? 'no role'} · {r.email ?? 'no email'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: (resp.nps ?? 0) >= 9 ? '#1FA463' : (resp.nps ?? 0) >= 7 ? '#4A4AFF' : '#E04E4E' }}>
                    NPS {resp.nps ?? '—'}
                  </div>
                </div>
              </div>

              {resp.palette_words && resp.palette_words.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6E7180', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>WORDS · </span>
                  {resp.palette_words.join(', ')}
                </div>
              )}

              {resp.feel && (
                <div style={{ marginBottom: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ color: '#6E7180', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>FEEL ·</span>
                  {Object.entries(resp.feel).map(([k, v]) => (
                    <span key={k}>{k}: <strong>{v ?? '—'}/5</strong></span>
                  ))}
                </div>
              )}

              {resp.favourite_features && resp.favourite_features.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: '#6E7180', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>FAVOURITES · </span>
                  {resp.favourite_features.map(featLabel).join(', ')}
                </div>
              )}

              {resp.kill_features && resp.kill_features.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: '#E04E4E', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>KILL · </span>
                  {resp.kill_features.map(featLabel).join(', ')}
                </div>
              )}

              {r.whats_missing && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#F5F6FC', borderRadius: 6, fontStyle: 'italic' }}>
                  &ldquo;{r.whats_missing}&rdquo;
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
