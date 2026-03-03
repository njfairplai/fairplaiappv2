'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Badge from '@/components/ui/Badge'
import { players, rosters, sessions, academies, tournaments, creditUsageByMonth } from '@/lib/mockData'
import { COLORS, SHADOWS } from '@/lib/constants'
import { Trophy } from 'lucide-react'

const BarChartDynamic = dynamic(() => import('./CreditChart'), { ssr: false })

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 16px', boxShadow: SHADOWS.card, textAlign: 'center' }}>
      <p style={{ fontSize: 28, fontWeight: 900, color: COLORS.navy, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{label}</p>
    </div>
  )
}

export default function AcademyDashboard() {
  const totalPlayers = players.filter((p) => p.academyId === 'academy_001').length
  const activeRosters = rosters.filter((r) => r.academyId === 'academy_001').length
  const matchesThisMonth = sessions.filter((s) => s.academyId === 'academy_001' && s.type === 'match' && s.date.startsWith('2026-02')).length
  const upcomingSessions = sessions.filter((s) => s.academyId === 'academy_001' && s.status === 'scheduled').slice(0, 3)
  const academy = academies[0]
  const tournament = tournaments[0]

  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 3000)
      return () => clearTimeout(t)
    }
  }, [toastVisible])

  const recentActivity = [
    { time: '2h ago', action: 'Match vs Al Wasl analysed — U12 Red' },
    { time: '1d ago', action: 'Player Ahmed Hassan added to U12 Red' },
    { time: '2d ago', action: 'Coach Marcus Silva invited' },
    { time: '3d ago', action: 'U14 Blue match vs Sharjah FC analysed' },
    { time: '5d ago', action: 'Session scheduled: U12 Red training' },
  ]

  /* Tournament roster name lookup */
  const tournamentRoster = tournament?.rosterIds?.[0]
    ? rosters.find((r) => r.id === tournament.rosterIds[0])
    : null

  function formatTournamentDates(start: string, end: string): string {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[s.getMonth()]} ${s.getDate()}\u2013${e.getDate()}, ${s.getFullYear()}`
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: '0 0 24px' }}>Dashboard</h1>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard value={totalPlayers} label="Total Players" />
        <StatCard value={activeRosters} label="Active Rosters" />
        <StatCard value={matchesThisMonth} label="Matches This Month" />
        <StatCard value={`${academy.creditBalance} min`} label="Minutes Remaining" />
      </div>

      {/* Activity + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Recent Activity</h3>
          {recentActivity.map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 0',
              borderBottom: i < recentActivity.length - 1 ? `1px solid ${COLORS.border}` : 'none',
            }}>
              <span style={{ fontSize: 12, color: COLORS.muted, whiteSpace: 'nowrap', minWidth: 50 }}>{a.time}</span>
              <span style={{ fontSize: 14, color: COLORS.navy }}>{a.action}</span>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Upcoming Sessions</h3>
          {upcomingSessions.map((s) => (
            <div key={s.id} style={{ padding: '12px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, margin: 0 }}>
                    {s.type === 'match' ? `vs ${s.opponent}` : 'Training'}
                  </p>
                  <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{s.date} &middot; {s.startTime}</p>
                </div>
                <Badge variant={s.type === 'match' ? 'info' : 'success'}>{s.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournaments section */}
      {tournament && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} color={COLORS.navy} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Upcoming Tournaments</h3>
            </div>
            <span style={{
              background: COLORS.border, color: COLORS.muted,
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
            }}>
              Phase 2 Feature
            </span>
          </div>

          <div style={{
            background: '#F9FAFB', borderRadius: 10, padding: 16, marginBottom: 16,
          }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, margin: '0 0 6px' }}>{tournament.name}</p>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 4px' }}>
              {formatTournamentDates(tournament.startDate, tournament.endDate)}
            </p>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 10px' }}>{tournament.location}</p>
            {tournamentRoster && (
              <span style={{
                background: `${COLORS.primary}1A`, color: COLORS.primary,
                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
              }}>
                {tournamentRoster.name}
              </span>
            )}
          </div>

          <button
            onClick={() => setToastVisible(true)}
            style={{
              padding: '10px 20px', borderRadius: 8,
              border: `2px solid ${COLORS.primary}`, background: 'transparent',
              color: COLORS.primary, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Register Interest
          </button>
        </div>
      )}

      {/* Credit Usage chart */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: SHADOWS.card, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: '0 0 16px' }}>Credit Usage</h3>
        <BarChartDynamic />
      </div>

      {/* Toast notification */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: COLORS.navy, color: '#fff', padding: '14px 28px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, boxShadow: SHADOWS.elevated, zIndex: 1000,
          animation: 'fadeInUp 0.3s ease',
        }}>
          We&apos;ll notify you when tournament management is available
        </div>
      )}

      {/* Toast animation style */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
