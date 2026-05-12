'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
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
  const isMobile = useIsMobile()
  return (
    <Card className={isMobile ? 'p-4' : 'p-[26px]'}>
      <div className="flex items-center gap-[10px] flex-wrap">
        <MStatusPill status="processing" animated />
        <span className="text-brand-indigo-mute font-fragment text-[10.5px] tracking-[0.18em] font-bold">
          VS AL WASL ACADEMY · SUN 22 FEB · 3-1 W
        </span>
      </div>
      <div
        className={`mt-[14px] grid items-stretch ${
          isMobile ? 'grid-cols-1 gap-[14px]' : 'grid-cols-[1.4fr_1fr] gap-6'
        }`}
      >
        <VideoBlock
          height={isMobile ? 200 : 300}
          label="MATCH FOOTAGE"
          sub="SUN 22 FEB · UPLOADED 18:24"
          playable={false}
        />
        <div className="p-[22px] bg-brand-line-soft border border-brand-line rounded-md flex flex-col justify-center">
          <MEyebrow>◐ ANALYSIS IN PROGRESS</MEyebrow>
          <MDisplay size={28} className="mt-[10px]">
            Usually ~2 hours
          </MDisplay>
          <div className="font-satoshi text-[13px] text-brand-indigo-mid mt-[10px] leading-[1.5]">
            We&apos;re parsing 84 minutes of footage. Composite scores, MOTM, highlights and
            stats will appear here when done.
          </div>
          <div className="mt-[18px] h-[6px] bg-brand-indigo-soft rounded-[3px] overflow-hidden">
            <div className="w-[64%] h-full bg-brand-indigo" />
          </div>
          <div className="mt-[6px] font-fragment text-[9.5px] tracking-[0.18em] text-brand-indigo-mute font-bold flex justify-between">
            <span>STAGE 3 OF 5 · TAGGING EVENTS</span>
            <span>~42M LEFT</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
