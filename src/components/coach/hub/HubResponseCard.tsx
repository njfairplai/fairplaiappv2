'use client'

import { useRouter } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MComposite,
  MPlayer,
  MClipEmbed,
  MikelGlyph,
  hubGhostBtnStyle,
  hubPrimaryBtnStyle,
} from './HubEmbeds'

interface HubResponseCardProps {
  onShare?: () => void
  onNewThread?: () => void
  onExportReel?: () => void
  onRegenerate?: () => void
}

/* Response card — Mikel's most-recent reply, surfaced inline below the
 * chat input so the Hub is never empty when the coach lands. The reply
 * is composed in prose with embedded chips (composite, player, clip)
 * sitting inside sentence flow.
 *
 * For now the card is a static mock — the LLM streaming layer ships
 * separately. Demo seed: "Build a 5-clip reel of Saeed's pressing this
 * month." Mikel responds with three embedded clips + a profile link. */

export function HubResponseCard({
  onShare,
  onNewThread,
  onExportReel,
  onRegenerate,
}: HubResponseCardProps = {}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  return (
    <div className="w-full max-w-[760px] overflow-hidden rounded-lg border border-brand-line bg-white">
      {/* Header — the question echoed back */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-2.5 border-b border-brand-line bg-brand-sand',
          isMobile ? 'px-4 py-3' : 'px-[22px] py-3.5',
        )}
      >
        <span className="font-fragment text-[9.5px] font-bold tracking-[0.22em] text-brand-indigo-mute">
          YOUR LAST QUESTION · 18M AGO
        </span>
        <span className="flex-1" />
        {!isMobile && (
          <>
            <button type="button" style={hubGhostBtnStyle} onClick={onShare}>
              ↗ SHARE
            </button>
            <button type="button" style={hubGhostBtnStyle} onClick={onNewThread}>
              ＋ NEW THREAD
            </button>
          </>
        )}
      </div>

      <div className={cn(isMobile ? 'p-4' : 'px-[22px] py-5')}>
        <div
          className={cn(
            'font-satoshi font-medium leading-[1.45] text-brand-indigo',
            isMobile ? 'text-[15px]' : 'text-base',
          )}
        >
          &ldquo;Build a 5-clip reel of Saeed&apos;s pressing this month.&rdquo;
        </div>

        {/* Mikel's reply — anchored on the yellow border so the byline
         *  reads as Mikel composing inside his own column */}
        <div className="mt-[18px] border-l-2 border-brand-yellow pl-3.5">
          <div className="flex items-center gap-1.5 font-fragment text-[9.5px] font-bold tracking-[0.22em] text-brand-indigo">
            <MikelGlyph size={16} />
            COACH MIKEL · 18M AGO
          </div>

          <div
            className={cn(
              'mt-3 leading-[1.7] text-brand-indigo',
              isMobile ? 'text-[13.5px]' : 'text-[14.5px]',
            )}
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
          <div className="mt-3">
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

          <div className="mt-1 font-fragment text-[10px] font-bold tracking-[0.18em] text-brand-indigo-mute">
            + 2 MORE CLIPS ·{' '}
            <span className="cursor-pointer border-b border-brand-indigo text-brand-indigo">
              SHOW ALL ↓
            </span>
          </div>

          <div
            className={cn(
              'mt-4 leading-[1.7] text-brand-indigo',
              isMobile ? 'text-[13.5px]' : 'text-[14.5px]',
            )}
          >
            Worth a look: his counter-press recovery is up{' '}
            <span className="bg-brand-yellow px-1 font-bold">
              +12% vs January
            </span>{' '}
            — see the full pattern on his profile.
          </div>

          {/* Action row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportReel}
              style={{ ...hubPrimaryBtnStyle, padding: '8px 14px', fontSize: 10.5 }}
            >
              EXPORT REEL ↗
            </button>
            <button
              type="button"
              onClick={() => router.push('/coach/web/player/player_007')}
              className="cursor-pointer rounded-[4px] border border-brand-indigo bg-transparent px-3.5 py-2 font-fragment text-[10.5px] font-bold tracking-[0.16em] text-brand-indigo"
            >
              OPEN SAEED&apos;S PROFILE →
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              className="cursor-pointer rounded-[4px] border border-brand-line bg-transparent px-3.5 py-2 font-fragment text-[10.5px] font-bold tracking-[0.16em] text-brand-indigo-mute"
            >
              REGENERATE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
