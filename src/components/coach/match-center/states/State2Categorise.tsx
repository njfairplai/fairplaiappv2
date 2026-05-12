'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
import { writeSessionClassify } from '@/lib/match-center-state'
import {
  Card,
  MEyebrow,
  MDisplay,
  MStatusPill,
  VideoBlock,
  mcButtons,
} from '../atoms'

interface State2CategoriseProps {
  sessionId: string
  onToast: (message: string) => void
  onReclassify: (newStatus: 'prep' | 'drills') => void
}

/**
 * State 2 — past session, AI couldn't tell match vs drill from the
 * footage alone. Coach must categorise so we know whether to run match
 * analysis or shelve it. Both CTAs persist a classification override
 * (so a refresh respects the choice) and swap the contextual pane to
 * the appropriate state.
 */
export function State2Categorise({ sessionId, onToast, onReclassify }: State2CategoriseProps) {
  const isMobile = useIsMobile()
  function markAsMatch() {
    writeSessionClassify(sessionId, 'prep')
    onToast('Marked as match — set the lineup')
    onReclassify('prep')
  }
  function markAsDrills() {
    writeSessionClassify(sessionId, 'drills')
    onToast('Marked as drills only')
    onReclassify('drills')
  }

  return (
    <Card className={isMobile ? 'p-4' : 'p-[26px]'}>
      <div className="flex items-center gap-[10px] flex-wrap">
        <MStatusPill status="uncategorised" />
        <span className="text-brand-indigo-mute font-fragment text-[10.5px] tracking-[0.18em] font-bold">
          MON 12 FEB · PITCH 2 · 1H 24M FOOTAGE
        </span>
      </div>
      <div
        className={`mt-[14px] grid ${
          isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-[1.4fr_1fr] gap-6'
        }`}
      >
        <VideoBlock
          height={isMobile ? 200 : 320}
          label="UNCATEGORISED FOOTAGE"
          sub="MON 12 FEB · PITCH 2"
          playable={false}
        />
        <div className="p-[22px] bg-brand-sand border border-brand-line rounded-md flex flex-col justify-center">
          <MEyebrow color="var(--brand-coral)">WE NEED YOUR HELP</MEyebrow>
          <MDisplay size={28} className="mt-[10px]">
            Was this a match or a drill session?
          </MDisplay>
          <div className="font-satoshi text-[13px] text-brand-indigo-mid mt-[10px] leading-[1.5]">
            We can&apos;t tell from the footage alone. Categorise so we know whether to run
            match analysis or shelve it.
          </div>
          <div className="mt-[18px] flex flex-col gap-2">
            <button
              type="button"
              style={{ ...mcButtons.primary, padding: '11px 14px' }}
              onClick={markAsMatch}
            >
              Mark as match · enter lineup →
            </button>
            <button
              type="button"
              style={{ ...mcButtons.ghost, padding: '11px 14px' }}
              onClick={markAsDrills}
            >
              Mark as drills only
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
