'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Users, X } from 'lucide-react'
import { FORMATIONS, SQUAD_SIZES, type SquadSize, type Formation, type FormationPosition } from '@/lib/formations'
import type { Session, Player, Roster } from '@/lib/types'

type MatchStep = 'squad_size' | 'formation' | 'lineup' | 'game_plan' | 'review'

interface MatchPrepFlowProps {
  session: Session
  players: Player[]
  roster: Roster | undefined
  onBack: () => void
  onSave: () => void
}

const STEP_LABELS: Record<MatchStep, string> = {
  squad_size: 'Squad Size',
  formation: 'Formation',
  lineup: 'Lineup',
  game_plan: 'Game Plan',
  review: 'Review',
}

const STEPS: MatchStep[] = ['squad_size', 'formation', 'lineup', 'game_plan', 'review']

export default function MatchPrepFlow({ session, players, roster, onBack, onSave }: MatchPrepFlowProps) {
  const [step, setStep] = useState<MatchStep>('squad_size')
  const [squadSize, setSquadSize] = useState<SquadSize | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [lineup, setLineup] = useState<Record<number, string>>({}) // positionIndex -> playerId
  const [selectedPositionIdx, setSelectedPositionIdx] = useState<number | null>(null)
  const [playingStyle, setPlayingStyle] = useState('')
  const [setPieces, setSetPieces] = useState('')
  const [tacticalNotes, setTacticalNotes] = useState('')

  const stepIdx = STEPS.indexOf(step)
  const stepNum = Math.min(stepIdx + 1, 4)

  const sessionDate = new Date(session.date + 'T' + session.startTime)
  const dateStr = sessionDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })

  function goBack() {
    const idx = STEPS.indexOf(step)
    if (idx === 0) { onBack(); return }
    setStep(STEPS[idx - 1])
  }

  // ─── Squad Size Step ───────────────────────────
  if (step === 'squad_size') {
    return (
      <div style={{ padding: '24px 16px' }}>
        <StepHeader step={1} total={4} title="Squad Size" subtitle={`vs ${session.opponent || 'TBD'} · ${dateStr} · ${roster?.name || ''}`} onBack={onBack} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
          {SQUAD_SIZES.map(({ size, label, description }) => (
            <button
              key={size}
              onClick={() => { setSquadSize(size); setSelectedFormation(null); setLineup({}); setStep('formation') }}
              style={{
                background: '#fff',
                border: '2px solid #E8EAED',
                borderRadius: 16,
                padding: '24px 16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1B1650', marginBottom: 4 }}>{size}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1B1650' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{description}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Formation Step ────────────────────────────
  if (step === 'formation') {
    const formations = squadSize ? FORMATIONS[squadSize] : []
    return (
      <div style={{ padding: '24px 16px' }}>
        <StepHeader step={2} total={4} title="Formation" subtitle={`${squadSize}-a-side · vs ${session.opponent || 'TBD'}`} onBack={goBack} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
          {formations.map(f => {
            const isSelected = selectedFormation?.id === f.id
            return (
              <button
                key={f.id}
                onClick={() => { setSelectedFormation(f); setLineup({}) }}
                style={{
                  background: isSelected ? 'rgba(74,74,255,0.08)' : '#fff',
                  border: `2px solid ${isSelected ? '#4A4AFF' : '#E8EAED'}`,
                  borderRadius: 16,
                  padding: 16,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {/* Mini pitch preview */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '2 / 3',
                  background: '#2E7D32',
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}>
                  {/* Center line */}
                  <div style={{ position: 'absolute', left: '8%', right: '8%', top: '50%', height: 1, background: 'rgba(255,255,255,0.3)' }} />
                  {/* Center circle */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '30%', aspectRatio: '1', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', transform: 'translate(-50%,-50%)' }} />
                  {/* Position dots */}
                  {f.positions.map((p, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: `${p.x}%`,
                      top: `${100 - p.y}%`,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: p.role === 'GK' ? '#FCD34D' : '#fff',
                      transform: 'translate(-50%,-50%)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1B1650' }}>{f.label}</div>
              </button>
            )
          })}
        </div>

        {selectedFormation && (
          <button
            onClick={() => setStep('lineup')}
            style={{
              width: '100%', marginTop: 20, padding: '14px 0', borderRadius: 14,
              background: '#4A4AFF', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Set Lineup <ChevronRight size={18} />
          </button>
        )}
      </div>
    )
  }

  // ─── Lineup Step ───────────────────────────────
  if (step === 'lineup') {
    const positions = selectedFormation?.positions || []
    const assignedPlayerIds = new Set(Object.values(lineup))

    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StepHeader step={3} total={4} title="Lineup" subtitle={`${selectedFormation?.label} · vs ${session.opponent || 'TBD'}`} onBack={goBack} />

        {/* Pitch with positions */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 30%, #388E3C 50%, #2E7D32 70%, #1B5E20 100%)',
          borderRadius: 14,
          overflow: 'hidden',
          border: '2px solid #1B5E20',
        }}>
          {/* Pitch markings */}
          <div style={{ position: 'absolute', inset: '3%', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: '3%', right: '3%', top: '50%', height: 2, background: 'rgba(255,255,255,0.4)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '22%', aspectRatio: '1', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', transform: 'translate(-50%,-50%)' }} />
          {/* Penalty areas */}
          <div style={{ position: 'absolute', bottom: '3%', left: '25%', right: '25%', height: '14%', border: '2px solid rgba(255,255,255,0.3)', borderBottom: 'none' }} />
          <div style={{ position: 'absolute', top: '3%', left: '25%', right: '25%', height: '14%', border: '2px solid rgba(255,255,255,0.3)', borderTop: 'none' }} />

          {/* Grass stripes */}
          {[20, 40, 60, 80].map(y => (
            <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: '10%', background: 'rgba(255,255,255,0.03)' }} />
          ))}

          {/* Position markers */}
          {positions.map((pos, idx) => {
            const playerId = lineup[idx]
            const player = playerId ? players.find(p => p.id === playerId) : null
            const isSelected = selectedPositionIdx === idx
            const isEmpty = !player

            return (
              <button
                key={idx}
                onClick={() => setSelectedPositionIdx(isSelected ? null : idx)}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${100 - pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: isEmpty ? 40 : 44,
                  height: isEmpty ? 40 : 52,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  zIndex: isSelected ? 10 : 1,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: player ? '#fff' : 'rgba(255,255,255,0.2)',
                  border: `2px solid ${isSelected ? '#4A4AFF' : player ? '#fff' : 'rgba(255,255,255,0.5)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected ? '0 0 0 4px rgba(74,74,255,0.4)' : '0 2px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.15s',
                }}>
                  {player ? (
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1B1650' }}>{player.jerseyNumber}</span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{pos.role}</span>
                  )}
                </div>
                <span style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  maxWidth: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {player ? player.firstName : pos.role}
                </span>
              </button>
            )
          })}
        </div>

        {/* Player assignment hint */}
        {selectedPositionIdx !== null && (
          <div style={{
            background: 'rgba(74,74,255,0.08)',
            border: '1px solid rgba(74,74,255,0.2)',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 12,
            color: '#4A4AFF',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            Tap a player below to assign to {positions[selectedPositionIdx]?.role}
          </div>
        )}

        {/* Player list */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          overflow: 'hidden',
          maxHeight: 240,
          overflowY: 'auto',
        }}>
          <div style={{ padding: '10px 14px 6px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Squad ({players.length} players)
          </div>
          {sortPlayersByFit(players, selectedPositionIdx !== null ? positions[selectedPositionIdx] : null).map(player => {
            const isAssigned = assignedPlayerIds.has(player.id)
            const assignedToIdx = Object.entries(lineup).find(([, pid]) => pid === player.id)?.[0]
            const isBestFit = selectedPositionIdx !== null && player.position.includes(positions[selectedPositionIdx]?.role)

            return (
              <button
                key={player.id}
                onClick={() => {
                  if (selectedPositionIdx === null) return
                  // Remove player from previous position if assigned elsewhere
                  const newLineup = { ...lineup }
                  Object.entries(newLineup).forEach(([k, v]) => { if (v === player.id) delete newLineup[Number(k)] })
                  newLineup[selectedPositionIdx] = player.id
                  setLineup(newLineup)
                  // Auto-advance to next empty position
                  const nextEmpty = positions.findIndex((_, i) => i !== selectedPositionIdx && !newLineup[i])
                  setSelectedPositionIdx(nextEmpty >= 0 ? nextEmpty : null)
                }}
                disabled={selectedPositionIdx === null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 14px',
                  background: isBestFit ? 'rgba(74,74,255,0.04)' : 'transparent',
                  border: 'none',
                  borderTop: '1px solid #F1F2F6',
                  cursor: selectedPositionIdx !== null ? 'pointer' : 'default',
                  opacity: isAssigned && selectedPositionIdx !== null ? 0.4 : 1,
                  textAlign: 'left',
                }}
              >
                {/* Jersey number circle */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: isAssigned ? '#E8EAED' : '#1B1650',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: isAssigned ? '#94a3b8' : '#fff' }}>{player.jerseyNumber}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isAssigned ? '#94a3b8' : '#0F172A' }}>
                    {player.firstName} {player.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {player.position.join(' / ')}
                    {isAssigned && assignedToIdx !== undefined && ` · ${positions[Number(assignedToIdx)]?.role}`}
                  </div>
                </div>
                {isBestFit && !isAssigned && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#4A4AFF', background: 'rgba(74,74,255,0.1)', padding: '2px 6px', borderRadius: 6 }}>FIT</span>
                )}
                {isAssigned && (
                  <Check size={14} color="#94a3b8" />
                )}
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => setStep('game_plan')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: '#4A4AFF', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: Object.keys(lineup).length > 0 ? 1 : 0.4,
          }}
          disabled={Object.keys(lineup).length === 0}
        >
          Game Plan <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  // ─── Game Plan Step ────────────────────────────
  if (step === 'game_plan') {
    const textareaStyle: React.CSSProperties = {
      width: '100%', padding: '12px 14px', borderRadius: 10,
      border: '1px solid #E8EAED', background: '#fff',
      fontSize: 14, fontFamily: 'Inter, sans-serif',
      resize: 'vertical', minHeight: 70,
      boxSizing: 'border-box',
    }

    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StepHeader step={4} total={4} title="Game Plan" subtitle={`${selectedFormation?.label} · vs ${session.opponent || 'TBD'}`} onBack={goBack} />

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>
            Playing Style
          </label>
          <textarea
            value={playingStyle}
            onChange={e => setPlayingStyle(e.target.value)}
            placeholder="e.g. High press, play out from the back, quick transitions..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>
            Set Pieces
          </label>
          <textarea
            value={setPieces}
            onChange={e => setSetPieces(e.target.value)}
            placeholder="e.g. Corners: near post run from #7, free kicks: direct..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>
            Tactical Notes
          </label>
          <textarea
            value={tacticalNotes}
            onChange={e => setTacticalNotes(e.target.value)}
            placeholder="e.g. Their #10 is dangerous on the left, double up with RB..."
            style={textareaStyle}
          />
        </div>

        <button
          onClick={() => setStep('review')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14, marginTop: 8,
            background: '#4A4AFF', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Review Plan <ChevronRight size={18} />
        </button>
      </div>
    )
  }

  // ─── Review Step ───────────────────────────────
  if (step === 'review') {
    const positions = selectedFormation?.positions || []
    const assignedCount = Object.keys(lineup).length

    return (
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StepHeader step={4} total={4} title="Review" subtitle={`vs ${session.opponent || 'TBD'} · ${dateStr}`} onBack={goBack} />

        {/* Formation summary card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Formation</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1B1650' }}>{selectedFormation?.label} · {squadSize}-a-side</span>
          </div>

          {/* Mini pitch with assigned players */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 2',
            background: '#2E7D32',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: '4%', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: '4%', right: '4%', top: '50%', height: 1, background: 'rgba(255,255,255,0.3)' }} />

            {positions.map((pos, idx) => {
              const player = lineup[idx] ? players.find(p => p.id === lineup[idx]) : null
              return (
                <div key={idx} style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${100 - pos.y}%`,
                  transform: 'translate(-50%,-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: player ? '#fff' : 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: player ? '#1B1650' : '#fff' }}>
                      {player ? player.jerseyNumber : pos.role}
                    </span>
                  </div>
                  <span style={{ fontSize: 7, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {player ? player.firstName : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: '#64748B' }}>
            {assignedCount} of {positions.length} positions filled
          </div>
        </div>

        {/* Game plan summary */}
        {(playingStyle || setPieces || tacticalNotes) && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Game Plan</span>
            {playingStyle && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Playing Style</div>
                <div style={{ fontSize: 13, color: '#0F172A', marginTop: 2 }}>{playingStyle}</div>
              </div>
            )}
            {setPieces && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Set Pieces</div>
                <div style={{ fontSize: 13, color: '#0F172A', marginTop: 2 }}>{setPieces}</div>
              </div>
            )}
            {tacticalNotes && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Tactical Notes</div>
                <div style={{ fontSize: 13, color: '#0F172A', marginTop: 2 }}>{tacticalNotes}</div>
              </div>
            )}
          </div>
        )}

        {/* Session details */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Match Details</span>
          <div style={{ marginTop: 8, fontSize: 13, color: '#0F172A', lineHeight: 1.8 }}>
            <div><strong>Opponent:</strong> {session.opponent || 'TBD'}</div>
            <div><strong>Date:</strong> {dateStr} · {session.startTime}</div>
            <div><strong>Team:</strong> {roster?.name || '—'}</div>
            {session.competition && <div><strong>Competition:</strong> {session.competition}</div>}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 14,
            background: '#10B981', color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
          }}
        >
          <Check size={20} /> Save Match Plan
        </button>
      </div>
    )
  }

  return null
}

// ─── Shared step header ──────────────────────────
function StepHeader({ step, total, title, subtitle, onBack }: { step: number; total: number; title: string; subtitle: string; onBack: () => void }) {
  return (
    <>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontSize: 14, color: '#64748B', fontWeight: 500, marginBottom: 4 }}>
        <ChevronLeft size={18} /> Back
      </button>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Step {step} of {total}
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '4px 0 0' }}>{title}</h1>
      <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>{subtitle}</p>
    </>
  )
}

// ─── Sort players: best-fit positions first ──────
function sortPlayersByFit(players: Player[], targetPosition: FormationPosition | null): Player[] {
  if (!targetPosition) return players
  return [...players].sort((a, b) => {
    const aFit = a.position.includes(targetPosition.role) ? 1 : 0
    const bFit = b.position.includes(targetPosition.role) ? 1 : 0
    return bFit - aFit
  })
}
