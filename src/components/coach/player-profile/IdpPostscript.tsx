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
    <section className="bg-brand-indigo text-brand-sand px-9 pt-10 pb-12">
      <div
        className="grid items-baseline gap-6"
        style={{ gridTemplateColumns: '160px 1fr auto' }}
      >
        <span className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-yellow font-bold border-t-2 border-brand-yellow pt-2">
          GOALS
        </span>
        <span className="flex-1" />
        <Link
          href={`/coach/web/idps?player=${player.id}`}
          className="bg-brand-yellow text-brand-indigo border-0 px-[18px] py-3 rounded-full font-satoshi font-bold text-sm cursor-pointer inline-flex items-center gap-1.5 no-underline"
        >
          {hasDraft ? 'Open IDP' : 'Start IDP'} <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-6">
        {hasDraft ? (
          <>
            <ol className="list-none m-0 p-0 flex flex-col">
              {goals.map((g, i) => (
                <li
                  key={i}
                  className="grid gap-[18px] py-[18px] items-baseline"
                  style={{
                    gridTemplateColumns: '64px 1fr',
                    borderBottom:
                      i === goals.length - 1
                        ? 'none'
                        : '1px solid rgba(238, 228, 200, 0.12)',
                  }}
                >
                  <span className="font-clash text-[28px] text-brand-yellow tracking-[-0.02em]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-clash text-[22px] text-brand-sand leading-tight tracking-[-0.01em]">
                    {g}
                  </span>
                </li>
              ))}
            </ol>
            {draft && (
              <div className="mt-[22px] font-fragment text-[11px] tracking-[0.18em] text-brand-sand/60 font-semibold">
                LAST REVIEWED · {formatRelative(draft.savedAt).toUpperCase()}
              </div>
            )}
          </>
        ) : (
          <div className="py-8 font-satoshi text-sm text-brand-sand/70 max-w-[540px] leading-relaxed">
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
