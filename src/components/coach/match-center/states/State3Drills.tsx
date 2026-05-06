'use client'

import { BRAND, TYPE } from '@/lib/constants'
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
    <Card style={{ padding: isMobile ? 16 : 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <MStatusPill status="drills" />
        <span
          style={{
            color: BRAND.indigoMute,
            fontFamily: TYPE.mono,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            fontWeight: 700,
          }}
        >
          WED 14 FEB · PITCH 2 · 58M
        </span>
      </div>
      <div style={{ marginTop: 14 }}>
        <VideoBlock height={isMobile ? 220 : 340} label="DRILLS SESSION" sub="WED 14 FEB · PITCH 2" />
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 14,
            color: BRAND.indigoMid,
          }}
        >
          Drills session.{' '}
          <span style={{ color: BRAND.indigoMute }}>No analysis.</span>
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
