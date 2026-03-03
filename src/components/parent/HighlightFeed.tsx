'use client'

import { useState, useRef, useMemo } from 'react'
import { highlightClips, highlights } from '@/lib/mockData'
import { X, Copy, Check } from 'lucide-react'

export default function HighlightFeed() {
  // Only show clips that are parent_visible
  const visibleHighlights = useMemo(() => highlights.filter(h => h.privacy === 'parent_visible'), [])
  const visibleClips = useMemo(() => highlightClips.filter((_, i) => visibleHighlights[i]), [visibleHighlights])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [sharedConfirm, setSharedConfirm] = useState(false)
  const [shareModal, setShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const touchStartY = useRef<number>(0)

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (dy > 50 && currentIndex < visibleClips.length - 1) setCurrentIndex((i) => i + 1)
    else if (dy < -50 && currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  async function handleShare(clip: (typeof visibleClips)[number]) {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Kiyan Makkawi — ${clip.title} vs Al Wasl Academy`, text: 'Watch Kiyan\'s highlight from today\'s match!', url: window.location.href })
        setSharedConfirm(true)
        setTimeout(() => setSharedConfirm(false), 2000)
      } else {
        setShareModal(true)
      }
    } catch { /* User cancelled */ }
  }

  function handleCopy() {
    navigator.clipboard.writeText('fairpl.ai/h/demo')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (visibleClips.length === 0) {
    return (
      <div style={{ height: 'calc(100dvh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D1020' }}>
        <p style={{ color: '#9DA2B3', fontSize: 16 }}>No highlights available yet</p>
      </div>
    )
  }

  const clip = visibleClips[currentIndex]
  const highlight = visibleHighlights[currentIndex]

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ height: 'calc(100dvh - 80px)', display: 'flex', flexDirection: 'column', background: '#0D1020', position: 'relative', overflow: 'hidden', userSelect: 'none' }}
    >
      {/* Header */}
      <div style={{ height: 54, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#0D1020', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 5 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>Kiyan&apos;s Highlights</span>
        <span style={{ fontSize: 12, color: '#9DA2B3', fontWeight: 600 }}>{visibleClips.length} clips · Feb 24</span>
      </div>

      {/* Clip area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div key={currentIndex} className="slide-up-clip" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1B1650 0%, #0D1020 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${clip.color}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

          {/* Event badge */}
          <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 12px', backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{clip.eventType}</span>
          </div>

          {/* Duration */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 12px', backdropFilter: 'blur(8px)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{clip.duration}</span>
          </div>

          {/* Play button */}
          <div className="play-pulse" style={{ position: 'relative', width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', cursor: 'pointer' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M10 7.5 L20 13 L10 18.5 Z" fill="#4A4AFF" /></svg>
          </div>

          {/* Bottom overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))', pointerEvents: 'none' }} />

          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>{clip.title}</p>
              <p style={{ fontSize: 13, color: '#9DA2B3', marginTop: 3 }}>{clip.minute} · Kiyan Makkawi</p>
              {highlight?.watermarkEnabled && (
                <p style={{ fontSize: 11, color: '#6E7180', marginTop: 4, fontStyle: 'italic' }}>Includes player name watermark</p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => handleShare(clip)}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3 L10 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M7 6 L10 3 L13 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 10 L5 16 L15 16 L15 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {sharedConfirm && (
                <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600, whiteSpace: 'nowrap', animation: 'fadeUp 0.3s ease' }}>Shared</span>
              )}
            </div>
          </div>

          {currentIndex < visibleClips.length - 1 && (
            <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: 0.35 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6 L8 10 L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>swipe up</span>
            </div>
          )}
        </div>

        {/* Dot indicators */}
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
          {visibleClips.map((_, i) => (
            <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: i === currentIndex ? 8 : 5, height: i === currentIndex ? 8 : 5, borderRadius: '50%', background: i === currentIndex ? '#fff' : '#6E7180', cursor: 'pointer', transition: 'all 0.2s ease' }} />
          ))}
        </div>
      </div>

      {/* Share Modal (when navigator.share not supported) */}
      {shareModal && (
        <div onClick={() => setShareModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1B1650', margin: 0 }}>Share Highlight</h3>
              <button onClick={() => setShareModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6E7180" />
              </button>
            </div>

            <div style={{ background: '#F5F6FC', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 14, color: '#1B1650', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>fairpl.ai/h/{clip.id}</span>
              <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                {copied ? <Check size={16} color="#22C55E" /> : <Copy size={16} color="#4A4AFF" />}
              </button>
            </div>

            {copied && <p style={{ fontSize: 12, color: '#22C55E', margin: '0 0 8px', fontWeight: 600 }}>Copied to clipboard</p>}

            <p style={{ fontSize: 12, color: '#6E7180', margin: '0 0 16px' }}>This link expires in 30 days</p>

            <a
              href="https://wa.me/?text=Watch%20Kiyan's%20highlight%20from%20today's%20match!%20fairpl.ai/h/demo"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, background: '#25D366', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14, border: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.546 4.092 1.504 5.819L0 24l6.335-1.458A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.88 0-3.63-.52-5.13-1.42l-.36-.22-3.76.87.9-3.65-.24-.37A9.72 9.72 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
              Share via WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
