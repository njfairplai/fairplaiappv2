'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, Download, Play, Camera, Send } from 'lucide-react'
import { highlights, players } from '@/lib/mockData'
import { MATCH_CENTER_HIGHLIGHTS } from '@/lib/match-center'
import { LS_COACH_CAM, readArray } from '@/lib/welfare-store'
import type { CoachCamClip } from '@/lib/types'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { Toast } from '@/components/coach/match-center/Toast'
import { cn } from '@/lib/cn'

/**
 * /parent/clips/[clipId] — single-clip detail.
 *
 * Three sources are addressed by `?source=`:
 *   - shared       — coach used the Share Clip sheet on an AI-analysed clip
 *   - coach_cam    — coach used the Coach Cam upload (phone-captured)
 *   - (default)    — direct deep-link, infer from the clip ID prefix
 *
 * The same route handles all three so notification URLs stay simple.
 */
export default function ParentClipDetailPage() {
  const router = useRouter()
  const params = useParams<{ clipId: string }>()
  const searchParams = useSearchParams()
  const clipId = params?.clipId ?? ''
  const source = searchParams?.get('source') ?? ''

  const [coachCamClips, setCoachCamClips] = useState<CoachCamClip[]>([])
  const [toast, setToast] = useState<string | null>(null)

  // Hydrate coach-cam store post-mount so SSR is deterministic.
  useEffect(() => {
    setCoachCamClips(readArray<CoachCamClip>(LS_COACH_CAM))
  }, [])

  const resolved = useMemo(() => {
    // Try AI-analysed first (Highlight by id).
    const ai = highlights.find(h => h.id === clipId)
    if (ai) {
      const player = players.find(p => p.id === ai.playerId)
      const mc = MATCH_CENTER_HIGHLIGHTS.find(m => m.id === clipId)
      return {
        kind: source === 'shared' ? ('shared' as const) : ('ai' as const),
        title: mc?.headline ?? labelForEvent(ai.eventType),
        eventLabel: mc?.ev ?? ai.eventType.toUpperCase(),
        playerName: player ? `${player.firstName} ${player.lastName}` : '',
        jersey: player?.jerseyNumber,
        minute: mc ? mc.minute : Math.round(ai.timestampSeconds / 60),
        duration: mc?.dur ?? ai.durationSeconds,
        thumbUrl: ai.thumbnailUrl ?? '',
        videoUrl: ai.clipUrl ?? '',
      }
    }
    // Fall back to coach-cam.
    const cc = coachCamClips.find(c => c.id === clipId)
    if (cc) {
      const player = players.find(p => p.id === cc.playerId)
      return {
        kind: 'coach_cam' as const,
        title: cc.caption ?? `Clip from coach (${cc.tag ?? 'moment'})`,
        eventLabel: (cc.tag ?? 'COACH CAM').toUpperCase(),
        playerName: player ? `${player.firstName} ${player.lastName}` : '',
        jersey: player?.jerseyNumber,
        minute: null as number | null,
        duration: cc.durationSeconds,
        thumbUrl: cc.thumbnailUrl,
        videoUrl: cc.videoUrl,
      }
    }
    return null
  }, [clipId, coachCamClips, source])

  const sourceBadge =
    resolved?.kind === 'shared'
      ? 'Shared by coach'
      : resolved?.kind === 'coach_cam'
      ? 'Coach Cam'
      : 'Match clip'

  function downloadClip() {
    setToast('Download queued')
  }

  if (!resolved) {
    return (
      <div className="min-h-[100dvh] bg-brand-sand pb-20 text-brand-indigo">
        <PortalTopBar title="Clip" showBack />
        <div className="p-8 text-center font-satoshi text-brand-indigo-mute">
          Clip not found. It may have been removed.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-brand-sand pb-24 font-satoshi text-brand-indigo">
      <PortalTopBar title="Clip" showBack />

      <div className="px-4 pt-3.5">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-brand-indigo',
            resolved.kind === 'coach_cam'
              ? 'border-brand-yellow bg-brand-yellow-soft'
              : 'border-brand-indigo bg-brand-indigo-soft',
          )}
        >
          {resolved.kind === 'coach_cam' && <Camera size={11} color="var(--brand-indigo)" />}
          {resolved.kind === 'shared' && <Send size={11} color="var(--brand-indigo)" />}
          <span className="font-fragment text-[9.5px] font-bold tracking-[0.18em]">
            {sourceBadge.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Player block */}
      <div className="px-4 pb-4 pt-3">
        <div className="font-clash text-[26px] leading-[1.1] tracking-[-0.02em]">
          {resolved.title}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2.5 font-satoshi text-[13px] text-brand-indigo-mute">
          <span>{resolved.playerName} {resolved.jersey != null && <>·  #{resolved.jersey}</>}</span>
          {resolved.minute != null && <><span>·</span><span>{resolved.minute}&apos;</span></>}
          <span>·</span><span>{resolved.duration}s</span>
        </div>
      </div>

      {/* Player surface */}
      <div className="px-4">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[14px] bg-brand-indigo">
          <button
            type="button"
            aria-label="Play clip"
            onClick={() => setToast('Player coming once footage hosting lands')}
            className="inline-flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-full border-none bg-brand-yellow text-brand-indigo shadow-[0_4px_14px_rgba(252,215,24,0.32)]"
          >
            <Play size={28} fill="currentColor" />
          </button>
          <span className="absolute bottom-3 left-3.5 font-fragment text-[9.5px] font-bold tracking-[0.18em] text-brand-yellow">
            {resolved.eventLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-2 px-4 pt-4">
        <button
          type="button"
          onClick={downloadClip}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-brand-indigo px-3.5 py-3 font-satoshi text-[13.5px] font-bold text-brand-sand"
        >
          <Download size={14} />
          Download to phone
        </button>
        <button
          type="button"
          onClick={() => router.push('/parent/highlights')}
          className="cursor-pointer rounded-lg border border-brand-line bg-transparent px-3.5 py-[11px] font-satoshi text-[13px] font-semibold text-brand-indigo"
        >
          See all highlights
        </button>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

function labelForEvent(ev: string): string {
  switch (ev) {
    case 'goal':
      return 'Goal'
    case 'shot':
      return 'Shot'
    case 'key':
    case 'key_pass':
      return 'Key pass'
    case 'def':
    case 'tackle':
      return 'Key defence'
    case 'save':
      return 'Save'
    case 'sprint_recovery':
      return 'Sprint recovery'
    case 'injury':
      return 'Injury moment'
    default:
      return 'Match clip'
  }
}
