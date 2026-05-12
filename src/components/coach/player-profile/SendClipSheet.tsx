'use client'

import { useEffect, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { BRAND_RAW } from '@/lib/constants'
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
  /** Pre-selected player. When omitted, the sheet shows an inline
   *  player picker (used by the Highlights-tab "+ Coach Cam" entry
   *  point where there's no player context). */
  playerId?: string
  playerName?: string
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
  const [pickedPlayerId, setPickedPlayerId] = useState<string>(playerId ?? '')

  // Player picker is only shown when playerId is undefined (e.g. opened
  // from /coach/web/highlights with no player context). When playerId
  // is preset, the picker is hidden and submission uses that player.
  const needsPicker = !playerId

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
    const effectivePlayerId = playerId ?? pickedPlayerId
    if (!effectivePlayerId) return
    const player = players.find(p => p.id === effectivePlayerId)
    const parentId = player?.parentIds[0]
    const parent = parentId ? parents.find(p => p.id === parentId) : null
    const clip = uploadCoachCam({
      playerId: effectivePlayerId,
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
        playerId: effectivePlayerId,
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
      className="fixed inset-0 flex items-center justify-center z-[95] p-6"
      style={{
        background: 'rgba(11,8,40,0.62)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="bg-brand-paper border border-brand-line rounded-lg w-full max-w-[420px] px-[22px] py-5 overflow-y-auto"
        style={{
          boxShadow: '0 24px 56px rgba(11,8,40,0.4)',
          maxHeight: 'calc(100dvh - 48px)',
        }}
      >
        <div className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold">
          SEND A CLIP{playerName ? ` · ${playerName.toUpperCase()}` : ''}
        </div>

        {/* Player picker — only when not preselected */}
        {needsPicker && (
          <div className="mt-3.5">
            <Label>Send to player</Label>
            <select
              value={pickedPlayerId}
              onChange={e => setPickedPlayerId(e.target.value)}
              className="w-full px-3 py-[9px] border border-brand-line rounded-md font-satoshi text-[13.5px] text-brand-indigo bg-brand-sand outline-none box-border"
            >
              <option value="">— Pick a player —</option>
              {players
                .filter(p => p.parentIds.length > 0)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} · #{p.jerseyNumber}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Upload */}
        <div className="mt-3.5">
          <Label>Clip</Label>
          {!file ? (
            <label
              htmlFor="scs-file"
              className="flex flex-col items-center gap-2 px-3 py-6 bg-brand-sand rounded-[10px] cursor-pointer text-center"
              style={{ border: `2px dashed ${BRAND_RAW.line}` }}
            >
              <Upload size={20} color={BRAND_RAW.indigoMute} />
              <div className="font-satoshi text-[13px] font-semibold text-brand-indigo">
                Pick a video or photo
              </div>
              <div className="font-satoshi text-[11.5px] text-brand-indigo-mute">
                Phone camera roll · max 60s
              </div>
              <input
                id="scs-file"
                type="file"
                accept="video/*,image/*"
                capture="environment"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex gap-2.5 p-2.5 bg-brand-sand border border-brand-line rounded-[10px] items-center">
              <div className="w-[52px] h-[52px] rounded-md bg-brand-indigo text-brand-sand inline-flex items-center justify-center flex-shrink-0 overflow-hidden">
                {previewUrl && file.type.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-satoshi text-[12.5px] font-semibold text-brand-indigo overflow-hidden text-ellipsis whitespace-nowrap">
                  {file.name}
                </div>
                <div className="font-satoshi text-[11px] text-brand-indigo-mute mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setFile(null)}
                className="w-7 h-7 rounded-full bg-transparent border border-brand-line text-brand-indigo-mute cursor-pointer inline-flex items-center justify-center flex-shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Tag */}
        <div className="mt-3.5">
          <Label>What is it</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {TAG_OPTIONS.map(opt => {
              const active = tag === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTag(opt.value)}
                  className={`px-2 py-[9px] border rounded-md font-satoshi text-[12.5px] font-semibold cursor-pointer ${
                    active
                      ? 'border-brand-indigo bg-brand-indigo text-brand-sand'
                      : 'border-brand-line bg-brand-sand text-brand-indigo'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Caption */}
        <div className="mt-3.5">
          <Label>Caption (optional)</Label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="What's the parent looking at?"
            rows={2}
            className="w-full px-3 py-[9px] border border-brand-line rounded-md font-satoshi text-[13.5px] text-brand-indigo bg-brand-sand outline-none resize-y box-border"
          />
        </div>

        <div className="mt-[18px] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border-0 bg-transparent font-satoshi text-[13px] text-brand-indigo-mute cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!file || (needsPicker && !pickedPlayerId)}
            className={`px-4 py-2.5 border-0 rounded-md font-satoshi text-[13px] font-bold ${
              file
                ? 'bg-brand-indigo text-brand-sand cursor-pointer'
                : 'bg-brand-indigo-soft text-brand-indigo-mute cursor-not-allowed'
            }`}
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
    <div className="font-fragment text-[10.5px] tracking-[0.18em] text-brand-indigo-mute font-bold mb-1.5">
      {children}
    </div>
  )
}
