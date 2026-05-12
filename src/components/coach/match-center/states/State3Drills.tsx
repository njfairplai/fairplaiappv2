'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
import { writeSessionClassify } from '@/lib/match-center-state'
import { Card, MStatusPill, VideoBlock, mcButtons } from '../atoms'

interface State3DrillsProps {
  sessionId: string
  onToast: (message: string) => void
  onReclassify: (newStatus: 'prep') => void
}

/**
 * State 3 — drills session, no analysis. Escape hatch lets the coach
 * reclassify to match if the AI got it wrong. Reclassify persists +
 * swaps the pane to State 1 Prep.
 */
export function State3Drills({ sessionId, onToast, onReclassify }: State3DrillsProps) {
  const isMobile = useIsMobile()
  function markAsMatch() {
    writeSessionClassify(sessionId, 'prep')
    onToast('Reclassified as match')
    onReclassify('prep')
  }

  return (
    <Card className={isMobile ? 'p-4' : 'p-[26px]'}>
      <div className="flex items-center gap-[10px] flex-wrap">
        <MStatusPill status="drills" />
        <span className="text-brand-indigo-mute font-fragment text-[10.5px] tracking-[0.18em] font-bold">
          WED 14 FEB · PITCH 2 · 58M
        </span>
      </div>
      <div className="mt-[14px]">
        <VideoBlock height={isMobile ? 220 : 340} label="DRILLS SESSION" sub="WED 14 FEB · PITCH 2" />
      </div>
      <div className="mt-4 text-center">
        <div className="font-satoshi text-sm text-brand-indigo-mid">
          Drills session.{' '}
          <span className="text-brand-indigo-mute">No analysis.</span>
        </div>
        <button
          type="button"
          style={{ ...mcButtons.text, marginTop: 8, fontSize: 11 }}
          onClick={markAsMatch}
        >
          Actually it was a match → enter lineup
        </button>
      </div>
    </Card>
  )
}
