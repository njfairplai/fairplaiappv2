'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { BRAND_RAW } from '@/lib/constants'
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
      className={`border-t border-brand-line bg-brand-sand ${
        isMobile ? 'px-4 py-5' : 'px-9 py-6'
      }`}
    >
      <div className="flex items-center justify-between mb-3.5 gap-2.5 flex-wrap">
        <div className="font-fragment text-[10.5px] tracking-[0.22em] text-brand-indigo-mute font-bold">
          WORKLOAD &amp; GEAR
        </div>
      </div>

      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr' }}
      >
        {/* Fatigue tile — single big number + tier + trend chip. The
         *  detail stats (top sprint, sprints, dist/min) sit underneath
         *  as small stat cards. */}
        <div className="flex flex-col gap-2.5">
          <FatigueTile samples={sorted} size="wide" />
          {latest && (
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Top sprint" value={`${latest.topSprintKmh.toFixed(1)} km/h`} />
              <Stat label="Sprints" value={`${latest.sprintCount}`} />
              <Stat label="Dist / min" value={`${Math.round(latest.distancePerMinute)} m`} />
            </div>
          )}
        </div>

        {/* PPE / gear card */}
        <div className="bg-brand-paper border border-brand-line rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-fragment text-[10px] tracking-[0.22em] text-brand-indigo-mute font-bold">
              GEAR FLAGS
            </span>
            <button
              type="button"
              onClick={() => setPpeOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-brand-indigo rounded-md bg-transparent text-brand-indigo font-fragment text-[10px] tracking-[0.16em] font-bold cursor-pointer"
            >
              <Plus size={10} />
              FLAG
            </button>
          </div>
          {openPpe.length === 0 ? (
            <div className="font-satoshi text-[12.5px] text-brand-indigo-mute">
              No open gear flags.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {openPpe.map(flag => (
                <div
                  key={flag.id}
                  className="flex items-start gap-2 px-2.5 py-2 bg-brand-sand border border-brand-line rounded-lg"
                >
                  <AlertTriangle size={13} color={BRAND_RAW.coral} className="flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-satoshi text-[12.5px] font-semibold text-brand-indigo capitalize">
                      {flag.gearType.replace('_', ' ')}
                    </div>
                    <div className="font-satoshi text-xs text-brand-indigo-mid mt-0.5">
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
    <div className="bg-brand-sand border border-brand-line rounded-lg px-2 py-2 text-center">
      <div className="font-clash text-[15px] font-bold text-brand-indigo tracking-[-0.01em]">{value}</div>
      <div className="font-fragment text-[9px] tracking-[0.16em] text-brand-indigo-mute mt-1 font-bold">{label.toUpperCase()}</div>
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
      className="fixed inset-0 flex items-center justify-center z-[95] p-6"
      style={{
        background: 'rgba(11,8,40,0.62)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="bg-brand-paper border border-brand-line rounded-lg w-full max-w-[400px] px-[22px] py-5"
        style={{ boxShadow: '0 24px 56px rgba(11,8,40,0.4)' }}
      >
        <div className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold">
          GEAR FLAG · {playerName.toUpperCase()}
        </div>
        <div className="mt-3.5">
          <Label>Gear</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {GEAR_OPTIONS.map(opt => {
              const active = gearType === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGearType(opt.value)}
                  className={`px-2 py-[9px] border rounded-md font-satoshi text-[12.5px] font-semibold cursor-pointer ${
                    active
                      ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                      : 'border-brand-line bg-brand-sand text-brand-indigo'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-3.5">
          <Label>Note for parent</Label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What needs replacing or fixing?"
            rows={3}
            className="w-full px-3 py-[9px] border border-brand-line rounded-md font-satoshi text-[13.5px] text-brand-indigo bg-brand-sand outline-none resize-y box-border"
          />
        </div>
        <div className="mt-[18px] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border-0 bg-transparent font-satoshi text-[13px] text-brand-indigo-mute cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!notes.trim()}
            className={`px-4 py-2.5 border-0 rounded-md bg-brand-indigo text-brand-sand font-satoshi text-[13px] font-semibold ${
              notes.trim() ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-55'
            }`}
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
    <div className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold mb-1.5">
      {children}
    </div>
  )
}
