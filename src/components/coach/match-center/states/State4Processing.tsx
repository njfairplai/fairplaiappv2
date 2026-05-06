'use client'

import { BRAND, TYPE } from '@/lib/constants'
import {
  Card,
  MEyebrow,
  MDisplay,
  MStatusPill,
  VideoBlock,
} from '../atoms'

/**
 * State 4 — analysis in progress. Two-column layout: footage on the
 * left, ETA + progress on the right. The progress bar reads ~60% of
 * the way through stage 3 of 5 in the mock; once the API lands these
 * map to ProcessingStatus.stages[].
 */
export function State4Processing() {
  return (
    <Card style={{ padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <MStatusPill status="processing" animated />
        <span
          style={{
            color: BRAND.indigoMute,
            fontFamily: TYPE.mono,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            fontWeight: 700,
          }}
        >
          VS AL WASL ACADEMY · SUN 22 FEB · 3-1 W
        </span>
      </div>
      <div
        style={{
          marginTop: 14,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 24,
          alignItems: 'stretch',
        }}
      >
        <VideoBlock
          height={300}
          label="MATCH FOOTAGE"
          sub="SUN 22 FEB · UPLOADED 18:24"
          playable={false}
        />
        <div
          style={{
            padding: 22,
            background: BRAND.lineSoft,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <MEyebrow color={BRAND.indigoMute}>◐ ANALYSIS IN PROGRESS</MEyebrow>
          <MDisplay size={28} style={{ marginTop: 10 }}>
            Usually ~2 hours
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
            We&apos;re parsing 84 minutes of footage. Composite scores, MOTM, highlights and
            stats will appear here when done.
          </div>
          <div
            style={{
              marginTop: 18,
              height: 6,
              background: BRAND.indigoSoft,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '64%',
                height: '100%',
                background: BRAND.indigo,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: TYPE.mono,
              fontSize: 9.5,
              letterSpacing: '0.18em',
              color: BRAND.indigoMute,
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>STAGE 3 OF 5 · TAGGING EVENTS</span>
            <span>~42M LEFT</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
