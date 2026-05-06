'use client'

import { BRAND, TYPE } from '@/lib/constants'
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
    <Card style={{ padding: isMobile ? 16 : 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <MStatusPill status="uncategorised" />
        <span
          style={{
            color: BRAND.indigoMute,
            fontFamily: TYPE.mono,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            fontWeight: 700,
          }}
        >
          MON 12 FEB · PITCH 2 · 1H 24M FOOTAGE
        </span>
      </div>
      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr',
          gap: isMobile ? 16 : 24,
        }}
      >
        <VideoBlock
          height={isMobile ? 200 : 320}
          label="UNCATEGORISED FOOTAGE"
          sub="MON 12 FEB · PITCH 2"
          playable={false}
        />
        <div
          style={{
            padding: 22,
            background: BRAND.sand,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <MEyebrow color={BRAND.coral}>WE NEED YOUR HELP</MEyebrow>
          <MDisplay size={28} style={{ marginTop: 10 }}>
            Was this a match or a drill session?
          </MDisplay>
          <div
            style={{
              fontFamily: TYPE.body,
              fontSize: 13,
              color: BRAND.indigoMid,
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            We can&apos;t tell from the footage alone. Categorise so we know whether to run
            match analysis or shelve it.
          </div>
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
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
