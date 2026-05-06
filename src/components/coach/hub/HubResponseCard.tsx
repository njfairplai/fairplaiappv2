'use client'

import { useRouter } from 'next/navigation'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MComposite,
  MPlayer,
  MClipEmbed,
  MikelGlyph,
  hubGhostBtnStyle,
  hubPrimaryBtnStyle,
} from './HubEmbeds'

/* Response card — Mikel's most-recent reply, surfaced inline below the
 * chat input so the Hub is never empty when the coach lands. The reply
 * is composed in prose with embedded chips (composite, player, clip)
 * sitting inside sentence flow.
 *
 * For now the card is a static mock — the LLM streaming layer ships
 * separately. Demo seed: "Build a 5-clip reel of Saeed's pressing this
 * month." Mikel responds with three embedded clips + a profile link. */

export function HubResponseCard() {
  const router = useRouter()
  const isMobile = useIsMobile()
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 760,
        background: '#fff',
        border: `1px solid ${BRAND.line}`,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header — the question echoed back */}
      <div
        style={{
          padding: isMobile ? '12px 16px' : '14px 22px',
          borderBottom: `1px solid ${BRAND.line}`,
          background: BRAND.sand,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9.5,
            letterSpacing: '0.22em',
            color: BRAND.indigoMute,
            fontWeight: 700,
          }}
        >
          YOUR LAST QUESTION · 18M AGO
        </span>
        <span style={{ flex: 1 }} />
        {!isMobile && (
          <>
            <button type="button" style={hubGhostBtnStyle}>
              ↗ SHARE
            </button>
            <button type="button" style={hubGhostBtnStyle}>
              ＋ NEW THREAD
            </button>
          </>
        )}
      </div>

      <div style={{ padding: isMobile ? '16px 16px' : '20px 22px' }}>
        <div
          style={{
            fontFamily: TYPE.body,
            fontSize: isMobile ? 15 : 16,
            fontWeight: 500,
            color: BRAND.indigo,
            lineHeight: 1.45,
          }}
        >
          &ldquo;Build a 5-clip reel of Saeed&apos;s pressing this month.&rdquo;
        </div>

        {/* Mikel's reply — anchored on the yellow border so the byline
         *  reads as Mikel composing inside his own column */}
        <div
          style={{
            marginTop: 18,
            paddingLeft: 14,
            borderLeft: `2px solid ${BRAND.yellow}`,
          }}
        >
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9.5,
              letterSpacing: '0.22em',
              color: BRAND.indigo,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MikelGlyph size={16} />
            COACH MIKEL · 18M AGO
          </div>

          <div
            style={{
              fontSize: isMobile ? 13.5 : 14.5,
              lineHeight: 1.7,
              color: BRAND.indigo,
              marginTop: 12,
            }}
          >
            Pulled five from the last four matches.{' '}
            <MPlayer
              num={7}
              name="Saeed Khalifa"
              motm
              onClick={() => router.push('/coach/web/player/player_007')}
            />{' '}
            has been the loudest presser in this stretch — composite{' '}
            <MComposite value={82} label="this month" color={BRAND.yellow} /> with most
            recoveries inside the opponent&apos;s half. Two of these are from the Al Wasl
            match last Sunday.
          </div>

          {/* Embedded clips — three visible, two hidden behind "Show all" */}
          <div style={{ marginTop: 12 }}>
            <MClipEmbed
              ev="DEF"
              player="Saeed Khalifa"
              num={7}
              minute={11}
              dur={14}
              opp="VS AL WASL · 24 FEB"
              headline="Counter-press, regains in own third"
              onPlay={() => router.push('/coach/web/highlights')}
            />
            <MClipEmbed
              ev="DEF"
              player="Saeed Khalifa"
              num={7}
              minute={28}
              dur={12}
              opp="VS AL WASL · 24 FEB"
              headline="Press-trigger block on the LB"
              onPlay={() => router.push('/coach/web/highlights')}
            />
            <MClipEmbed
              ev="KEY"
              player="Saeed Khalifa"
              num={7}
              minute={62}
              dur={18}
              opp="VS STRATFORD · 17 FEB"
              headline="Win, then split — assist sequence"
              onPlay={() => router.push('/coach/web/highlights')}
            />
          </div>

          <div
            style={{
              marginTop: 4,
              fontFamily: TYPE.mono,
              fontSize: 10,
              letterSpacing: '0.18em',
              color: BRAND.indigoMute,
              fontWeight: 700,
            }}
          >
            + 2 MORE CLIPS ·{' '}
            <span
              style={{
                color: BRAND.indigo,
                cursor: 'pointer',
                borderBottom: `1px solid ${BRAND.indigo}`,
              }}
            >
              SHOW ALL ↓
            </span>
          </div>

          <div
            style={{
              fontSize: isMobile ? 13.5 : 14.5,
              lineHeight: 1.7,
              color: BRAND.indigo,
              marginTop: 16,
            }}
          >
            Worth a look: his counter-press recovery is up{' '}
            <span
              style={{
                background: BRAND.yellow,
                padding: '0 4px',
                fontWeight: 700,
              }}
            >
              +12% vs January
            </span>{' '}
            — see the full pattern on his profile.
          </div>

          {/* Action row */}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <button
              type="button"
              style={{ ...hubPrimaryBtnStyle, padding: '8px 14px', fontSize: 10.5 }}
            >
              EXPORT REEL ↗
            </button>
            <button
              type="button"
              onClick={() => router.push('/coach/web/player/player_007')}
              style={{
                background: 'transparent',
                border: `1px solid ${BRAND.indigo}`,
                color: BRAND.indigo,
                padding: '8px 14px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: TYPE.mono,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.16em',
              }}
            >
              OPEN SAEED&apos;S PROFILE →
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: `1px solid ${BRAND.line}`,
                color: BRAND.indigoMute,
                padding: '8px 14px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: TYPE.mono,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.16em',
              }}
            >
              REGENERATE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
