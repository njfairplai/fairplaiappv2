'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, Download, Play, Camera, Send } from 'lucide-react'
import { highlights, players } from '@/lib/mockData'
import { MATCH_CENTER_HIGHLIGHTS } from '@/lib/match-center'
import { LS_COACH_CAM, readArray } from '@/lib/welfare-store'
import type { CoachCamClip } from '@/lib/types'
import { BRAND, TYPE } from '@/lib/constants'
import { PortalTopBar } from '@/components/parent-portal/PortalTopBar'
import { Toast } from '@/components/coach/match-center/Toast'

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
      <div style={{ background: BRAND.sand, minHeight: '100dvh', color: BRAND.indigo, paddingBottom: 80 }}>
        <PortalTopBar title="Clip" showBack />
        <div style={{ padding: 32, textAlign: 'center', fontFamily: TYPE.body, color: BRAND.indigoMute }}>
          Clip not found. It may have been removed.
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: BRAND.sand, minHeight: '100dvh', color: BRAND.indigo, paddingBottom: 96, fontFamily: TYPE.body }}>
      <PortalTopBar title="Clip" showBack />

      <div style={{ padding: '14px 16px 0' }}>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            border: `1px solid ${resolved.kind === 'coach_cam' ? BRAND.yellow : BRAND.indigo}`,
            background: resolved.kind === 'coach_cam' ? `${BRAND.yellow}22` : BRAND.indigoSoft,
            color: BRAND.indigo,
            borderRadius: 999,
          }}
        >
          {resolved.kind === 'coach_cam' && <Camera size={11} color={BRAND.indigo} />}
          {resolved.kind === 'shared' && <Send size={11} color={BRAND.indigo} />}
          <span style={{ fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 700 }}>
            {sourceBadge.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Player block */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ fontFamily: TYPE.display, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {resolved.title}
        </div>
        <div style={{ fontFamily: TYPE.body, fontSize: 13, color: BRAND.indigoMute, marginTop: 6, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>{resolved.playerName} {resolved.jersey != null && <>·  #{resolved.jersey}</>}</span>
          {resolved.minute != null && <><span>·</span><span>{resolved.minute}&apos;</span></>}
          <span>·</span><span>{resolved.duration}s</span>
        </div>
      </div>

      {/* Player surface */}
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            position: 'relative',
            background: BRAND.indigo,
            borderRadius: 14,
            aspectRatio: '16 / 9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            aria-label="Play clip"
            onClick={() => setToast('Player coming once footage hosting lands')}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: BRAND.yellow, color: BRAND.indigo,
              border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(252, 215, 24, 0.32)',
            }}
          >
            <Play size={28} fill="currentColor" />
          </button>
          <span
            style={{
              position: 'absolute', bottom: 12, left: 14,
              fontFamily: TYPE.mono, fontSize: 9.5, letterSpacing: '0.18em',
              color: BRAND.yellow, fontWeight: 700,
            }}
          >
            {resolved.eventLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        <button
          type="button"
          onClick={downloadClip}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
            padding: '13px 14px',
            border: 'none', borderRadius: 8,
            background: BRAND.indigo, color: BRAND.sand,
            fontFamily: TYPE.body, fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Download size={14} />
          Download to phone
        </button>
        <button
          type="button"
          onClick={() => router.push('/parent/highlights')}
          style={{
            padding: '11px 14px',
            background: 'transparent',
            border: `1px solid ${BRAND.line}`,
            borderRadius: 8,
            color: BRAND.indigo,
            fontFamily: TYPE.body, fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
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
