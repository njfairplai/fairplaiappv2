'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, X, Plus } from 'lucide-react'
import { players, matchAnalyses } from '@/lib/mockData'
import { getPlayerProgression } from '@/lib/player-progression'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'
import { CompareRadar, type ComparePlayerRow } from '@/components/coach/compare/CompareRadar'
import { CompareDiffStrip } from '@/components/coach/compare/CompareDiffStrip'
import {
  CompareTrendChart,
  type CompareTrendRow,
} from '@/components/coach/compare/CompareTrendChart'
import { PlayerPickerPopover } from '@/components/coach/compare/PlayerPickerPopover'
import { cn } from '@/lib/cn'

const MAX_PLAYERS = 3
/** Brand-aligned series colours; legibility falls off past 3 overlays. */
const SERIES_COLORS = ['var(--brand-indigo)', 'var(--brand-yellow)', 'var(--brand-coral)']

/**
 * Coach compare page. Reads `?players=<id>,<id>,<id>` and renders an overlay
 * radar + per-axis diff bars + season composite trajectory for up to 3
 * players. Add/remove via chip rail; URL stays in sync so the page is
 * shareable and back-button friendly.
 */
function CompareInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const [pickerOpen, setPickerOpen] = useState(false)

  const idsFromUrl = useMemo(() => {
    const raw = searchParams.get('players') ?? ''
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .filter(id => players.some(p => p.id === id))
      .slice(0, MAX_PLAYERS)
  }, [searchParams])

  const [selected, setSelected] = useState<string[]>(idsFromUrl)

  // Keep state synced with URL (back/forward navigation, paste-link).
  useEffect(() => {
    setSelected(idsFromUrl)
  }, [idsFromUrl])

  const writeUrl = (next: string[]) => {
    const qs = next.length ? `?players=${next.join(',')}` : ''
    router.replace(`/coach/web/compare${qs}`)
  }

  const addPlayer = (id: string) => {
    if (selected.includes(id) || selected.length >= MAX_PLAYERS) return
    const next = [...selected, id]
    setSelected(next)
    writeUrl(next)
    setPickerOpen(false)
  }

  const removePlayer = (id: string) => {
    const next = selected.filter(s => s !== id)
    setSelected(next)
    writeUrl(next)
  }

  const rows: ComparePlayerRow[] = useMemo(
    () =>
      selected.map((id, i) => {
        const p = players.find(x => x.id === id)
        return {
          id,
          label: p ? `${p.firstName} ${p.lastName[0]}.` : id,
          color: SERIES_COLORS[i] ?? SERIES_COLORS[0],
          records: matchAnalyses.filter(a => a.playerId === id),
        }
      }),
    [selected],
  )

  const trendRows: CompareTrendRow[] = useMemo(
    () =>
      selected.map((id, i) => {
        const p = players.find(x => x.id === id)
        return {
          id,
          label: p ? `${p.firstName} ${p.lastName[0]}.` : id,
          color: SERIES_COLORS[i] ?? SERIES_COLORS[0],
          progression: getPlayerProgression(id),
        }
      }),
    [selected],
  )

  const canAddMore = selected.length < MAX_PLAYERS

  return (
    <div
      className="bg-brand-sand text-brand-indigo font-satoshi"
      style={{ minHeight: 'calc(100vh - 108px)' }}
    >
      {/* Header */}
      <section
        className={cn(
          'flex flex-wrap items-center gap-4 border-b border-brand-line',
          isMobile ? 'px-4 pt-4 pb-3.5' : 'px-9 pt-6 pb-[18px]',
        )}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-brand-line bg-brand-paper text-brand-indigo"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <div className="font-fragment text-[11px] font-bold tracking-[0.22em] text-brand-indigo-mute">
            COMPARE
          </div>
          <div
            className={cn(
              'font-clash mt-0.5 tracking-[-0.02em] leading-[1.05]',
              isMobile ? 'text-[26px]' : 'text-4xl',
            )}
          >
            Stack players, side by side.
          </div>
        </div>
        <span className="ml-auto font-fragment text-[10.5px] font-bold tracking-[0.18em] text-brand-indigo-mute">
          UP TO {MAX_PLAYERS} PLAYERS
        </span>
      </section>

      {/* Chip rail */}
      <section
        className={cn(
          'flex flex-wrap items-center gap-2.5 border-b border-brand-line bg-brand-paper',
          isMobile ? 'px-4 py-3.5' : 'px-9 py-[18px]',
        )}
      >
        {rows.map(r => {
          const p = players.find(x => x.id === r.id)
          if (!p) return null
          return (
            <span
              key={r.id}
              className="inline-flex items-center gap-2 rounded-full bg-brand-sand pl-1.5 pr-2.5 py-1.5 font-satoshi text-[13px] font-semibold text-brand-indigo"
              style={{ border: `1.5px solid ${r.color}` }}
            >
              <PlayerGlyph
                size={26}
                jerseyNumber={p.jerseyNumber}
                name={`${p.firstName} ${p.lastName}`}
              />
              {p.firstName} {p.lastName[0]}.
              <button
                type="button"
                onClick={() => removePlayer(r.id)}
                aria-label={`Remove ${p.firstName}`}
                className="inline-flex cursor-pointer border-none bg-transparent text-brand-indigo-mute"
              >
                <X size={14} />
              </button>
            </span>
          )
        })}

        <div className="relative">
          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => setPickerOpen(o => !o)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border-none px-3.5 py-2 font-satoshi text-[13px] font-bold tracking-[0.01em]',
              canAddMore
                ? 'cursor-pointer bg-brand-indigo text-brand-sand'
                : 'cursor-not-allowed bg-brand-line-soft text-brand-indigo-mute',
            )}
          >
            <Plus size={14} />
            Add player
          </button>
          <PlayerPickerPopover
            pool={players}
            excluded={selected}
            open={pickerOpen && canAddMore}
            onClose={() => setPickerOpen(false)}
            onPick={addPlayer}
            align="left"
          />
        </div>

        {selected.length < 2 && (
          <span className="font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            ADD AT LEAST 2 TO START
          </span>
        )}
      </section>

      {/* Content */}
      {selected.length < 2 ? (
        <EmptyState onAdd={() => setPickerOpen(true)} />
      ) : (
        <section
          className={cn(
            'grid gap-[22px]',
            isMobile ? 'px-4 py-5 grid-cols-1' : 'px-9 py-7 grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-3.5 rounded-xl border border-brand-line bg-brand-paper px-[22px] py-5',
              !isMobile && 'col-span-full',
            )}
          >
            <div className="font-fragment text-[10.5px] font-bold tracking-[0.22em] text-brand-indigo-mute border-t-2 border-brand-indigo pt-2">
              SHAPE OVERLAY
            </div>
            <CompareRadar rows={rows} size={isMobile ? 280 : 380} />
          </div>

          <div className={cn(!isMobile && 'col-span-full')}>
            <CompareDiffStrip rows={rows} />
          </div>

          <div className={cn(!isMobile && 'col-span-full')}>
            <CompareTrendChart rows={trendRows} />
          </div>
        </section>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="flex flex-col items-center gap-3.5 px-6 py-[60px] text-center">
      <div className="font-clash text-[28px] tracking-[-0.02em] text-brand-indigo">
        Pick two players to start.
      </div>
      <div className="font-satoshi text-sm text-brand-indigo-mute max-w-[420px]">
        Stack their season radars, see who leads each category, and track
        composite trajectories side by side.
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full border-none bg-brand-indigo px-[18px] py-2.5 font-satoshi text-[13px] font-bold text-brand-sand"
      >
        <Plus size={14} />
        Add a player
      </button>
    </section>
  )
}

export default function CoachWebComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareInner />
    </Suspense>
  )
}
