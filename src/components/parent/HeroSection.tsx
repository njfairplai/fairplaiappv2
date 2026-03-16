'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { playerProfile, sessions, highlights, coachFeedbackHistory } from '@/lib/mockData'
import ScoreArc from '@/components/charts/ScoreArc'
import KeyMetricsBlock from '@/components/shared/KeyMetricsBlock'
import NotificationBell from '@/components/shared/NotificationBell'
import NotificationCentre from '@/components/shared/NotificationCentre'
import PlayerCardShareModal from '@/components/shared/PlayerCardShareModal'
import { Share2, Calendar, Trophy, Play, MessageSquare } from 'lucide-react'

type Period = 'last-match' | 'last-5' | 'season'

const periodData: Record<Period, { score: number; context: string }> = {
  'last-match': { score: 81, context: 'vs Al Wasl Academy · Feb 24 2026' },
  'last-5': { score: 76, context: 'Average · Last 5 Matches' },
  season: { score: 74, context: 'Season Average · 2026' },
}

export default function HeroSection() {
  const [activePeriod, setActivePeriod] = useState<Period>('last-match')
  const [displayScore, setDisplayScore] = useState(81)
  const [scoreKey, setScoreKey] = useState(0)
  const solidRef = useRef<HTMLDivElement>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  function handlePeriodChange(p: Period) {
    setActivePeriod(p)
    setDisplayScore(periodData[p].score)
    setScoreKey((k) => k + 1)
  }

  const currentData = periodData[activePeriod]

  useEffect(() => {
    if (solidRef.current) solidRef.current.scrollTop = 0
  }, [])

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0D1020' }}>
      {/* IMAGE SECTION (52%) */}
      <div style={{ height: '52dvh', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShareOpen(true)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 100, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(8px)' }}>
              <Share2 size={14} color="#fff" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Share</span>
            </button>
            <NotificationBell count={2} dark onClick={() => setNotifOpen(true)} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo-white.png" alt="fairpl.ai" width={80} height={24} style={{ height: 24, width: 'auto', objectFit: 'contain', opacity: 0.85 }} />
        </div>
      </div>

      {/* SOLID SECTION (48%) */}
      <div
        ref={solidRef}
        className="no-scrollbar"
        style={{ flex: 1, background: '#0D1020', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 20px calc(80px + env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <div className="fade-up-0" style={{ textAlign: 'center', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', margin: 0 }}>{playerProfile.name}</h1>
        </div>
        <p className="fade-up-0" style={{ fontSize: 13, color: '#9DA2B3', textAlign: 'center', marginBottom: 14 }}>
          {playerProfile.position} · {playerProfile.academy}
        </p>

        <div className="fade-up-1" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '14px 18px', width: '100%', marginBottom: 18 }}>
          <p style={{ fontSize: 14, color: '#fff', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.55, margin: 0 }}>
            &ldquo;Kiyan had a standout match today — his energy and vision drove everything forward.&rdquo;
          </p>
        </div>

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

        <p key={activePeriod} className="num-fade fade-up-4" style={{ fontSize: 12, color: '#6E7180', textAlign: 'center' }}>
          {currentData.context}
        </p>

        <div className="fade-up-5" style={{ width: '100%', marginTop: 16 }}>
          <KeyMetricsBlock playerId="player_001" dark={true} />
        </div>

        {/* Next Session */}
        {(() => {
          const nextSession = sessions
            .filter(s => s.status === 'scheduled' && s.participatingPlayerIds?.includes('player_001'))
            .sort((a, b) => a.date.localeCompare(b.date))[0]
          if (!nextSession) return null
          const d = new Date(nextSession.date + 'T' + nextSession.startTime)
          return (
            <div style={{ width: '100%', marginTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#4A4AFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Next Session</p>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: nextSession.type === 'match' ? 'rgba(74,74,255,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {nextSession.type === 'match' ? <Trophy size={20} color="#4A4AFF" /> : <Calendar size={20} color="#F59E0B" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
                    {nextSession.type === 'match' ? `vs ${nextSession.opponent}` : 'Training Session'}
                  </p>
                  <p style={{ fontSize: 12, color: '#9DA2B3', margin: '2px 0 0' }}>
                    {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {nextSession.startTime}
                    {nextSession.competition ? ` · ${nextSession.competition}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Recent Activity */}
        <div style={{ width: '100%', marginTop: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4A4AFF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Recent Activity</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: Play, color: '#10B981', label: 'New highlight generated', sub: 'Goal vs Al Wasl Academy', time: '2d ago' },
              { icon: Trophy, color: '#4A4AFF', label: 'Match analysed', sub: 'Score: 81 vs Al Wasl Academy', time: '3d ago' },
              { icon: MessageSquare, color: '#F59E0B', label: 'Coach feedback received', sub: coachFeedbackHistory[0]?.summary?.slice(0, 40) + '...' || 'Great performance', time: '3d ago' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={item.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: '#6E7180', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#6E7180', flexShrink: 0 }}>{item.time}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Notification Centre */}
      <NotificationCentre open={notifOpen} onClose={() => setNotifOpen(false)} role="parent" />

      {/* Player Card Share Modal */}
      <PlayerCardShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        player={{
          name: playerProfile.name,
          position: playerProfile.position,
          jerseyNumber: playerProfile.jerseyNumber,
          team: playerProfile.team,
          academy: playerProfile.academy,
          photo: '/players/kiyan.jpg',
        }}
        compositeScore={displayScore}
      />
    </div>
  )
}
