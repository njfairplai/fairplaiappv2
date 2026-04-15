'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Play, Clock, Trophy, Zap, Target, TrendingUp, Shield, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { COLORS, RADIUS } from '@/lib/constants'

/* ━━━ Mock shared-content database ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type ShareType = 'highlight' | 'stats' | 'report'

interface SharedContent {
  id: string
  type: ShareType
  playerName: string
  playerPhoto: string
  academyName: string
  academyLogo: string
  // Match context
  opponent: string
  competition: string
  date: string
  matchScore: string  // e.g. "3 – 1"
  // Highlight specific
  eventType?: string
  eventMinute?: string
  clipUrl?: string
  thumbnailUrl?: string
  // Performance data
  compositeScore?: number
  stats?: { label: string; value: string; icon: string }[]
  categoryGrades?: { category: string; grade: string; color: string; score: number }[]
  // Metadata
  sharedBy: string
  sharedByRole: string
  createdAt: string
  expiresAt: string
}

const SHARED_CONTENT: Record<string, SharedContent> = {
  // Highlight clip share
  'abc123xyz': {
    id: 'abc123xyz',
    type: 'highlight',
    playerName: 'Kiyan Makkawi',
    playerPhoto: '/players/player1.jpg',
    academyName: 'MAK Academy',
    academyLogo: '/academies/mak-logo.png',
    opponent: 'Al Wasl Academy',
    competition: 'UAE Youth League',
    date: '2026-02-24',
    matchScore: '3 – 1',
    eventType: 'Goal',
    eventMinute: "58'",
    clipUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    compositeScore: 81,
    stats: [
      { label: 'Distance', value: '7.4 km', icon: 'zap' },
      { label: 'Sprints', value: '14', icon: 'zap' },
      { label: 'Pass Accuracy', value: '85%', icon: 'target' },
      { label: 'Key Passes', value: '4', icon: 'target' },
    ],
    sharedBy: 'Coach Tariq',
    sharedByRole: 'Head Coach',
    createdAt: '2026-04-14T10:30:00Z',
    expiresAt: '2026-04-21T10:30:00Z',
  },
  // Stats share
  'def456uvw': {
    id: 'def456uvw',
    type: 'stats',
    playerName: 'Kiyan Makkawi',
    playerPhoto: '/players/player1.jpg',
    academyName: 'MAK Academy',
    academyLogo: '/academies/mak-logo.png',
    opponent: 'Al Wasl Academy',
    competition: 'UAE Youth League',
    date: '2026-02-24',
    matchScore: '3 – 1',
    compositeScore: 81,
    stats: [
      { label: 'Distance', value: '7.4 km', icon: 'zap' },
      { label: 'Top Speed', value: '24.1 km/h', icon: 'zap' },
      { label: 'Sprints', value: '14', icon: 'zap' },
      { label: 'Pass Accuracy', value: '85%', icon: 'target' },
      { label: 'Key Passes', value: '4', icon: 'target' },
      { label: 'Dribble Success', value: '78%', icon: 'target' },
      { label: 'Minutes Played', value: "78'", icon: 'clock' },
      { label: 'Tackles Won', value: '3', icon: 'shield' },
    ],
    categoryGrades: [
      { category: 'Physical', grade: 'A', color: '#10B981', score: 84 },
      { category: 'Positional', grade: 'B+', color: '#10B981', score: 78 },
      { category: 'Passing', grade: 'A', color: '#10B981', score: 85 },
      { category: 'Dribbling', grade: 'B+', color: '#10B981', score: 78 },
      { category: 'Control', grade: 'B', color: '#F59E0B', score: 74 },
      { category: 'Defending', grade: 'B', color: '#F59E0B', score: 71 },
    ],
    sharedBy: 'Sarah Makkawi',
    sharedByRole: 'Parent',
    createdAt: '2026-04-14T14:00:00Z',
    expiresAt: '2026-04-21T14:00:00Z',
  },
  // Expired example
  'expired999': {
    id: 'expired999',
    type: 'highlight',
    playerName: 'Kiyan Makkawi',
    playerPhoto: '/players/player1.jpg',
    academyName: 'MAK Academy',
    academyLogo: '/academies/mak-logo.png',
    opponent: 'Desert Eagles',
    competition: 'Friendly',
    date: '2026-01-15',
    matchScore: '2 – 2',
    eventType: 'Key Pass',
    eventMinute: "23'",
    sharedBy: 'Coach Tariq',
    sharedByRole: 'Head Coach',
    createdAt: '2026-01-15T16:00:00Z',
    expiresAt: '2026-01-22T16:00:00Z', // already expired
  },
}

/* ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatExpiry(iso: string): string {
  const d = new Date(iso)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function daysUntilExpiry(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getStatIcon(icon: string, size = 14) {
  switch (icon) {
    case 'zap': return <Zap size={size} />
    case 'target': return <Target size={size} />
    case 'clock': return <Clock size={size} />
    case 'shield': return <Shield size={size} />
    default: return <TrendingUp size={size} />
  }
}

/* ━━━ Styles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const PAGE_BG = '#0A0D1A'
const CARD_BG = 'rgba(255,255,255,0.04)'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const TEXT_PRIMARY = '#FFFFFF'
const TEXT_SECONDARY = '#9DA2B3'
const TEXT_MUTED = '#6E7180'
const BRAND_PURPLE = COLORS.primary

/* ━━━ Page Component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function SharedContentPage() {
  const params = useParams()
  const token = params.token as string
  const content = SHARED_CONTENT[token]
  const [showAllStats, setShowAllStats] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // For demo: treat 'expired999' as expired
  const expired = !content || isExpired(content.expiresAt)

  /* ── Expired / Invalid state ── */
  if (!content || expired) {
    return (
      <div style={{
        minHeight: '100vh',
        background: PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <Image src="/logo-white.png" alt="FairplAI" width={120} height={36} style={{ height: 36, width: 'auto', objectFit: 'contain', marginBottom: 40 }} />

        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'rgba(231,76,60,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Clock size={28} color="#E74C3C" />
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 800, color: TEXT_PRIMARY,
          margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.3px',
        }}>
          This content is no longer available
        </h1>
        <p style={{
          fontSize: 14, color: TEXT_SECONDARY, textAlign: 'center',
          margin: '0 0 32px', maxWidth: 340, lineHeight: 1.6,
        }}>
          Shared links expire after 7 days for privacy protection. Contact the person who shared this with you to request a new link.
        </p>

        <div style={{
          padding: '12px 20px', borderRadius: RADIUS.pill,
          background: 'rgba(255,255,255,0.06)', border: `1px solid ${CARD_BORDER}`,
        }}>
          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>
            🔒 FairplAI protects player data with automatic link expiry
          </p>
        </div>
      </div>
    )
  }

  const daysLeft = daysUntilExpiry(content.expiresAt)
  const visibleStats = showAllStats ? content.stats : content.stats?.slice(0, 4)

  /* ── Main content ── */
  return (
    <div style={{
      minHeight: '100vh',
      background: PAGE_BG,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* ── Header bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: `1px solid ${CARD_BORDER}`,
      }}>
        <Image src="/logo-white.png" alt="FairplAI" width={100} height={30} style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: RADIUS.pill,
          background: daysLeft <= 2 ? 'rgba(231,76,60,0.12)' : 'rgba(255,255,255,0.06)',
        }}>
          <Clock size={12} color={daysLeft <= 2 ? '#E74C3C' : TEXT_MUTED} />
          <span style={{ fontSize: 11, color: daysLeft <= 2 ? '#E74C3C' : TEXT_MUTED, fontWeight: 600 }}>
            {daysLeft === 0 ? 'Expires today' : daysLeft === 1 ? 'Expires tomorrow' : `${daysLeft}d left`}
          </span>
        </div>
      </div>

      {/* ── Match context hero ── */}
      <div style={{
        padding: '24px 20px 20px',
        background: 'linear-gradient(180deg, rgba(74,74,255,0.08) 0%, transparent 100%)',
      }}>
        {/* Academy + competition */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <Trophy size={14} color={BRAND_PURPLE} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, margin: 0 }}>{content.academyName}</p>
            <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>{content.competition} · {formatDate(content.date)}</p>
          </div>
        </div>

        {/* Scoreboard */}
        <div style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
          borderRadius: RADIUS.card, padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, margin: '0 0 2px' }}>{content.academyName.split(' ')[0]}</p>
            <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>Home</p>
          </div>
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: TEXT_PRIMARY, margin: 0, letterSpacing: '2px' }}>
              {content.matchScore}
            </p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, margin: '0 0 2px' }}>{content.opponent.split(' ')[0]}</p>
            <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>Away</p>
          </div>
        </div>
      </div>

      {/* ── Player card ── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
          borderRadius: RADIUS.card, padding: '16px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* Player photo */}
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #4A4AFF33 0%, #757FFF22 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            border: `2px solid ${BRAND_PURPLE}33`,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: BRAND_PURPLE }}>
              {content.playerName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>

          {/* Name + context */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 2px', letterSpacing: '-0.2px' }}>
              {content.playerName}
            </p>
            {content.eventType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: BRAND_PURPLE, textTransform: 'uppercase',
                  background: `${BRAND_PURPLE}18`, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px',
                }}>
                  {content.eventType}
                </span>
                {content.eventMinute && (
                  <span style={{ fontSize: 12, color: TEXT_MUTED }}>{content.eventMinute}</span>
                )}
              </div>
            )}
            {!content.eventType && (
              <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>Match Performance Summary</p>
            )}
          </div>

          {/* Score arc */}
          {content.compositeScore && (
            <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
              <svg width={52} height={52} viewBox="0 0 52 52">
                <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
                <circle
                  cx={26} cy={26} r={22}
                  fill="none"
                  stroke={getScoreColor(content.compositeScore)}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray={`${(content.compositeScore / 100) * 138.2} 138.2`}
                  transform="rotate(-90 26 26)"
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: getScoreColor(content.compositeScore) }}>
                  {content.compositeScore}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Video clip (highlight type) ── */}
      {content.type === 'highlight' && content.clipUrl && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            borderRadius: RADIUS.card, overflow: 'hidden',
            border: `1px solid ${CARD_BORDER}`,
            position: 'relative',
          }}>
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              poster={content.thumbnailUrl}
              style={{
                width: '100%', display: 'block',
                aspectRatio: '16/9', background: '#000',
              }}
              src={content.clipUrl}
            />
            {/* Watermark overlay */}
            <div style={{
              position: 'absolute', bottom: 44, right: 12,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              padding: '4px 8px', borderRadius: 4,
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.5px' }}>
                FairplAI · {content.academyName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats grid ── */}
      {visibleStats && visibleStats.length > 0 && (
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_SECONDARY, margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Key Stats
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}>
            {visibleStats.map((stat, i) => (
              <div key={i} style={{
                background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
                borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${BRAND_PURPLE}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: BRAND_PURPLE, flexShrink: 0,
                }}>
                  {getStatIcon(stat.icon, 15)}
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 1px' }}>{stat.value}</p>
                  <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Show more / less */}
          {content.stats && content.stats.length > 4 && (
            <button
              onClick={() => setShowAllStats(!showAllStats)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                width: '100%', padding: '10px 0', marginTop: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: BRAND_PURPLE,
              }}
            >
              {showAllStats ? 'Show less' : `Show all ${content.stats.length} stats`}
              {showAllStats ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      )}

      {/* ── Category grades (stats type) ── */}
      {content.type === 'stats' && content.categoryGrades && (
        <div style={{ padding: '8px 20px 16px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_SECONDARY, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Performance Breakdown
          </p>
          <div style={{
            background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
            borderRadius: RADIUS.card, overflow: 'hidden',
          }}>
            {content.categoryGrades.map((cat, i) => (
              <div key={cat.category} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderBottom: i < content.categoryGrades!.length - 1 ? `1px solid ${CARD_BORDER}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: TEXT_SECONDARY, flex: 1 }}>{cat.category}</span>
                {/* Score bar */}
                <div style={{
                  width: 100, height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{
                    width: `${cat.score}%`, height: '100%',
                    borderRadius: 3, background: cat.color,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 800, color: cat.color,
                  width: 28, textAlign: 'right',
                }}>
                  {cat.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Shared by ── */}
      <div style={{ padding: '8px 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${CARD_BORDER}`,
        }}>
          <Share2 size={14} color={TEXT_MUTED} />
          <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>
            Shared by <span style={{ color: TEXT_SECONDARY, fontWeight: 600 }}>{content.sharedBy}</span>
            {' · '}{content.sharedByRole}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 'auto', padding: '20px', borderTop: `1px solid ${CARD_BORDER}` }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: TEXT_MUTED, margin: '0 0 4px' }}>
            This link expires {formatExpiry(content.expiresAt)} · Content is watermarked
          </p>
          <p style={{ fontSize: 11, color: TEXT_MUTED, margin: '0 0 16px' }}>
            🔒 Player data is protected under UAE PDPL
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: RADIUS.pill,
            background: `${BRAND_PURPLE}12`, cursor: 'pointer',
          }}>
            <Image src="/logo-white.png" alt="FairplAI" width={80} height={24} style={{ height: 18, width: 'auto', objectFit: 'contain', opacity: 0.8 }} />
            <span style={{ fontSize: 12, color: BRAND_PURPLE, fontWeight: 600 }}>Learn more</span>
          </div>
        </div>
      </div>
    </div>
  )
}
