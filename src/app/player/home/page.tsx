'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { players, sessions, sessionPreps, playerProfile, coachFeedbackHistory } from '@/lib/mockData'
import { NAV_HEIGHT } from '@/lib/constants'
import ScoreArc from '@/components/charts/ScoreArc'
import KeyMetricsBlock from '@/components/shared/KeyMetricsBlock'
import SessionPrepCard from '@/components/player/SessionPrepCard'

const PLAYER_ID = 'player_001'

type Period = 'last-match' | 'last-5' | 'season'

const periodData: Record<Period, { score: number; context: string }> = {
  'last-match': { score: 81, context: 'vs Al Wasl Academy · Feb 24 2026' },
  'last-5': { score: 76, context: 'Average · Last 5 Matches' },
  season: { score: 74, context: 'Season Average · 2026' },
}

export default function PlayerHomePage() {
  const router = useRouter()
  const player = players.find(p => p.id === PLAYER_ID)!
  const [activePeriod, setActivePeriod] = useState<Period>('last-match')
  const [displayScore, setDisplayScore] = useState(81)
  const [scoreKey, setScoreKey] = useState(0)
  const solidRef = useRef<HTMLDivElement>(null)

  function handlePeriodChange(p: Period) {
    setActivePeriod(p)
    setDisplayScore(periodData[p].score)
    setScoreKey((k) => k + 1)
  }

  const currentData = periodData[activePeriod]

  // Next upcoming session
  const nextSession = useMemo(() => {
    return sessions
      .filter(s => s.status === 'scheduled' && s.participatingPlayerIds.includes(PLAYER_ID))
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null
  }, [])

  const nextPrep = nextSession ? sessionPreps[nextSession.id] || null : null

  // Latest coach feedback
  const latestFeedback = coachFeedbackHistory.find(f => f.playerId === PLAYER_ID) || null

  useEffect(() => {
    if (solidRef.current) solidRef.current.scrollTop = 0
  }, [])

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0D1020' }}>
      {/* IMAGE SECTION (48%) */}
      <div style={{ height: '48dvh', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        <Image
          src="/players/kiyan.jpg"
          alt={playerProfile.name}
          fill
          priority
          className="ken-burns"
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(13,16,32,0.7) 80%, #0D1020 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontSize: 160, fontWeight: 900, color: 'rgba(255,255,255,0.07)', lineHeight: 1, letterSpacing: '-6px' }}>
            {playerProfile.jerseyNumber}
          </span>
        </div>

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 18px 12px', zIndex: 5 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 10px' }}>
            <Image src="/logos/mak-academy.jpeg" alt="MAK Academy" width={80} height={32} style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo-white.png" alt="fairpl.ai" width={80} height={24} style={{ height: 24, width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
        </div>
      </div>

      {/* SOLID SECTION (52%) */}
      <div
        ref={solidRef}
        className="no-scrollbar"
        style={{ flex: 1, background: '#0D1020', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `16px 20px calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 8px)` }}
      >
        <div className="fade-up-0" style={{ textAlign: 'center', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', margin: 0 }}>
            Hey, {player.firstName}! {'\uD83D\uDC4B'}
          </h1>
        </div>
        <p className="fade-up-0" style={{ fontSize: 13, color: '#9DA2B3', textAlign: 'center', marginBottom: 14 }}>
          #{player.jerseyNumber} · {player.position} · {playerProfile.academy}
        </p>

        {/* Coach quote */}
        {latestFeedback?.summary && (
          <div className="fade-up-1" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 18px', width: '100%', marginBottom: 18 }}>
            <p style={{ fontSize: 14, color: '#fff', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.55, margin: 0 }}>
              &ldquo;{latestFeedback.summary}&rdquo;
            </p>
          </div>
        )}

        {/* Score Arc + Period Toggle */}
        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <ScoreArc score={currentData.score} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span key={scoreKey} className="num-fade" style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>
                {displayScore}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#9DA2B3', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>
            Match Score
          </p>
        </div>

        <div className="fade-up-3" style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {(['last-match', 'last-5', 'season'] as Period[]).map((p) => {
            const labels: Record<Period, string> = { 'last-match': 'Last Match', 'last-5': 'Last 5', season: 'Season' }
            const isActive = activePeriod === p
            return (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 20, border: `1px solid ${isActive ? '#4A4AFF' : '#6E7180'}`, background: isActive ? '#4A4AFF' : 'transparent', color: isActive ? '#fff' : '#6E7180', cursor: 'pointer', transition: 'all 0.18s ease' }}
              >
                {labels[p]}
              </button>
            )
          })}
        </div>

        <p key={activePeriod} className="num-fade fade-up-4" style={{ fontSize: 12, color: '#6E7180', textAlign: 'center', marginBottom: 16 }}>
          {currentData.context}
        </p>

        {/* Next Session Card */}
        {nextSession && (
          <div className="fade-up-5" style={{ width: '100%', marginBottom: 16 }}>
            <SessionPrepCard
              session={nextSession}
              prep={nextPrep}
              playerId={PLAYER_ID}
              compact
              onTap={() => router.push('/player/sessions')}
              dark
            />
          </div>
        )}

        {/* Key Metrics */}
        <div className="fade-up-5" style={{ width: '100%' }}>
          <KeyMetricsBlock playerId="player_001" dark={true} />
        </div>
      </div>
    </div>
  )
}
