'use client'

import { useEffect, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { BRAND, TYPE } from '@/lib/constants'
import { uploadCoachCam, sendClipToParent } from '@/lib/match-center'
import type { CoachCamTag } from '@/lib/types'
import { players, parents } from '@/lib/mockData'

/**
 * "+ Send a clip" sheet for the coach player profile.
 *
 * Replaces the previous /coach/web/coach-cam destination route. The coach
 * picks the player first (already established by the page context), then
 * this sheet handles: pick a video / photo from the camera roll → optional
 * caption + tag → Send. The send writes a CoachCamClip + a SharedClipRecord
 * for the player's parent so the parent's Highlights surface picks it up.
 */

interface SendClipSheetProps {
  open: boolean
  playerId: string
  playerName: string
  onClose: () => void
  onSent: (parentName: string | null) => void
}

const TAG_OPTIONS: { value: CoachCamTag; label: string }[] = [
  { value: 'drill', label: 'Drill rep' },
  { value: 'skill', label: 'Skill' },
  { value: 'moment', label: 'Match moment' },
]

export function SendClipSheet({
  open,
  playerId,
  playerName,
  onClose,
  onSent,
}: SendClipSheetProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tag, setTag] = useState<CoachCamTag>('drill')
  const [caption, setCaption] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset on open + clean up object URLs.
  useEffect(() => {
    if (open) {
      setFile(null)
      setCaption('')
      setTag('drill')
    }
  }, [open])
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!open) return null

  function send() {
    if (!file) return
    const player = players.find(p => p.id === playerId)
    const parentId = player?.parentIds[0]
    const parent = parentId ? parents.find(p => p.id === parentId) : null
    const clip = uploadCoachCam({
      playerId,
      coachId: 'coach_001',
      caption: caption.trim() || undefined,
      tag,
      thumbnailUrl: previewUrl ?? '',
      videoUrl: previewUrl ?? '',
      durationSeconds: 18, // mock — real backend probes the file
    })
    if (parent) {
      sendClipToParent({
        highlightId: clip.id,
        playerId,
        parentId: parent.id,
        coachId: 'coach_001',
        message: caption.trim() || `${tag.charAt(0).toUpperCase()}${tag.slice(1)} clip`,
      })
    }
    onSent(parent?.name ?? null)
    onClose()
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11,8,40,0.62)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 95, padding: 24,
      }}
    >
      <div
        style={{
          background: BRAND.paper,
          border: `1px solid ${BRAND.line}`,
          borderRadius: 8,
          width: '100%', maxWidth: 420,
          padding: '20px 22px',
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
          maxHeight: 'calc(100dvh - 48px)',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em',
            color: BRAND.indigoMute, fontWeight: 700,
          }}
        >
          SEND A CLIP · {playerName.toUpperCase()}
        </div>

        {/* Upload */}
        <div style={{ marginTop: 14 }}>
          <Label>Clip</Label>
          {!file ? (
            <label
              htmlFor="scs-file"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '24px 12px',
                background: BRAND.sand, border: `2px dashed ${BRAND.line}`,
                borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              }}
            >
              <Upload size={20} color={BRAND.indigoMute} />
              <div style={{ fontFamily: TYPE.body, fontSize: 13, fontWeight: 600, color: BRAND.indigo }}>
                Pick a video or photo
              </div>
              <div style={{ fontFamily: TYPE.body, fontSize: 11.5, color: BRAND.indigoMute }}>
                Phone camera roll · max 60s
              </div>
              <input
                id="scs-file"
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
                display: 'flex', gap: 10, padding: 10,
                background: BRAND.sand, border: `1px solid ${BRAND.line}`,
                borderRadius: 10, alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 52, height: 52, borderRadius: 6,
                  background: BRAND.indigo, color: BRAND.sand,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, overflow: 'hidden',
                }}
              >
                {previewUrl && file.type.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={18} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: TYPE.body, fontSize: 12.5, fontWeight: 600,
                    color: BRAND.indigo, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontFamily: TYPE.body, fontSize: 11, color: BRAND.indigoMute, marginTop: 2 }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setFile(null)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'transparent', border: `1px solid ${BRAND.line}`,
                  color: BRAND.indigoMute, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Tag */}
        <div style={{ marginTop: 14 }}>
          <Label>What is it</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {TAG_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTag(opt.value)}
                style={{
                  padding: '9px 8px',
                  border: `1px solid ${tag === opt.value ? BRAND.indigo : BRAND.line}`,
                  borderRadius: 6,
                  background: tag === opt.value ? BRAND.indigo : BRAND.sand,
                  color: tag === opt.value ? BRAND.sand : BRAND.indigo,
                  fontFamily: TYPE.body, fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div style={{ marginTop: 14 }}>
          <Label>Caption (optional)</Label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's the parent looking at?"
            rows={2}
            style={{
              width: '100%', padding: '9px 12px',
              border: `1px solid ${BRAND.line}`, borderRadius: 6,
              fontFamily: TYPE.body, fontSize: 13.5, color: BRAND.indigo,
              background: BRAND.sand, outline: 'none', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px', border: 'none', background: 'transparent',
              fontFamily: TYPE.body, fontSize: 13, color: BRAND.indigoMute,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!file}
            style={{
              padding: '10px 16px',
              border: 'none', borderRadius: 6,
              background: file ? BRAND.indigo : BRAND.indigoSoft,
              color: file ? BRAND.sand : BRAND.indigoMute,
              fontFamily: TYPE.body, fontSize: 13, fontWeight: 700,
              cursor: file ? 'pointer' : 'not-allowed',
            }}
          >
            Send to parent
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: TYPE.mono, fontSize: 10.5, letterSpacing: '0.18em',
        color: BRAND.indigoMute, fontWeight: 700, marginBottom: 6,
      }}
    >
      {children}
    </div>
  )
}
