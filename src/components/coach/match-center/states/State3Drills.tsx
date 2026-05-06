'use client'

import { BRAND, TYPE } from '@/lib/constants'
import { Card, MStatusPill, VideoBlock, mcButtons } from '../atoms'

/**
 * State 3 — drills session, no analysis. The coach can review the
 * footage but no match analysis runs. An escape hatch lets them
 * re-categorise if the AI got it wrong.
 */
export function State3Drills() {
  return (
    <Card style={{ padding: 26 }}>
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
        <VideoBlock height={340} label="DRILLS SESSION" sub="WED 14 FEB · PITCH 2" />
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
        <button type="button" style={{ ...mcButtons.text, marginTop: 8, fontSize: 11 }}>
          Actually it was a match → enter lineup
        </button>
      </div>
    </Card>
  )
}
