'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { BRAND, TYPE } from '@/lib/constants'
import {
  getFatigueSamplesForPlayer,
  getPPEFlagsForPlayer,
} from '@/lib/parent-portal'
import { flagPPE } from '@/lib/match-center'
import type { FatigueSample, PPEFlag, PPEGearType } from '@/lib/types'
import { Toast } from '@/components/coach/match-center/Toast'
import { FatigueTile } from '@/components/welfare/FatigueTile'

/* Workload + PPE section for the coach player profile. Lives below the
 * IDP postscript so it doesn't fight the match/season story above it.
 *
 * Renders:
 *   - Fatigue trend line (mocked 0–100, AI swap later)
 *   - Top sprint speed + sprint count from the most recent sample
 *   - Open PPE flag list + an inline "Flag gear issue" sheet
 */

interface WorkloadSectionProps {
  playerId: string
  playerName: string
  isMobile: boolean
}

const GEAR_OPTIONS: { value: PPEGearType; label: string }[] = [
  { value: 'boots', label: 'Boots' },
  { value: 'shin_guards', label: 'Shin guards' },
  { value: 'kit', label: 'Kit' },
  { value: 'other', label: 'Other' },
]

export function WorkloadSection({ playerId, playerName, isMobile }: WorkloadSectionProps) {
  const [tick, setTick] = useState(0)
  const [samples, setSamples] = useState<FatigueSample[]>([])
  const [ppe, setPpe] = useState<PPEFlag[]>([])
  const [ppeOpen, setPpeOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Hydrate from localStorage post-mount so SSR is stable.
  useEffect(() => {
    setSamples(getFatigueSamplesForPlayer(playerId))
    setPpe(getPPEFlagsForPlayer(playerId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, tick])

  const sorted = [...samples].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]
  const openPpe = ppe.filter(f => f.status === 'open')

  return (
    <section
      style={{
        padding: isMobile ? '20px 16px' : '24px 36px',
        borderTop: `1px solid ${BRAND.line}`,
        background: BRAND.sand,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10.5,
            letterSpacing: '0.22em',
            color: BRAND.indigoMute,
            fontWeight: 700,
          }}
        >
          WORKLOAD &amp; GEAR
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr',
          gap: 14,
        }}
      >
        {/* Fatigue tile — single big number + tier + trend chip. The
         *  detail stats (top sprint, sprints, dist/min) sit underneath
         *  as small stat cards. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FatigueTile samples={sorted} size="wide" />
          {latest && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
              }}
            >
              <Stat label="Top sprint" value={`${latest.topSprintKmh.toFixed(1)} km/h`} />
              <Stat label="Sprints" value={`${latest.sprintCount}`} />
              <Stat label="Dist / min" value={`${Math.round(latest.distancePerMinute)} m`} />
            </div>
          )}
        </div>

        {/* PPE / gear card */}
        <div
          style={{
            background: BRAND.paper,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 10,
                letterSpacing: '0.22em',
                color: BRAND.indigoMute,
                fontWeight: 700,
              }}
            >
              GEAR FLAGS
            </span>
            <button
              type="button"
              onClick={() => setPpeOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px',
                border: `1px solid ${BRAND.indigo}`, borderRadius: 6,
                background: 'transparent', color: BRAND.indigo,
                fontFamily: TYPE.mono, fontSize: 10, letterSpacing: '0.16em', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={10} />
              FLAG
            </button>
          </div>
          {openPpe.length === 0 ? (
            <div style={{ fontFamily: TYPE.body, fontSize: 12.5, color: BRAND.indigoMute }}>
              No open gear flags.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {openPpe.map(flag => (
                <div
                  key={flag.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: '8px 10px',
                    background: BRAND.sand,
                    border: `1px solid ${BRAND.line}`,
                    borderRadius: 8,
                  }}
                >
                  <AlertTriangle size={13} color={BRAND.coral} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: TYPE.body, fontSize: 12.5, fontWeight: 600,
                        color: BRAND.indigo, textTransform: 'capitalize',
                      }}
                    >
                      {flag.gearType.replace('_', ' ')}
                    </div>
                    <div
                      style={{ fontFamily: TYPE.body, fontSize: 12, color: BRAND.indigoMid, marginTop: 2 }}
                    >
                      {flag.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {ppeOpen && (
        <PPESheet
          playerId={playerId}
          playerName={playerName}
          onClose={() => setPpeOpen(false)}
          onSaved={() => setTick(t => t + 1)}
        />
      )}
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: BRAND.sand, border: `1px solid ${BRAND.line}`, borderRadius: 8, padding: '8px 8px', textAlign: 'center' }}>
      <div style={{ fontFamily: TYPE.display, fontSize: 15, fontWeight: 700, color: BRAND.indigo, letterSpacing: '-0.01em' }}>{value}</div>
      <div style={{ fontFamily: TYPE.mono, fontSize: 9, letterSpacing: '0.16em', color: BRAND.indigoMute, marginTop: 4, fontWeight: 700 }}>{label.toUpperCase()}</div>
    </div>
  )
}

function PPESheet({
  playerId,
  playerName,
  onClose,
  onSaved,
}: {
  playerId: string
  playerName: string
  onClose: () => void
  onSaved: () => void
}) {
  const [gearType, setGearType] = useState<PPEGearType>('boots')
  const [notes, setNotes] = useState('')

  function save() {
    if (!notes.trim()) return
    flagPPE({ playerId, gearType, notes: notes.trim() })
    onSaved()
    onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11,8,40,0.62)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 95, padding: 24,
      }}
    >
      <div
        style={{
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderRadius: 8,
          width: '100%', maxWidth: 400,
          padding: '20px 22px',
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em',
            color: BRAND.indigoMute, fontWeight: 700,
          }}
        >
          GEAR FLAG · {playerName.toUpperCase()}
        </div>
        <div style={{ marginTop: 14 }}>
          <Label>Gear</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {GEAR_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGearType(opt.value)}
                style={{
                  padding: '9px 8px',
                  border: `1px solid ${gearType === opt.value ? BRAND.indigo : BRAND.line}`,
                  borderRadius: 6,
                  background: gearType === opt.value ? BRAND.indigo : BRAND.sand,
                  color: gearType === opt.value ? BRAND.sand : BRAND.indigo,
                  fontFamily: TYPE.body, fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Label>Note for parent</Label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What needs replacing or fixing?"
            rows={3}
            style={{
              width: '100%', padding: '9px 12px',
              border: `1px solid ${BRAND.line}`, borderRadius: 6,
              fontFamily: TYPE.body, fontSize: 13.5, color: BRAND.indigo,
              background: BRAND.sand, outline: 'none', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px', border: 'none', background: 'transparent',
              fontFamily: TYPE.body, fontSize: 13, color: BRAND.indigoMute,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!notes.trim()}
            style={{
              padding: '10px 16px',
              border: 'none', borderRadius: 6,
              background: BRAND.indigo, color: BRAND.sand,
              fontFamily: TYPE.body, fontSize: 13, fontWeight: 600,
              cursor: notes.trim() ? 'pointer' : 'not-allowed',
              opacity: notes.trim() ? 1 : 0.55,
            }}
          >
            Send to parent
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em',
        color: BRAND.indigoMute, fontWeight: 700, marginBottom: 6,
      }}
    >
      {children}
    </div>
  )
}
