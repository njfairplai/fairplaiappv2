'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Player } from '@/lib/types'

interface IdpPostscriptProps {
  player: Player
}

interface IdpDraft {
  attitude: number
  effort: number
  coachability: number
  sportsmanship: number
  observation: string
  goals: string[]
  savedAt: number
}

/**
 * Closing section of the player profile — the IDP postscript.
 *
 * Path 1 (the simple version, post-feedback):
 *   - "GOALS" eyebrow, no "THE PLAN" magazine framing
 *   - Numbered list of goals (no per-goal status chips — those return when
 *     the goal library + AI auto-tracking land)
 *   - Footer: "Last reviewed X · Coach Y" + "Open IDP →" CTA
 *   - Indigo background to close the page on a darker note
 *
 * Reads the IDP draft from localStorage (`fairplai_idp_drafts` keyed by
 * playerId). Renders empty state if no draft exists.
 */
export function IdpPostscript({ player }: IdpPostscriptProps) {
  const [draft, setDraft] = useState<IdpDraft | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fairplai_idp_drafts')
      if (!raw) return
      const all = JSON.parse(raw) as Record<string, IdpDraft>
      setDraft(all[player.id] ?? null)
    } catch {
      // localStorage may be unavailable; show empty state
    }
  }, [player.id])

  const hasDraft = !!draft && draft.goals.filter(g => g.trim()).length > 0
  const goals = (draft?.goals ?? []).filter(g => g.trim())

  return (
    <section
      style={{
        background: 'var(--brand-indigo)',
        color: 'var(--brand-sand)',
        padding: '40px 36px 48px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr auto',
          gap: 24,
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: 'var(--brand-yellow)',
            fontWeight: 700,
            borderTop: '2px solid var(--brand-yellow)',
            paddingTop: 8,
          }}
        >
          GOALS
        </span>
        <span style={{ flex: 1 }} />
        <Link
          href={`/coach/web/idps?player=${player.id}`}
          style={{
            background: 'var(--brand-yellow)',
            color: 'var(--brand-indigo)',
            border: 'none',
            padding: '12px 18px',
            borderRadius: 999,
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
          }}
        >
          {hasDraft ? 'Open IDP' : 'Start IDP'} <ChevronRight size={16} />
        </Link>
      </div>

      <div style={{ marginTop: 24 }}>
        {hasDraft ? (
          <>
            <ol
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {goals.map((g, i) => (
                <li
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr',
                    gap: 18,
                    padding: '18px 0',
                    borderBottom:
                      i === goals.length - 1
                        ? 'none'
                        : '1px solid rgba(238, 228, 200, 0.12)',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 28,
                      color: 'var(--brand-yellow)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 22,
                      color: 'var(--brand-sand)',
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {g}
                  </span>
                </li>
              ))}
            </ol>
            {draft && (
              <div
                style={{
                  marginTop: 22,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: 'rgba(238, 228, 200, 0.6)',
                  fontWeight: 600,
                }}
              >
                LAST REVIEWED · {formatRelative(draft.savedAt).toUpperCase()}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: '32px 0',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'rgba(238, 228, 200, 0.7)',
              maxWidth: 540,
              lineHeight: 1.55,
            }}
          >
            No development goals set yet for {player.firstName}. Start an IDP to capture
            what you're working on this term.
          </div>
        )}
      </div>
    </section>
  )
}

/** Pretty-print a relative date — "today", "X days ago", "X weeks ago". */
function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}
