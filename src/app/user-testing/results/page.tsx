import { sql } from '@vercel/postgres'
import Link from 'next/link'
import { THEMES } from '@/lib/themes'

export const dynamic = 'force-dynamic' // always fetch fresh on every page load

/**
 * /user-testing/results — live admin dashboard for the feedback form.
 *
 * Server Component: runs all the analysis queries on every page load and
 * renders the results inline. No SQL needed; just visit the URL.
 *
 * TODO(auth): this is currently public. Add password-gating (env var) or
 * sign-in protection before production. For now the obscurity of the URL
 * is the only protection — fine while no real responses exist, but tighten
 * before you share the test URL with coaches.
 */

interface RecentResponse {
  created_at: string
  palette_vote: string
  responses: {
    palette_words?: string[]
    usefulness?: Record<string, number>
    feel?: Record<string, number>
    nps?: number
  }
  whats_missing: string | null
  role: string | null
  email: string | null
}

const SECTION_LABELS: { key: string; label: string }[] = [
  { key: 'match_in_numbers', label: 'Match in numbers' },
  { key: 'timeline',         label: 'Timeline' },
  { key: 'clip',             label: 'Clip + Key Stats' },
  { key: 'squad',            label: 'Squad table' },
  { key: 'player_detail',    label: 'Player detail' },
  { key: 'recap',            label: 'WhatsApp recap' },
  { key: 'watch_match',      label: 'Watch full match' },
]

const FEEL_LABELS: { key: string; label: string }[] = [
  { key: 'professional', label: 'Looks professional' },
  { key: 'scan',         label: 'Easy to scan' },
  { key: 'trust',        label: 'Would trust with squad data' },
]

export default async function FeedbackResultsPage() {
  // Fail gracefully if Postgres isn't configured (so the page is browseable
  // before the DB is hooked up).
  if (!process.env.POSTGRES_URL) {
    return <NotConfigured />
  }

  // Run every query in parallel.
  const [
    totalRow,
    voteRows,
    avgUsefulnessRow,
    avgFeelRow,
    npsRow,
    wordRows,
    dwellRows,
    recentRows,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS total FROM feedback_responses`,
    sql`SELECT palette_vote, COUNT(*)::int AS n FROM feedback_responses GROUP BY palette_vote ORDER BY n DESC`,
    sql`
      SELECT
        ROUND(AVG((responses->'usefulness'->>'match_in_numbers')::int)::numeric, 2) AS match_in_numbers,
        ROUND(AVG((responses->'usefulness'->>'timeline')::int)::numeric, 2) AS timeline,
        ROUND(AVG((responses->'usefulness'->>'clip')::int)::numeric, 2) AS clip,
        ROUND(AVG((responses->'usefulness'->>'squad')::int)::numeric, 2) AS squad,
        ROUND(AVG((responses->'usefulness'->>'player_detail')::int)::numeric, 2) AS player_detail,
        ROUND(AVG((responses->'usefulness'->>'recap')::int)::numeric, 2) AS recap,
        ROUND(AVG((responses->'usefulness'->>'watch_match')::int)::numeric, 2) AS watch_match
      FROM feedback_responses
    `,
    sql`
      SELECT
        ROUND(AVG((responses->'feel'->>'professional')::int)::numeric, 2) AS professional,
        ROUND(AVG((responses->'feel'->>'scan')::int)::numeric, 2) AS scan,
        ROUND(AVG((responses->'feel'->>'trust')::int)::numeric, 2) AS trust
      FROM feedback_responses
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE (responses->>'nps')::int >= 9)::int AS promoters,
        COUNT(*) FILTER (WHERE (responses->>'nps')::int BETWEEN 7 AND 8)::int AS passives,
        COUNT(*) FILTER (WHERE (responses->>'nps')::int <= 6)::int AS detractors,
        COUNT(*)::int AS total
      FROM feedback_responses
      WHERE responses->>'nps' IS NOT NULL
    `,
    sql`
      SELECT word, COUNT(*)::int AS picks
      FROM feedback_responses,
        jsonb_array_elements_text(responses->'palette_words') AS word
      GROUP BY word
      ORDER BY picks DESC
    `,
    sql`
      SELECT key AS palette, ROUND(AVG((dwell_seconds->>key)::int)::numeric, 1) AS avg_seconds
      FROM feedback_responses,
        jsonb_object_keys(dwell_seconds) AS key
      WHERE dwell_seconds IS NOT NULL
      GROUP BY key
      ORDER BY avg_seconds DESC
    `,
    sql<RecentResponse>`
      SELECT created_at::text, palette_vote, responses, whats_missing, role, email
      FROM feedback_responses
      ORDER BY created_at DESC
      LIMIT 25
    `,
  ])

  const total = (totalRow.rows[0]?.total as number) ?? 0
  const npsRowData = npsRow.rows[0] as { promoters: number; passives: number; detractors: number; total: number } | undefined
  const npsScore = npsRowData && npsRowData.total > 0
    ? Math.round((npsRowData.promoters - npsRowData.detractors) * 100 / npsRowData.total)
    : null

  if (total === 0) {
    return <EmptyState />
  }

  const usefulnessAvg = avgUsefulnessRow.rows[0] as Record<string, string | null>
  const feelAvg = avgFeelRow.rows[0] as Record<string, string | null>

  return (
    <main style={{
      background: 'var(--brand-sand)',
      color: 'var(--brand-indigo)',
      fontFamily: 'var(--font-satoshi)',
      minHeight: '100vh',
      padding: '40px 32px 60px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Header total={total} />

        {/* Vote tally */}
        <Section eyebrow="A · PALETTE VOTE" title="Which palette is winning">
          <PaletteVotes
            rows={voteRows.rows as { palette_vote: string; n: number }[]}
            total={total}
          />
        </Section>

        {/* NPS */}
        <Section eyebrow="E · NET PROMOTER SCORE" title="Likelihood to recommend">
          <NPSBlock
            score={npsScore}
            promoters={npsRowData?.promoters ?? 0}
            passives={npsRowData?.passives ?? 0}
            detractors={npsRowData?.detractors ?? 0}
          />
        </Section>

        {/* Avg overall feel */}
        <Section eyebrow="D · OVERALL FEEL" title="How the design felt on average">
          <LikertBars
            items={FEEL_LABELS.map(({ key, label }) => ({
              label,
              value: feelAvg[key] ? parseFloat(feelAvg[key] as string) : null,
            }))}
            scale={5}
            scaleLabel="strongly disagree → strongly agree"
          />
        </Section>

        {/* Avg usefulness */}
        <Section eyebrow="C · USEFULNESS PER FEATURE" title="Which features earned their pixels">
          <LikertBars
            items={SECTION_LABELS.map(({ key, label }) => ({
              label,
              value: usefulnessAvg[key] ? parseFloat(usefulnessAvg[key] as string) : null,
            }))}
            scale={5}
            scaleLabel="not useful → essential"
          />
        </Section>

        {/* Descriptor words */}
        <Section eyebrow="B · GUT REACTION" title="Most-picked descriptor words">
          <WordCloud rows={wordRows.rows as { word: string; picks: number }[]} />
        </Section>

        {/* Dwell time */}
        <Section eyebrow="ENGAGEMENT" title="Average time spent in each palette">
          <DwellBars rows={dwellRows.rows as { palette: string; avg_seconds: string }[]} />
        </Section>

        {/* Recent responses */}
        <Section eyebrow="LATEST 25 RESPONSES" title="Open comments + raw rows">
          <RecentList rows={recentRows.rows as RecentResponse[]} />
        </Section>

        <footer style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid var(--brand-line)',
          fontFamily: 'var(--font-fragment)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          textAlign: 'center',
        }}>
          REFRESH THIS PAGE TO SEE NEW RESPONSES · DATA IS LIVE
        </footer>
      </div>
    </main>
  )
}

/* ─────────── Empty / not configured states ─────────── */

function NotConfigured() {
  return (
    <Wrap>
      <h1 style={{ fontFamily: 'var(--font-clash)', fontSize: 36, margin: '0 0 12px' }}>Database not configured</h1>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 24, color: 'var(--brand-indigo-mute)' }}>
        Set up Vercel Postgres on the fairplaiappv2 project, run the DDL in
        <code style={{ background: 'var(--brand-paper)', padding: '2px 6px', borderRadius: 4, margin: '0 4px' }}>src/app/api/feedback/route.ts</code>,
        and redeploy. Once env vars are in scope, this page will show live results.
      </p>
      <Link href="/user-testing" style={linkBtn}>← Back to user testing</Link>
    </Wrap>
  )
}

function EmptyState() {
  return (
    <Wrap>
      <div style={{
        fontFamily: 'var(--font-fragment)',
        fontSize: 11,
        letterSpacing: '0.22em',
        color: 'var(--brand-indigo-mute)',
        fontWeight: 700,
        marginBottom: 12,
      }}>USER TESTING · RESULTS</div>
      <h1 style={{ fontFamily: 'var(--font-clash)', fontSize: 44, margin: '0 0 16px', letterSpacing: '-0.02em' }}>No responses yet.</h1>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 24, color: 'var(--brand-indigo-mute)' }}>
        Once coaches submit the feedback form, the analytics will appear here automatically.
      </p>
      <Link href="/user-testing" style={linkBtn}>Go to the test →</Link>
    </Wrap>
  )
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      background: 'var(--brand-sand)',
      color: 'var(--brand-indigo)',
      fontFamily: 'var(--font-satoshi)',
      minHeight: '100vh',
      padding: '60px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>{children}</div>
    </main>
  )
}

const linkBtn = {
  display: 'inline-block',
  padding: '12px 18px',
  background: 'var(--brand-indigo)',
  color: 'var(--brand-sand)',
  border: 'none',
  borderRadius: 7,
  fontFamily: 'var(--font-satoshi)',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
}

/* ─────────── Layout primitives ─────────── */

function Header({ total }: { total: number }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <Link href="/user-testing" style={{
        fontFamily: 'var(--font-clash)',
        fontSize: 24,
        letterSpacing: '0.04em',
        fontWeight: 700,
        color: 'var(--brand-indigo)',
        textDecoration: 'none',
        display: 'inline-block',
        marginBottom: 24,
      }}>FAIRPL.AI</Link>
      <div style={{
        fontFamily: 'var(--font-fragment)',
        fontSize: 11,
        letterSpacing: '0.22em',
        color: 'var(--brand-indigo-mute)',
        fontWeight: 700,
        marginBottom: 6,
      }}>USER TESTING · RESULTS DASHBOARD</div>
      <h1 style={{
        fontFamily: 'var(--font-clash)',
        fontSize: 48,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        margin: '0 0 12px',
      }}>
        {total} {total === 1 ? 'response' : 'responses'} so far.
      </h1>
      <p style={{ color: 'var(--brand-indigo-mute)', fontSize: 15 }}>
        Live data — refresh the page to pull the latest.
      </p>
    </div>
  )
}

function Section({ eyebrow, title, children }: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section style={{
      marginBottom: 48,
      padding: 28,
      background: 'var(--brand-paper)',
      border: '1px solid var(--brand-line)',
      borderRadius: 12,
    }}>
      <div style={{
        fontFamily: 'var(--font-fragment)',
        fontSize: 11,
        letterSpacing: '0.22em',
        color: 'var(--brand-indigo-mute)',
        fontWeight: 700,
        marginBottom: 6,
      }}>SECTION {eyebrow}</div>
      <h2 style={{
        fontFamily: 'var(--font-clash)',
        fontSize: 24,
        margin: '0 0 20px',
        letterSpacing: '-0.01em',
      }}>{title}</h2>
      {children}
    </section>
  )
}

/* ─────────── Vote tally bar ─────────── */

function PaletteVotes({ rows, total }: { rows: { palette_vote: string; n: number }[]; total: number }) {
  // Normalise so every theme appears even if it got 0 votes.
  const counts = new Map(rows.map(r => [r.palette_vote, r.n]))
  const items = THEMES.map(t => ({
    id: t.id,
    name: t.name,
    swatches: t.swatches,
    n: counts.get(t.id) ?? 0,
  })).sort((a, b) => b.n - a.n)
  const winner = items[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(item => {
        const pct = total > 0 ? Math.round((item.n / total) * 100) : 0
        const isWinner = winner && item.id === winner.id && item.n > 0
        return (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 70px', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {item.swatches.map((c, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                ))}
              </div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
              {isWinner && <span style={{
                fontFamily: 'var(--font-fragment)',
                fontSize: 9,
                background: 'var(--brand-yellow)',
                color: 'var(--brand-indigo)',
                padding: '2px 5px',
                letterSpacing: '0.16em',
                fontWeight: 700,
                borderRadius: 2,
              }}>★ LEADING</span>}
            </div>
            <div style={{ height: 10, background: 'var(--brand-indigo-soft)', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: isWinner ? 'var(--brand-yellow)' : 'var(--brand-indigo)',
                transition: 'width 400ms ease',
              }} />
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-clash)', fontSize: 18, letterSpacing: '-0.01em' }}>
              {item.n} <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 10, color: 'var(--brand-indigo-mute)', letterSpacing: '0.16em' }}>· {pct}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────── NPS block ─────────── */

function NPSBlock({ score, promoters, passives, detractors }: {
  score: number | null
  promoters: number
  passives: number
  detractors: number
}) {
  const tone = score == null ? 'var(--brand-indigo-mute)' : score >= 50 ? 'var(--brand-yellow)' : score >= 0 ? 'var(--brand-indigo)' : 'var(--brand-coral)'
  const total = promoters + passives + detractors
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 30, alignItems: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-clash)', fontSize: 72, lineHeight: 1, color: tone, letterSpacing: '-0.03em' }}>
          {score == null ? '—' : score}
        </div>
        <div style={{
          fontFamily: 'var(--font-fragment)',
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--brand-indigo-mute)',
          fontWeight: 700,
          marginTop: 4,
        }}>NPS SCORE</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NPSRow label="Promoters (9–10)" n={promoters} total={total} color="var(--brand-yellow)" />
        <NPSRow label="Passives (7–8)" n={passives} total={total} color="var(--brand-indigo-mid)" />
        <NPSRow label="Detractors (0–6)" n={detractors} total={total} color="var(--brand-coral)" />
      </div>
    </div>
  )
}

function NPSRow({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px', gap: 12, alignItems: 'center' }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <div style={{ height: 8, background: 'var(--brand-indigo-soft)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
      <span style={{ textAlign: 'right', fontFamily: 'var(--font-clash)', fontSize: 14 }}>{n} <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 10, color: 'var(--brand-indigo-mute)' }}>· {pct}%</span></span>
    </div>
  )
}

/* ─────────── Likert bars (1-5 averages) ─────────── */

function LikertBars({ items, scale, scaleLabel }: {
  items: { label: string; value: number | null }[]
  scale: number
  scaleLabel: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => {
          const pct = item.value != null ? (item.value / scale) * 100 : 0
          const tone = item.value == null
            ? 'var(--brand-indigo-soft)'
            : item.value >= 4
              ? 'var(--brand-yellow)'
              : item.value >= 3
                ? 'var(--brand-indigo)'
                : 'var(--brand-coral)'
          return (
            <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 70px', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>{item.label}</span>
              <div style={{ height: 8, background: 'var(--brand-indigo-soft)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: tone, transition: 'width 400ms ease' }} />
              </div>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-clash)', fontSize: 18 }}>
                {item.value == null ? '—' : item.value.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>
      <div style={{
        marginTop: 14,
        fontFamily: 'var(--font-fragment)',
        fontSize: 10,
        letterSpacing: '0.16em',
        color: 'var(--brand-indigo-mute)',
        fontWeight: 700,
      }}>SCALE: 1 → {scale} · {scaleLabel.toUpperCase()}</div>
    </div>
  )
}

/* ─────────── Word cloud (descriptor picks) ─────────── */

function WordCloud({ rows }: { rows: { word: string; picks: number }[] }) {
  if (rows.length === 0) return <p style={{ color: 'var(--brand-indigo-mute)' }}>No descriptor words selected yet.</p>
  const max = Math.max(...rows.map(r => r.picks))
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      {rows.map(r => {
        const ratio = r.picks / max
        const fontSize = 14 + ratio * 18 // 14-32px
        const opacity = 0.5 + ratio * 0.5
        return (
          <div key={r.word} style={{
            padding: '8px 14px',
            background: 'var(--brand-indigo)',
            color: 'var(--brand-sand)',
            borderRadius: 999,
            fontWeight: 600,
            fontSize,
            opacity,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {r.word}
            <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 11, opacity: 0.7 }}>{r.picks}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────── Dwell bars (avg seconds per palette) ─────────── */

function DwellBars({ rows }: { rows: { palette: string; avg_seconds: string }[] }) {
  if (rows.length === 0) return <p style={{ color: 'var(--brand-indigo-mute)' }}>No dwell data yet.</p>
  const items = rows.map(r => ({
    palette: r.palette,
    seconds: parseFloat(r.avg_seconds),
    name: THEMES.find(t => t.id === r.palette)?.name ?? r.palette,
  }))
  const max = Math.max(...items.map(i => i.seconds))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(item => {
        const pct = (item.seconds / max) * 100
        return (
          <div key={item.palette} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', gap: 14, alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
            <div style={{ height: 8, background: 'var(--brand-indigo-soft)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-indigo)' }} />
            </div>
            <span style={{ textAlign: 'right', fontFamily: 'var(--font-clash)', fontSize: 16 }}>
              {item.seconds.toFixed(0)}<span style={{ fontFamily: 'var(--font-fragment)', fontSize: 10, color: 'var(--brand-indigo-mute)' }}>s</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─────────── Recent submissions ─────────── */

function RecentList({ rows }: { rows: RecentResponse[] }) {
  if (rows.length === 0) return <p style={{ color: 'var(--brand-indigo-mute)' }}>Nothing yet.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((r, i) => {
        const themeName = THEMES.find(t => t.id === r.palette_vote)?.name ?? r.palette_vote
        const date = new Date(r.created_at)
        return (
          <div key={i} style={{
            padding: '14px 16px',
            background: 'var(--brand-sand)',
            border: '1px solid var(--brand-line)',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-fragment)',
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  color: 'var(--brand-indigo)',
                  background: 'var(--brand-yellow)',
                  padding: '2px 6px',
                  fontWeight: 700,
                  borderRadius: 2,
                }}>{themeName.toUpperCase()}</span>
                {r.role && <span style={{ fontSize: 12, color: 'var(--brand-indigo-mute)' }}>{r.role}</span>}
                {typeof r.responses?.nps === 'number' && (
                  <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 11, color: 'var(--brand-indigo-mute)' }}>
                    NPS {r.responses.nps}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-fragment)', fontSize: 10, color: 'var(--brand-indigo-mute)', letterSpacing: '0.14em' }}>
                {date.toLocaleString()}
              </span>
            </div>
            {r.whats_missing && (
              <div style={{
                marginTop: 8,
                padding: 12,
                background: 'var(--brand-paper)',
                borderLeft: '3px solid var(--brand-yellow)',
                borderRadius: 4,
                fontSize: 14,
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                &ldquo;{r.whats_missing}&rdquo;
              </div>
            )}
            {r.responses?.palette_words && r.responses.palette_words.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {r.responses.palette_words.map(w => (
                  <span key={w} style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    background: 'var(--brand-indigo-soft)',
                    color: 'var(--brand-indigo)',
                    borderRadius: 999,
                    fontWeight: 600,
                  }}>{w}</span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
