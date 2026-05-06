'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, Send, X } from 'lucide-react'
import { players, parents } from '@/lib/mockData'
import { uploadCoachCam, sendClipToParent } from '@/lib/match-center'
import type { CoachCamTag } from '@/lib/types'
import { BRAND, TYPE } from '@/lib/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Toast } from '@/components/coach/match-center/Toast'

/**
 * Coach Cam — coach-side upload surface.
 *
 * Replaces the WhatsApp side-channel where coaches today shoot a quick
 * phone clip of a player's drill rep / cool action and message it to
 * the parent directly. Inside the app the upload becomes a CoachCamClip,
 * and "Send to parent" writes a SharedClipRecord-like notification that
 * the parent's inbox renders.
 *
 * Mock note: no real video encoding — the file picker accepts any
 * media but we just store filename + duration as metadata. The real
 * backend swaps this for an upload endpoint + signed URL.
 */

const TAG_OPTIONS: { value: CoachCamTag; label: string }[] = [
  { value: 'drill', label: 'Drill rep' },
  { value: 'skill', label: 'Skill' },
  { value: 'moment', label: 'Match moment' },
]

export default function CoachCamPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [tag, setTag] = useState<CoachCamTag>('drill')
  const [caption, setCaption] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // Object URL cleanup so we don't leak blobs across uploads.
  useEffect(() => {
    if (!file) return setPreviewUrl(null)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const playerOptions = useMemo(() => {
    // Surface only players with a parent attached so "send to parent"
    // has a real recipient. Sort alphabetically.
    return players
      .filter(p => p.parentIds.length > 0)
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
  }, [])

  function togglePlayer(id: string) {
    setSelectedPlayerIds(cur =>
      cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id],
    )
  }

  function send() {
    if (!file || selectedPlayerIds.length === 0) return
    let sentCount = 0
    for (const playerId of selectedPlayerIds) {
      const player = playerOptions.find(p => p.id === playerId)
      if (!player) continue
      const parentId = player.parentIds[0]
      if (!parentId) continue
      // Upload one CoachCamClip record per recipient so the parent's
      // notification has a stable ID to drill into.
      const clip = uploadCoachCam({
        playerId,
        coachId: 'coach_001',
        caption: caption.trim() || undefined,
        tag,
        thumbnailUrl: previewUrl ?? '',
        videoUrl: previewUrl ?? '',
        durationSeconds: 18, // mock — real backend probes the file
      })
      // The Coach Cam notification surfaces independently of the shared-
      // clip pipeline (different `kind`), but we also drop a
      // SharedClipRecord so the parent's "Coach's clips" rail can show
      // both Share Clip + Coach Cam without two different read paths.
      sendClipToParent({
        highlightId: clip.id,
        playerId,
        parentId,
        coachId: 'coach_001',
        message: caption.trim() || `${tag.charAt(0).toUpperCase()}${tag.slice(1)} clip`,
      })
      sentCount++
    }
    setToast(`Sent to ${sentCount} parent${sentCount === 1 ? '' : 's'}`)
    // Reset form
    setFile(null)
    setSelectedPlayerIds([])
    setCaption('')
  }

  const canSend = file && selectedPlayerIds.length > 0

  return (
    <div
      style={{
        background: BRAND.sand,
        color: BRAND.indigo,
        fontFamily: TYPE.body,
        minHeight: 'calc(100vh - 108px)',
        paddingBottom: 80,
      }}
    >
      <header
        style={{
          padding: isMobile ? '16px 16px' : '24px 36px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${BRAND.line}`,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: BRAND.indigo,
            color: BRAND.sand,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Camera size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10.5,
              letterSpacing: '0.22em',
              color: BRAND.indigoMute,
              fontWeight: 700,
            }}
          >
            COACH CAM
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: isMobile ? 22 : 28,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            Send a quick clip to a parent.
          </div>
        </div>
      </header>

      <div style={{ padding: isMobile ? '16px 16px 24px' : '24px 36px' }}>
        {/* Upload */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Clip</SectionLabel>
          {!file ? (
            <label
              htmlFor="cc-file"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: '32px 16px',
                background: BRAND.paper,
                border: `2px dashed ${BRAND.line}`,
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <Upload size={24} color={BRAND.indigoMute} />
              <div
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 14,
                  fontWeight: 600,
                  color: BRAND.indigo,
                }}
              >
                Tap to pick a video or photo
              </div>
              <div
                style={{
                  fontFamily: TYPE.body,
                  fontSize: 12,
                  color: BRAND.indigoMute,
                }}
              >
                Phone camera roll · max 60s for video
              </div>
              <input
                id="cc-file"
                type="file"
                accept="video/*,image/*"
                capture="environment"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                style={{ display: 'none' }}
              />
            </label>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 12,
                padding: 14,
                background: BRAND.paper,
                border: `1px solid ${BRAND.line}`,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  background: BRAND.indigo,
                  color: BRAND.sand,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {previewUrl && file.type.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Camera size={22} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: TYPE.body,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: BRAND.indigo,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </div>
                <div
                  style={{
                    fontFamily: TYPE.body,
                    fontSize: 11.5,
                    color: BRAND.indigoMute,
                    marginTop: 2,
                  }}
                >
                  {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type || 'media'}
                </div>
              </div>
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setFile(null)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'transparent', border: `1px solid ${BRAND.line}`,
                  color: BRAND.indigoMute, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Tag */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>What is it</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {TAG_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTag(opt.value)}
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${tag === opt.value ? BRAND.indigo : BRAND.line}`,
                  borderRadius: 6,
                  background: tag === opt.value ? BRAND.indigo : BRAND.sand,
                  color: tag === opt.value ? BRAND.sand : BRAND.indigo,
                  fontFamily: TYPE.body, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>Caption (optional)</SectionLabel>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's the parent looking at?"
            rows={2}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${BRAND.line}`,
              borderRadius: 8,
              fontFamily: TYPE.body,
              fontSize: 14,
              color: BRAND.indigo,
              background: BRAND.paper,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Recipients */}
        <div style={{ marginBottom: 18 }}>
          <SectionLabel>
            Send to
            {selectedPlayerIds.length > 0 && (
              <span style={{ marginLeft: 8, color: BRAND.indigo, fontWeight: 700 }}>
                {selectedPlayerIds.length} selected
              </span>
            )}
          </SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: 8,
              maxHeight: 280,
              overflowY: 'auto',
              padding: 4,
            }}
          >
            {playerOptions.map(p => {
              const sel = selectedPlayerIds.includes(p.id)
              const parentId = p.parentIds[0]
              const parent = parents.find(pp => pp.id === parentId)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 2,
                    padding: '10px 12px',
                    border: `1px solid ${sel ? BRAND.indigo : BRAND.line}`,
                    borderRadius: 8,
                    background: sel ? BRAND.indigo : BRAND.paper,
                    color: sel ? BRAND.sand : BRAND.indigo,
                    fontFamily: TYPE.body, fontSize: 13,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {p.firstName} {p.lastName}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      opacity: 0.75,
                      fontFamily: TYPE.mono,
                      letterSpacing: '0.12em',
                    }}
                  >
                    #{p.jerseyNumber} · {parent?.name.split(' ')[0] ?? 'Parent'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Send */}
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 16px',
            border: 'none', borderRadius: 8,
            background: canSend ? BRAND.indigo : BRAND.indigoSoft,
            color: canSend ? BRAND.sand : BRAND.indigoMute,
            fontFamily: TYPE.body, fontSize: 14, fontWeight: 700,
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
        >
          <Send size={14} />
          {canSend
            ? `Send to ${selectedPlayerIds.length} parent${selectedPlayerIds.length === 1 ? '' : 's'}`
            : 'Pick a clip + at least one player'}
        </button>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: TYPE.mono,
        fontSize: 10.5,
        letterSpacing: '0.22em',
        color: BRAND.indigoMute,
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}
