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
      style={{
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-body)',
        minHeight: 'calc(100vh - 108px)',
      }}
    >
      {/* Header */}
      <section
        style={{
          padding: isMobile ? '16px 16px 14px' : '24px 36px 18px',
          borderBottom: '1px solid var(--brand-line)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            color: 'var(--brand-indigo)',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.22em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            COMPARE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 26 : 36,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              marginTop: 2,
            }}
          >
            Stack players, side by side.
          </div>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            color: 'var(--brand-indigo-mute)',
            fontWeight: 700,
          }}
        >
          UP TO {MAX_PLAYERS} PLAYERS
        </span>
      </section>

      {/* Chip rail */}
      <section
        style={{
          padding: isMobile ? '14px 16px' : '18px 36px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          borderBottom: '1px solid var(--brand-line)',
          background: 'var(--brand-paper)',
        }}
      >
        {rows.map(r => {
          const p = players.find(x => x.id === r.id)
          if (!p) return null
          return (
            <span
              key={r.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px 6px 6px',
                borderRadius: 999,
                background: 'var(--brand-sand)',
                border: `1.5px solid ${r.color}`,
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--brand-indigo)',
              }}
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
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--brand-indigo-mute)',
                  display: 'inline-flex',
                }}
              >
                <X size={14} />
              </button>
            </span>
          )
        })}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => setPickerOpen(o => !o)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: canAddMore ? 'var(--brand-indigo)' : 'var(--brand-line-soft)',
              color: canAddMore ? 'var(--brand-sand)' : 'var(--brand-indigo-mute)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 700,
              cursor: canAddMore ? 'pointer' : 'not-allowed',
              letterSpacing: '0.01em',
            }}
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
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--brand-indigo-mute)',
              fontWeight: 700,
            }}
          >
            ADD AT LEAST 2 TO START
          </span>
        )}
      </section>

      {/* Content */}
      {selected.length < 2 ? (
        <EmptyState onAdd={() => setPickerOpen(true)} />
      ) : (
        <section
          style={{
            padding: isMobile ? '20px 16px' : '28px 36px',
            display: 'grid',
            gap: 22,
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
          }}
        >
          <div
            style={{
              background: 'var(--brand-paper)',
              border: '1px solid var(--brand-line)',
              borderRadius: 12,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              gridColumn: isMobile ? 'auto' : '1 / -1',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
                borderTop: '2px solid var(--brand-indigo)',
                paddingTop: 8,
              }}
            >
              SHAPE OVERLAY
            </div>
            <CompareRadar rows={rows} size={isMobile ? 280 : 380} />
          </div>

          <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
            <CompareDiffStrip rows={rows} />
          </div>

          <div style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
            <CompareTrendChart rows={trendRows} />
          </div>
        </section>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <section
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          color: 'var(--brand-indigo)',
          letterSpacing: '-0.02em',
        }}
      >
        Pick two players to start.
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--brand-indigo-mute)',
          maxWidth: 420,
        }}
      >
        Stack their season radars, see who leads each category, and track
        composite trajectories side by side.
      </div>
      <button
        type="button"
        onClick={onAdd}
        style={{
          marginTop: 8,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          background: 'var(--brand-indigo)',
          color: 'var(--brand-sand)',
          border: 'none',
          borderRadius: 999,
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
        }}
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
