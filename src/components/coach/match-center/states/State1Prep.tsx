'use client'

import { useState } from 'react'
import { BRAND, TYPE } from '@/lib/constants'
import { MATCH_CENTER_ROSTER } from '@/lib/match-center'
import {
  Card,
  MEyebrow,
  MDisplay,
  MStatusPill,
  MiniAvatar,
  mcButtons,
} from '../atoms'

/* State 1 — upcoming match prep.
 *
 * Three tabs (Bibs hidden for competitive matches):
 *   01 · Attendance — roster check, jersey numbers, present checkbox
 *   02 · Lineup     — drag onto a 4-3-3 (or skip and let AI infer)
 *   03 · Confirm    — summary + what-happens-next
 *
 * Shares the eyebrow / display / mono-meta / pill rhythm with the other
 * four states. The footer CTA bar is sticky-feeling at the bottom of
 * the card. */

export function State1Prep() {
  const [tab, setTab] = useState<'attendance' | 'lineup' | 'confirm'>('attendance')

  return (
    <Card style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '20px 26px',
          borderBottom: `1px solid ${BRAND.line}`,
          background: 'rgba(235,77,109,0.10)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <MStatusPill status="prep" />
          <span
            style={{
              color: BRAND.indigoMute,
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              fontWeight: 700,
            }}
          >
            VS AL WASL ACADEMY · SAT 28 FEB · 15:00 · PITCH 1
          </span>
        </div>
        <MDisplay size={36} style={{ marginTop: 10 }}>
          Plan your matchday
        </MDisplay>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            marginTop: 6,
          }}
        >
          Confirm attendance and lineup. Bib colours don&apos;t apply for competitive matches.
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${BRAND.line}`,
          background: BRAND.sand,
          padding: '0 26px',
          flexWrap: 'wrap',
        }}
      >
        {(['attendance', 'lineup', 'confirm'] as const).map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              position: 'relative',
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: tab === t ? BRAND.indigo : BRAND.indigoMute,
              textTransform: 'uppercase',
            }}
          >
            {String(i + 1).padStart(2, '0')} · {t}
            {tab === t && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: BRAND.indigo,
                }}
              />
            )}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span
          style={{
            alignSelf: 'center',
            fontFamily: TYPE.mono,
            fontSize: 10,
            color: BRAND.indigoMute,
            letterSpacing: '0.18em',
          }}
        >
          14 PRESENT · 2 OUT
        </span>
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 26px', minHeight: 380 }}>
        {tab === 'attendance' && <PrepAttendance />}
        {tab === 'lineup' && <PrepLineup />}
        {tab === 'confirm' && <PrepConfirm />}
      </div>

      {/* Footer CTA bar */}
      <div
        style={{
          padding: '14px 26px',
          borderTop: `1px solid ${BRAND.line}`,
          background: BRAND.sand,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button type="button" style={mcButtons.text}>
          Mark as drills only ↗
        </button>
        <span style={{ flex: 1 }} />
        <button type="button" style={mcButtons.ghost}>
          Save draft
        </button>
        <button type="button" style={mcButtons.primary}>
          Confirm prep →
        </button>
      </div>
    </Card>
  )
}

function PrepAttendance() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <MEyebrow>ROSTER · 16 PLAYERS</MEyebrow>
        <button type="button" style={mcButtons.text}>
          Mark all present →
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0 24px',
          border: `1px solid ${BRAND.line}`,
          borderRadius: 4,
          background: '#fff',
        }}
      >
        {MATCH_CENTER_ROSTER.map((p, i) => (
          <div
            key={p.num}
            style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr 38px 60px 28px',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderBottom:
                i < MATCH_CENTER_ROSTER.length - 2 ? `1px solid ${BRAND.line}` : 'none',
            }}
          >
            <MiniAvatar num={p.num} />
            <div
              style={{
                fontFamily: TYPE.body,
                fontSize: 12.5,
                fontWeight: 600,
                color: BRAND.indigo,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {p.name}
            </div>
            <span
              style={{
                fontFamily: TYPE.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: BRAND.indigoMute,
                border: `1px solid ${BRAND.line}`,
                padding: '2px 4px',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              {p.pos}
            </span>
            <input
              defaultValue={p.num}
              style={{
                fontFamily: TYPE.mono,
                fontSize: 11,
                fontWeight: 700,
                color: BRAND.indigo,
                border: `1px solid ${BRAND.line}`,
                borderRadius: 3,
                padding: '3px 6px',
                width: 50,
                textAlign: 'center',
                background: BRAND.paper,
              }}
            />
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                border: `1.5px solid ${p.present ? BRAND.indigo : BRAND.line}`,
                background: p.present ? BRAND.indigo : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND.sand,
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              {p.present && '✓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Vertical pitch isn't used here per the design — the lineup tab uses a
 * landscape pitch with 4-3-3 dots. */
const FORMATION: [number, number, string, number, string?][] = [
  [0.06, 0.5, 'GK', 1, BRAND.yellow],
  [0.22, 0.18, 'LB', 5],
  [0.22, 0.40, 'CB', 4],
  [0.22, 0.60, 'CB', 3],
  [0.22, 0.82, 'RB', 2],
  [0.45, 0.28, 'CM', 6],
  [0.45, 0.50, 'CM', 8],
  [0.45, 0.72, 'CAM', 10],
  [0.72, 0.20, 'LW', 11],
  [0.72, 0.50, 'ST', 9],
  [0.72, 0.80, 'RW', 7],
]

function PrepLineup() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <MEyebrow>FORMATION · 4-3-3</MEyebrow>
        <button type="button" style={mcButtons.text}>
          Change formation ↓
        </button>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 320,
          background: BRAND.indigo,
          borderRadius: 6,
          overflow: 'hidden',
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 40px, rgba(255,255,255,0.07) 40px 80px)',
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
          preserveAspectRatio="none"
        >
          <rect
            x="8"
            y="8"
            width="calc(100% - 16px)"
            height="calc(100% - 16px)"
            fill="none"
            stroke="rgba(238,228,200,0.4)"
            strokeWidth={1.5}
          />
          <line
            x1="50%"
            y1="8"
            x2="50%"
            y2="calc(100% - 8px)"
            stroke="rgba(238,228,200,0.4)"
            strokeWidth={1.5}
          />
          <circle cx="50%" cy="50%" r="36" fill="none" stroke="rgba(238,228,200,0.4)" strokeWidth={1.5} />
        </svg>
        {FORMATION.map(([x, y, pos, num, color], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: color || BRAND.sand,
                color: BRAND.indigo,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: TYPE.display,
                fontSize: 16,
                fontWeight: 700,
                border: `2px solid ${BRAND.paper}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontFamily: TYPE.mono,
                fontSize: 8.5,
                letterSpacing: '0.18em',
                color: BRAND.sand,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              {pos}
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            fontFamily: TYPE.mono,
            fontSize: 9,
            letterSpacing: '0.18em',
            color: 'rgba(238,228,200,0.55)',
          }}
        >
          DRAG PRESENT PLAYERS INTO SLOTS · OR SKIP TO LET AI INFER
        </div>
      </div>
    </div>
  )
}

function PrepConfirm() {
  const rows: [string, string][] = [
    ['Opponent', 'Al Wasl Academy'],
    ['Date · time', 'Sat 28 Feb · 15:00'],
    ['Pitch', 'Pitch 1 · MAK Academy'],
    ['Attendees', '14 of 16 present'],
    ['Formation', '4-3-3 (set)'],
    ['Bibs', '— (competitive match)'],
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <MEyebrow>SUMMARY</MEyebrow>
        <div
          style={{
            marginTop: 12,
            border: `1px solid ${BRAND.line}`,
            borderRadius: 4,
            background: '#fff',
          }}
        >
          {rows.map(([k, v], i) => (
            <div
              key={k}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: i < rows.length - 1 ? `1px solid ${BRAND.line}` : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: TYPE.mono,
                  fontSize: 10.5,
                  color: BRAND.indigoMute,
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                }}
              >
                {k.toUpperCase()}
              </span>
              <span
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 13,
                  color: BRAND.indigo,
                  fontWeight: 600,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <MEyebrow>WHAT HAPPENS NEXT</MEyebrow>
        <div
          style={{
            marginTop: 12,
            fontFamily: TYPE.body,
            fontSize: 13,
            color: BRAND.indigoMid,
            lineHeight: 1.55,
          }}
        >
          On Saturday, record the match using the camera. Footage uploads automatically when
          you&apos;re back on Wi-Fi. Analysis takes ~2 hours; we&apos;ll surface a coloured
          composite + clips on this page when ready.
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: BRAND.yellowSoft,
            borderRadius: 4,
          }}
        >
          <MEyebrow color={BRAND.indigo}>★ WHILE YOU WAIT</MEyebrow>
          <div
            style={{
              fontFamily: TYPE.body,
              fontSize: 12.5,
              marginTop: 6,
              color: BRAND.indigo,
              lineHeight: 1.5,
            }}
          >
            You can scrub past matches in the calendar above. Try Feb 17 — Stratford E. just
            finished processing.
          </div>
        </div>
      </div>
    </div>
  )
}
