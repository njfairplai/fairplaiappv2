'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar, MapPin, Clock, Trophy, Users, ChevronRight, BarChart3,
  TrendingUp, Award, Target, ChevronLeft, ChevronDown, Filter, ArrowUpDown,
  Search, Shirt,
} from 'lucide-react'
import { COLORS } from '@/lib/constants'
import { useCoachTheme } from '@/contexts/CoachThemeContext'

// ─── MOCK DATA (static for layout purposes) ──────────────────
const upcoming = [
  { id: 1, opponent: 'Al Wahda FC', date: 'Apr 15', time: '10:00 AM', pitch: 'Pitch 1', comp: 'UAE U12 Spring Cup', daysAway: 16 },
  { id: 2, opponent: 'Sharjah Youth', date: 'Apr 16', time: '2:00 PM', pitch: 'Pitch 1', comp: 'UAE U12 Spring Cup', daysAway: 17 },
  { id: 3, opponent: 'Abu Dhabi Stars', date: 'Apr 17', time: '4:00 PM', pitch: 'Pitch 1', comp: 'UAE U12 Spring Cup', daysAway: 18 },
]

const history = [
  { id: 4, opponent: 'Dubai SC', date: 'Mar 7', score: null, status: 'needs_analysis' as const, result: null },
  { id: 5, opponent: 'Al Jazira Youth', date: 'Mar 5', score: null, status: 'processing' as const, result: null },
  { id: 6, opponent: 'Shabab Al Ahli', date: 'Feb 28', score: 81, status: 'analysed' as const, result: 'W' as const, top: 'Kiyan Makkawi' },
  { id: 7, opponent: 'Al Wasl Academy', date: 'Feb 24', score: 78, status: 'analysed' as const, result: 'L' as const, top: 'Ahmed Hassan' },
  { id: 8, opponent: 'Al Ain FC', date: 'Feb 14', score: 75, status: 'analysed' as const, result: 'W' as const, top: 'Omar Al Rashidi' },
  { id: 9, opponent: 'Baniyas SC', date: 'Feb 7', score: 72, status: 'analysed' as const, result: 'D' as const, top: 'Saeed Khalifa' },
  { id: 10, opponent: 'Ajman FC', date: 'Jan 31', score: 69, status: 'analysed' as const, result: 'W' as const, top: 'Kiyan Makkawi' },
]

// ─── HYBRID MOCK DATA (training-match heavy) ──────────────────
type SessionType = 'training' | 'competitive'

const hybridSessions = [
  // Upcoming
  { id: 'u1', type: 'training' as SessionType, team: 'U12 Red', date: 'Apr 1', time: '5:00 PM', pitch: 'Pitch 2', isUpcoming: true, score: null, status: 'scheduled', top: null, teamA: 4, teamB: 4 },
  { id: 'u2', type: 'training' as SessionType, team: 'U12 Red', date: 'Apr 3', time: '5:00 PM', pitch: 'Pitch 1', isUpcoming: true, score: null, status: 'scheduled', top: null, teamA: 4, teamB: 4 },
  { id: 'u3', type: 'competitive' as SessionType, team: 'U12 Red', date: 'Apr 15', time: '10:00 AM', pitch: 'Pitch 1', isUpcoming: true, score: null, status: 'scheduled', top: null, opponent: 'Al Wahda FC', comp: 'UAE U12 Spring Cup' },
  // History
  { id: 'h1', type: 'training' as SessionType, team: 'U12 Red', date: 'Mar 27', time: '5:00 PM', pitch: 'Pitch 2', isUpcoming: false, score: 76, status: 'analysed', top: 'Kiyan Makkawi', topScore: 84, teamA: 4, teamB: 4 },
  { id: 'h2', type: 'training' as SessionType, team: 'U14 Blue', date: 'Mar 26', time: '4:00 PM', pitch: 'Pitch 1', isUpcoming: false, score: 71, status: 'analysed', top: 'Hamdan Al Mazrouei', topScore: 79, teamA: 5, teamB: 5 },
  { id: 'h3', type: 'training' as SessionType, team: 'U12 Red', date: 'Mar 24', time: '5:00 PM', pitch: 'Pitch 2', isUpcoming: false, score: null, status: 'needs_analysis', top: null, teamA: 4, teamB: 4 },
  { id: 'h4', type: 'competitive' as SessionType, team: 'U12 Red', date: 'Mar 22', time: '3:00 PM', pitch: 'Pitch 1', isUpcoming: false, score: 81, status: 'analysed', top: 'Kiyan Makkawi', topScore: 88, opponent: 'Shabab Al Ahli', comp: 'UAE Youth League', result: 'W' },
  { id: 'h5', type: 'training' as SessionType, team: 'U12 Red', date: 'Mar 20', time: '5:00 PM', pitch: 'Pitch 2', isUpcoming: false, score: 73, status: 'analysed', top: 'Ahmed Hassan', topScore: 81, teamA: 4, teamB: 4 },
  { id: 'h6', type: 'training' as SessionType, team: 'U14 Blue', date: 'Mar 19', time: '4:00 PM', pitch: 'Pitch 1', isUpcoming: false, score: 68, status: 'analysed', top: 'Saeed Khalifa', topScore: 76, teamA: 5, teamB: 5 },
  { id: 'h7', type: 'competitive' as SessionType, team: 'U12 Red', date: 'Mar 15', time: '3:00 PM', pitch: 'Pitch 1', isUpcoming: false, score: 78, status: 'analysed', top: 'Omar Al Rashidi', topScore: 85, opponent: 'Al Wasl Academy', comp: 'UAE Youth League', result: 'L' },
  { id: 'h8', type: 'training' as SessionType, team: 'U12 Red', date: 'Mar 13', time: '5:00 PM', pitch: 'Pitch 2', isUpcoming: false, score: 74, status: 'analysed', top: 'Kiyan Makkawi', topScore: 82, teamA: 4, teamB: 4 },
]

const calendarDays = (() => {
  // Generate March 2026 calendar
  const days: { day: number; match?: typeof history[0] | typeof upcoming[0] & { isUpcoming?: boolean } }[] = []
  for (let i = 1; i <= 31; i++) {
    const matchDay = history.find(h => {
      const d = parseInt(h.date.split(' ')[1])
      return h.date.startsWith('Mar') && d === i
    })
    days.push({ day: i, match: matchDay || undefined })
  }
  return days
})()

function getScoreColor(score: number): string {
  if (score >= 75) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function getResultColor(result: string | null): string {
  if (result === 'W') return '#10B981'
  if (result === 'L') return '#EF4444'
  if (result === 'D') return '#F59E0B'
  return '#64748B'
}

type Concept = 'hybrid' | 'A' | 'C' | 'D'

export default function ConceptsPage() {
  const [active, setActive] = useState<Concept>('hybrid')
  const { colors } = useCoachTheme()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: colors.pageBg, overflow: 'hidden' }}>
      {/* Concept Switcher */}
      <div style={{
        padding: '16px 28px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginRight: 8 }}>CONCEPT:</span>
        {(['hybrid', 'A', 'C', 'D'] as Concept[]).map(c => (
          <button
            key={c}
            onClick={() => setActive(c)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: active === c ? COLORS.primary : 'rgba(255,255,255,0.06)',
              color: active === c ? '#fff' : '#94a3b8',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {c === 'hybrid' && 'Hybrid (A+C)'}
            {c === 'A' && 'A: Hero + Results'}
            {c === 'C' && 'C: Dashboard + Cards'}
            {c === 'D' && 'D: Calendar View'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {active === 'hybrid' && <ConceptHybrid />}
        {active === 'A' && <ConceptA />}
        {active === 'C' && <ConceptC />}
        {active === 'D' && <ConceptD />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HYBRID: Dashboard Stats + Hero + Clean Table (Training-first)
// ═══════════════════════════════════════════════════════════════
function ConceptHybrid() {
  const { colors } = useCoachTheme()
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
  const [filterType, setFilterType] = useState<'all' | 'training' | 'competitive'>('all')
  const [tableView, setTableView] = useState<'history' | 'upcoming'>('history')

  const teams = ['all', 'U12 Red', 'U14 Blue']

  const filtered = hybridSessions.filter(s => {
    if (selectedTeam !== 'all' && s.team !== selectedTeam) return false
    if (filterType !== 'all' && s.type !== filterType) return false
    return true
  })

  const upcomingSessions = filtered.filter(s => s.isUpcoming)
  const historySessions = filtered.filter(s => !s.isUpcoming).sort((a, b) => {
    if (sortBy === 'score') return (b.score || 0) - (a.score || 0)
    return 0 // already sorted by date
  })

  const analysed = historySessions.filter(s => s.status === 'analysed')
  const avgScore = analysed.length > 0 ? Math.round(analysed.reduce((sum, s) => sum + (s.score || 0), 0) / analysed.length) : 0
  const totalSessions = historySessions.length

  // Next session (first upcoming)
  const nextSession = upcomingSessions[0]

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* ── TEAM FILTER CHIPS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {teams.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTeam(t)}
            style={{
              padding: '7px 16px', borderRadius: 20, border: 'none',
              background: selectedTeam === t ? COLORS.primary : 'rgba(255,255,255,0.06)',
              color: selectedTeam === t ? '#fff' : '#94a3b8',
              fontSize: 13, fontWeight: selectedTeam === t ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            {t === 'all' ? 'All Teams' : t}
          </button>
        ))}
      </div>

      {/* ── STAT CARDS (3) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${COLORS.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={18} color={COLORS.primary} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>{totalSessions}</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Sessions This Month</div>
          </div>
        </div>

        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart3 size={18} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>{avgScore}</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Avg Squad Score</div>
          </div>
        </div>

        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="#8B5CF6" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>+3.2</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Score Trend (30d)</div>
          </div>
        </div>
      </div>

      {/* ── HERO: NEXT SESSION ── */}
      {nextSession && (
        <div style={{
          background: colors.heroBg,
          borderRadius: 16, padding: '24px 28px', marginBottom: 28,
          border: `1px solid ${nextSession.type === 'competitive' ? `${COLORS.primary}20` : 'rgba(16,185,129,0.15)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 160, height: 160,
            borderRadius: '50%', background: nextSession.type === 'competitive' ? `${COLORS.primary}06` : 'rgba(16,185,129,0.04)',
            filter: 'blur(50px)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{
                padding: '4px 10px', borderRadius: 6,
                background: nextSession.type === 'competitive' ? `${COLORS.primary}20` : 'rgba(16,185,129,0.12)',
                color: nextSession.type === 'competitive' ? COLORS.primary : '#10B981',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {nextSession.type === 'competitive' ? 'Competitive Match' : 'Training Match'}
              </span>
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Next session — {nextSession.date}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: '0 0 6px' }}>
                  {nextSession.type === 'competitive'
                    ? `vs ${(nextSession as any).opponent}`
                    : `${nextSession.team} — Training Match`
                  }
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {nextSession.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> {nextSession.pitch}
                  </span>
                  {nextSession.type === 'training' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shirt size={13} /> Team A vs Team B
                    </span>
                  )}
                  {nextSession.type === 'competitive' && (nextSession as any).comp && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trophy size={13} /> {(nextSession as any).comp}
                    </span>
                  )}
                </div>
              </div>

              <div style={{
                padding: '12px 24px', borderRadius: 10,
                background: nextSession.type === 'competitive' ? COLORS.primary : '#10B981',
                color: '#fff', fontSize: 14, fontWeight: 700,
                boxShadow: `0 4px 16px ${nextSession.type === 'competitive' ? COLORS.primary : '#10B981'}30`,
              }}>
                Prep & Record
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SESSIONS TABLE ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {/* History / Upcoming Toggle (left) */}
        <div style={{ display: 'flex', gap: 2, background: colors.controlBg, borderRadius: 8, padding: 3 }}>
          {[
            { id: 'history' as const, label: 'History', count: historySessions.length },
            { id: 'upcoming' as const, label: 'Upcoming', count: upcomingSessions.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTableView(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none',
                background: tableView === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tableView === tab.id ? '#F8FAFC' : '#64748B',
                fontSize: 12, fontWeight: tableView === tab.id ? 700 : 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              <span style={{
                padding: '1px 6px', borderRadius: 10,
                background: tableView === tab.id ? `${COLORS.primary}30` : 'rgba(255,255,255,0.06)',
                color: tableView === tab.id ? COLORS.primary : '#475569',
                fontSize: 10, fontWeight: 700,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter / Sort Bar (right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Type Filter */}
          <div style={{ display: 'flex', gap: 2, background: colors.controlBg, borderRadius: 6, padding: 2 }}>
            {[
              { id: 'all' as const, label: 'All' },
              { id: 'training' as const, label: 'Training' },
              { id: 'competitive' as const, label: 'Competitive' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: '5px 10px', borderRadius: 4, border: 'none',
                  background: filterType === f.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: filterType === f.id ? '#F8FAFC' : '#64748B',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort (history only) */}
          {tableView === 'history' && (
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'score' : 'date')}
              style={{
                padding: '5px 10px', borderRadius: 6, border: 'none',
                background: colors.controlBg, color: '#94a3b8',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <ArrowUpDown size={11} /> {sortBy === 'date' ? 'By date' : 'By score'}
            </button>
          )}
        </div>
      </div>

      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${colors.cardBorder}`,
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: tableView === 'history' ? '60px 80px 1fr 100px 60px 70px' : '60px 80px 1fr 100px 100px',
          padding: '10px 16px', background: colors.tableHeaderBg,
          fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <span>Date</span>
          <span>Type</span>
          <span>Session</span>
          {tableView === 'history' ? (
            <>
              <span style={{ textAlign: 'center' }}>Status</span>
              <span style={{ textAlign: 'center' }}>Score</span>
              <span style={{ textAlign: 'right' }}>Top Player</span>
            </>
          ) : (
            <>
              <span style={{ textAlign: 'center' }}>Time</span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </>
          )}
        </div>

        {/* HISTORY ROWS */}
        {tableView === 'history' && historySessions.map((s, i) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 60px 70px',
            padding: '12px 16px', alignItems: 'center',
            background: i % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd,
            borderTop: `1px solid ${colors.tableBorder}`,
            cursor: s.status === 'analysed' ? 'pointer' : 'default',
          }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.date}</span>
            <div>
              <span style={{
                padding: '3px 8px', borderRadius: 4,
                background: s.type === 'competitive' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)',
                color: s.type === 'competitive' ? '#EF4444' : '#10B981',
                fontSize: 10, fontWeight: 700,
              }}>
                {s.type === 'competitive' ? 'Match' : 'Training'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                {s.type === 'competitive' ? `vs ${(s as any).opponent}` : `${s.team} — Team A vs Team B`}
              </span>
              {s.type === 'competitive' && (s as any).comp && (
                <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>{(s as any).comp}</span>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              {s.status === 'analysed' && <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Analysed</span>}
              {s.status === 'processing' && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Processing</span>}
              {s.status === 'needs_analysis' && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Analyse</span>}
            </div>
            <div style={{ textAlign: 'center' }}>
              {s.score ? (
                <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(s.score) }}>{s.score}</span>
              ) : (
                <span style={{ fontSize: 12, color: '#334155' }}>--</span>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              {s.top ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.top}</div>
                  {(s as any).topScore && <div style={{ fontSize: 10, color: '#64748B' }}>{(s as any).topScore}</div>}
                </div>
              ) : (
                <span style={{ fontSize: 11, color: '#334155' }}>--</span>
              )}
            </div>
          </div>
        ))}

        {/* UPCOMING ROWS */}
        {tableView === 'upcoming' && upcomingSessions.map((s, i) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 100px',
            padding: '12px 16px', alignItems: 'center',
            background: i % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd,
            borderTop: `1px solid ${colors.tableBorder}`,
          }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.date}</span>
            <div>
              <span style={{
                padding: '3px 8px', borderRadius: 4,
                background: s.type === 'competitive' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)',
                color: s.type === 'competitive' ? '#EF4444' : '#10B981',
                fontSize: 10, fontWeight: 700,
              }}>
                {s.type === 'competitive' ? 'Match' : 'Training'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                {s.type === 'competitive' ? `vs ${(s as any).opponent}` : `${s.team} — Training Match`}
              </span>
              {s.type === 'competitive' && (s as any).comp && (
                <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>{(s as any).comp}</span>
              )}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
              {s.time}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                padding: '6px 14px', borderRadius: 6,
                background: s.type === 'competitive' ? `${COLORS.primary}15` : 'rgba(16,185,129,0.1)',
                color: s.type === 'competitive' ? COLORS.primary : '#10B981',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>
                Prep & Record
              </span>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {tableView === 'history' && historySessions.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
            No sessions match your filters
          </div>
        )}
        {tableView === 'upcoming' && upcomingSessions.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
            No upcoming sessions
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT A: "Next Match" Hero + Results Board
// ═══════════════════════════════════════════════════════════════
function ConceptA() {
  const { colors } = useCoachTheme()
  return (
    <div style={{ padding: '24px 28px' }}>
      {/* ── NEXT MATCH HERO ── */}
      <div style={{
        background: colors.heroBg,
        borderRadius: 18,
        padding: '28px 32px',
        marginBottom: 24,
        border: '1px solid rgba(74,74,255,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: `${COLORS.primary}08`,
          filter: 'blur(60px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 6,
              background: `${COLORS.primary}20`, color: COLORS.primary,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>Next Match</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>in 16 days</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.textPrimary, margin: '0 0 6px' }}>
                vs Al Wahda FC
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={13} /> Apr 15, 2026
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} /> 10:00 AM
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={13} /> Pitch 1
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>
                <Trophy size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                UAE U12 Spring Cup
              </div>
            </div>

            <div style={{
              padding: '14px 28px', borderRadius: 12,
              background: COLORS.primary, color: '#fff',
              fontSize: 15, fontWeight: 700,
              boxShadow: `0 4px 20px ${COLORS.primary}40`,
            }}>
              Prep & Record
            </div>
          </div>
        </div>
      </div>

      {/* ── OTHER UPCOMING (compact) ── */}
      {upcoming.length > 1 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Also Coming Up
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {upcoming.slice(1).map(m => (
              <div key={m.id} style={{
                flex: 1, padding: '14px 16px', borderRadius: 12,
                background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
                  vs {m.opponent}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {m.date} at {m.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS BOARD ── */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
        Results
      </div>

      <div style={{
        borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${colors.cardBorder}`,
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 100px 60px 60px',
          padding: '10px 16px', background: colors.tableHeaderBg,
          fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <span>Date</span>
          <span>Opponent</span>
          <span style={{ textAlign: 'center' }}>Status</span>
          <span style={{ textAlign: 'center' }}>Score</span>
          <span style={{ textAlign: 'center' }}>Result</span>
        </div>

        {history.map((m, i) => (
          <div key={m.id} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 100px 60px 60px',
            padding: '12px 16px', alignItems: 'center',
            background: i % 2 === 0 ? colors.tableRowEven : colors.tableRowOdd,
            borderTop: `1px solid ${colors.tableBorder}`,
            cursor: m.status === 'analysed' ? 'pointer' : 'default',
          }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{m.date}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>vs {m.opponent}</span>
            <div style={{ textAlign: 'center' }}>
              {m.status === 'analysed' && (
                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Analysed</span>
              )}
              {m.status === 'processing' && (
                <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Processing</span>
              )}
              {m.status === 'needs_analysis' && (
                <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Analyse</span>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              {m.score ? (
                <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(m.score) }}>{m.score}</span>
              ) : (
                <span style={{ fontSize: 12, color: '#334155' }}>--</span>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              {m.result ? (
                <span style={{
                  display: 'inline-flex', width: 28, height: 28, borderRadius: 6,
                  alignItems: 'center', justifyContent: 'center',
                  background: `${getResultColor(m.result)}15`,
                  color: getResultColor(m.result),
                  fontSize: 13, fontWeight: 800,
                }}>
                  {m.result}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: '#334155' }}>--</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT C: Dashboard Stats + Card Grid
// ═══════════════════════════════════════════════════════════════
function ConceptC() {
  const { colors } = useCoachTheme()
  const analysed = history.filter(h => h.status === 'analysed')
  const wins = analysed.filter(h => h.result === 'W').length
  const avgScore = analysed.length > 0 ? Math.round(analysed.reduce((s, h) => s + (h.score || 0), 0) / analysed.length) : 0

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* ── SEASON STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Matches Played', value: analysed.length, icon: Target, color: COLORS.primary },
          { label: 'Avg Squad Score', value: avgScore, icon: BarChart3, color: '#10B981' },
          { label: 'Win Rate', value: `${Math.round((wins / analysed.length) * 100)}%`, icon: TrendingUp, color: '#F59E0B' },
          { label: 'Next Match', value: '16 days', icon: Calendar, color: '#8B5CF6' },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '18px 20px', borderRadius: 14,
            background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${stat.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={16} color={stat.color} />
              </div>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: colors.textPrimary }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── NEXT UP (horizontal scroll) ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Next Up
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {upcoming.map((m, i) => (
            <div key={m.id} style={{
              minWidth: 240, padding: '18px 20px', borderRadius: 14,
              background: i === 0 ? colors.heroBg : colors.cardBg,
              border: `1px solid ${i === 0 ? `${COLORS.primary}30` : 'rgba(255,255,255,0.06)'}`,
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>
                {m.date} at {m.time}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
                vs {m.opponent}
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>
                <MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                {m.pitch}
                <span style={{ margin: '0 6px' }}>|</span>
                <Trophy size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                {m.comp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT RESULTS (Card Grid) ── */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        Recent Results
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {history.map(m => (
          <div key={m.id} style={{
            padding: '18px 20px', borderRadius: 14,
            background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
            cursor: m.status === 'analysed' ? 'pointer' : 'default',
            opacity: m.status === 'analysed' ? 1 : 0.6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>{m.date}</span>
              {m.result && (
                <span style={{
                  padding: '3px 8px', borderRadius: 4,
                  background: `${getResultColor(m.result)}15`,
                  color: getResultColor(m.result),
                  fontSize: 11, fontWeight: 800,
                }}>
                  {m.result === 'W' ? 'Win' : m.result === 'L' ? 'Loss' : 'Draw'}
                </span>
              )}
              {m.status === 'processing' && (
                <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>Processing</span>
              )}
              {m.status === 'needs_analysis' && (
                <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Not analysed</span>
              )}
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
              vs {m.opponent}
            </div>

            {m.score ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>Avg Score</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: getScoreColor(m.score) }}>{m.score}</div>
                </div>
                {m.top && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>Top Performer</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{m.top}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, background: colors.tableHeaderBg,
                fontSize: 12, color: '#475569',
              }}>
                {m.status === 'processing' ? 'Analysis in progress...' : 'Tap to analyse'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// CONCEPT D: Calendar View
// ═══════════════════════════════════════════════════════════════
function ConceptD() {
  const { colors } = useCoachTheme()
  const [selectedMonth] = useState('March 2026')

  // Build a proper calendar grid for March 2026 (starts on Sunday)
  // March 1, 2026 is a Sunday
  const daysInMonth = 31
  const firstDayOfWeek = 0 // Sunday

  const allMatchDays: Record<number, { type: 'history' | 'upcoming'; opponent: string; score?: number | null; result?: string | null; status?: string }> = {
    5: { type: 'history', opponent: 'Al Jazira Youth', status: 'processing' },
    7: { type: 'history', opponent: 'Dubai SC', status: 'needs_analysis' },
  }

  // Feb matches shown as "previous month" context
  const upcomingInApril: Record<number, { opponent: string; time: string }> = {}

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Generate calendar cells
  const cells: { day: number | null; match?: typeof allMatchDays[number] }[] = []
  // Fill empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, match: allMatchDays[d] })
  }
  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push({ day: null })

  // Analysed matches for the sidebar
  const analysedHistory = history.filter(h => h.status === 'analysed')

  return (
    <div style={{ padding: '24px 28px', display: 'flex', gap: 24 }}>
      {/* ── CALENDAR ── */}
      <div style={{ flex: 1 }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ChevronLeft size={16} color="#94a3b8" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, margin: 0 }}>{selectedMonth}</h2>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> Analysed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} /> Processing
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> Needs Analysis
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.primary }} /> Upcoming
            </span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1,
          marginBottom: 1,
        }}>
          {weekdays.map(d => (
            <div key={d} style={{
              textAlign: 'center', padding: '8px 0',
              fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1,
          background: colors.tableHeaderBg, borderRadius: 14, overflow: 'hidden',
        }}>
          {cells.map((cell, i) => {
            const hasMatch = cell.match
            const dotColor = hasMatch
              ? hasMatch.status === 'analysed' ? '#10B981'
                : hasMatch.status === 'processing' ? '#F59E0B'
                  : '#EF4444'
              : null

            return (
              <div key={i} style={{
                minHeight: 80, padding: '6px 8px',
                background: cell.day ? colors.cardBg : colors.cardBgAlt,
                cursor: hasMatch ? 'pointer' : 'default',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                borderRight: '1px solid rgba(255,255,255,0.04)',
              }}>
                {cell.day && (
                  <>
                    <div style={{
                      fontSize: 13, fontWeight: cell.day === 30 ? 800 : 500,
                      color: cell.day === 30 ? COLORS.primary : hasMatch ? '#F8FAFC' : '#475569',
                      marginBottom: 4,
                    }}>
                      {cell.day}
                    </div>
                    {hasMatch && (
                      <div style={{
                        padding: '4px 6px', borderRadius: 6,
                        background: `${dotColor}12`,
                        border: `1px solid ${dotColor}25`,
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: dotColor || undefined, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          vs {hasMatch.opponent}
                        </div>
                        {hasMatch.score && (
                          <div style={{ fontSize: 11, fontWeight: 800, color: getScoreColor(hasMatch.score), marginTop: 1 }}>
                            {hasMatch.score}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SIDEBAR: Selected Match / Summary ── */}
      <div style={{ width: 280, flexShrink: 0 }}>
        {/* Next Match */}
        <div style={{
          padding: '18px 20px', borderRadius: 14, marginBottom: 16,
          background: colors.heroBg,
          border: `1px solid ${COLORS.primary}20`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.primary, textTransform: 'uppercase', marginBottom: 8 }}>
            Next Match
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
            vs Al Wahda FC
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
            Apr 15 at 10:00 AM
          </div>
          <div style={{
            padding: '10px 0', textAlign: 'center', borderRadius: 8,
            background: COLORS.primary, color: '#fff',
            fontSize: 13, fontWeight: 700,
          }}>
            Prep & Record
          </div>
        </div>

        {/* Recent Form */}
        <div style={{
          padding: '18px 20px', borderRadius: 14,
          background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 12 }}>
            Recent Form
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {analysedHistory.slice(0, 5).map(h => (
              <div key={h.id} style={{
                flex: 1, height: 32, borderRadius: 6,
                background: `${getResultColor(h.result)}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: getResultColor(h.result),
              }}>
                {h.result}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {analysedHistory.filter(h => h.result === 'W').length}W {analysedHistory.filter(h => h.result === 'D').length}D {analysedHistory.filter(h => h.result === 'L').length}L from last {analysedHistory.length}
          </div>
        </div>

        {/* Score Trend */}
        <div style={{
          padding: '18px 20px', borderRadius: 14,
          background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 12 }}>
            Score Trend
          </div>
          {/* Mini bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {analysedHistory.map(h => {
              const height = h.score ? ((h.score - 50) / 50) * 80 : 10
              return (
                <div key={h.id} style={{
                  flex: 1, height: Math.max(height, 8), borderRadius: '4px 4px 0 0',
                  background: h.score ? getScoreColor(h.score) : '#334155',
                  opacity: 0.8,
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 9, fontWeight: 700, color: '#94a3b8',
                  }}>
                    {h.score || ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {analysedHistory.map(h => (
              <span key={h.id} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: '#475569' }}>
                {h.date.split(' ')[1]}/{h.date.split(' ')[0].slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
