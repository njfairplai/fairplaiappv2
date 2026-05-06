'use client'

import { BRAND, TYPE } from '@/lib/constants'
import {
  Card,
  MEyebrow,
  MDisplay,
  MStatusPill,
  VideoBlock,
  mcButtons,
} from '../atoms'

/**
 * State 2 — past session, AI couldn't tell match vs drill from the
 * footage alone. The coach has to categorise so the system knows
 * whether to run match analysis or shelve it. Two-column layout:
 * uncategorised footage on the left, prompt + CTAs on the right.
 */
export function State2Categorise() {
  return (
    <Card style={{ padding: 26 }}>
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
          gridTemplateColumns: '1.4fr 1fr',
          gap: 24,
        }}
      >
        <VideoBlock
          height={320}
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
            <button type="button" style={{ ...mcButtons.primary, padding: '11px 14px' }}>
              Mark as match · enter lineup →
            </button>
            <button type="button" style={{ ...mcButtons.ghost, padding: '11px 14px' }}>
              Mark as drills only
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
