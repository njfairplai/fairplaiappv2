'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Camera, Send } from 'lucide-react'
import {
  getSharedClipsForPlayer,
  getCoachCamClipsForPlayer,
  type SharedClipRecord,
} from '@/lib/parent-portal'
import type { CoachCamClip } from '@/lib/types'
import { highlights as allHighlights } from '@/lib/mockData'
import { MATCH_CENTER_HIGHLIGHTS } from '@/lib/match-center'
import { BRAND, TYPE } from '@/lib/constants'

/**
 * Coach's clips rail — surfaces clips the coach explicitly sent to this
 * parent (Share Clip + Coach Cam combined). Renders inside /parent/highlights
 * above the AI-analysed grid so the two streams stay distinct visually:
 *
 *   Coach's clips (this rail)  → things the coach picked out for you
 *   Below                       → all AI-analysed clips for the kid
 *
 * Each card opens /parent/clips/[clipId] which is the shared single-clip
 * detail surface (handles all three clip kinds via ?source=).
 */

interface CoachClipsRailProps {
  playerId: string
}

interface RailItem {
  id: string
  source: 'shared' | 'coach_cam'
  title: string
  subtitle: string
  date: string
  durationSeconds: number
}

export function CoachClipsRail({ playerId }: CoachClipsRailProps) {
  const router = useRouter()
  const [items, setItems] = useState<RailItem[]>([])

  useEffect(() => {
    const out: RailItem[] = []
    for (const rec of getSharedClipsForPlayer(playerId)) {
      const ai = allHighlights.find(h => h.id === rec.highlightId)
      const mc = MATCH_CENTER_HIGHLIGHTS.find(m => m.id === rec.highlightId)
      out.push(buildSharedItem(rec, ai?.durationSeconds, mc?.headline, mc?.ev))
    }
    for (const cc of getCoachCamClipsForPlayer(playerId)) {
      out.push({
        id: cc.id,
        source: 'coach_cam',
        title: cc.caption ?? `Coach Cam · ${cc.tag ?? 'moment'}`,
        subtitle: (cc.tag ?? 'moment').toUpperCase(),
        date: cc.uploadedAt.slice(0, 10),
        durationSeconds: cc.durationSeconds,
      })
    }
    out.sort((a, b) => b.date.localeCompare(a.date))
    setItems(out)
  }, [playerId])

  if (items.length === 0) return null

  return (
    <section style={{ padding: '18px 16px 0' }}>
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          letterSpacing: '0.22em',
          color: BRAND.indigoMute,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        COACH&apos;S CLIPS · {items.length}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              router.push(`/parent/clips/${item.id}?source=${item.source}`)
            }
            style={{
              flex: '0 0 200px',
              padding: 10,
              background: BRAND.paper,
              border: `1px solid ${BRAND.line}`,
              borderRadius: 12,
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: TYPE.body,
              color: BRAND.indigo,
            }}
          >
            <div
              style={{
                position: 'relative',
                background: BRAND.indigo,
                color: BRAND.sand,
                borderRadius: 8,
                aspectRatio: '16 / 9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: BRAND.yellow, color: BRAND.indigo,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Play size={16} fill="currentColor" />
              </div>
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  background: 'rgba(238,228,200,0.16)',
                  border: `1px solid rgba(238,228,200,0.28)`,
                  borderRadius: 4,
                  fontFamily: TYPE.mono,
                  fontSize: 8.5,
                  letterSpacing: '0.16em',
                  color: BRAND.yellow,
                  fontWeight: 700,
                }}
              >
                {item.source === 'coach_cam' ? <Camera size={9} /> : <Send size={9} />}
                {item.source === 'coach_cam' ? 'COACH CAM' : 'SHARED'}
              </span>
              <span
                style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  fontFamily: TYPE.mono,
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: 'rgba(238,228,200,0.85)',
                  fontWeight: 700,
                }}
              >
                {item.durationSeconds}s
              </span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
              {item.title}
            </div>
            <div
              style={{
                fontFamily: TYPE.mono,
                fontSize: 9,
                letterSpacing: '0.16em',
                color: BRAND.indigoMute,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              {item.subtitle} · {formatShort(item.date)}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function buildSharedItem(
  rec: SharedClipRecord,
  duration: number | undefined,
  headline: string | undefined,
  ev: string | undefined,
): RailItem {
  return {
    id: rec.highlightId,
    source: 'shared',
    title: rec.message ?? headline ?? 'Coach shared a clip',
    subtitle: ev ?? 'CLIP',
    date: rec.sentAt.slice(0, 10),
    durationSeconds: duration ?? 20,
  }
}

function formatShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()].toUpperCase()} ${d.getDate()}`
}
