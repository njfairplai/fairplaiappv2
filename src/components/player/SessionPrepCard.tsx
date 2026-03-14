'use client'

import type { Session, SessionPrep } from '@/lib/types'
import { drillLibrary } from '@/lib/mockData'
import FormationPreview from './FormationPreview'
import DrillCard from './DrillCard'
import { playerTokens } from '@/styles/player-tokens'
import { MapPin, Clock, Calendar } from 'lucide-react'

interface SessionPrepCardProps {
  session: Session
  prep: SessionPrep | null
  playerId: string
  compact?: boolean
  onTap?: () => void
  dark?: boolean
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatSessionDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`
}

export default function SessionPrepCard({ session, prep, playerId, compact, onTap, dark }: SessionPrepCardProps) {
  const isMatch = session.type === 'match' || session.type === 'training_match'
  const hasPrepData = prep && (prep.formationId || prep.drillIds.length > 0)

  if (compact) {
    return (
      <button
        onClick={onTap}
        style={{
          width: '100%',
          background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
          borderRadius: 16,
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
          padding: 0,
          cursor: onTap ? 'pointer' : 'default',
          textAlign: 'left',
          overflow: 'hidden',
        }}
      >
        {/* Type badge */}
        <div style={{
          background: isMatch ? playerTokens.gradient : `${playerTokens.primary}12`,
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                color: isMatch ? 'rgba(255,255,255,0.7)' : playerTokens.primary,
                marginBottom: 4,
              }}>
                {isMatch ? 'Next Match' : 'Next Training'}
              </div>
              <div style={{
                fontSize: isMatch ? 20 : 16,
                fontWeight: 800,
                color: isMatch ? '#fff' : '#0F172A',
              }}>
                {isMatch ? `vs ${session.opponent || 'TBD'}` : 'Training Session'}
              </div>
            </div>
            {hasPrepData && (
              <div style={{
                background: isMatch ? 'rgba(255,255,255,0.2)' : `${playerTokens.primary}20`,
                borderRadius: 8, padding: '4px 10px',
                fontSize: 11, fontWeight: 700,
                color: isMatch ? '#fff' : playerTokens.primary,
              }}>
                {isMatch ? 'Game plan ready' : `${prep!.drillIds.length} drills`}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex', gap: 12, marginTop: 8,
            fontSize: 12, fontWeight: 500,
            color: isMatch ? 'rgba(255,255,255,0.8)' : '#64748B',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {formatSessionDate(session.date)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {session.startTime}
            </span>
          </div>
        </div>

        {/* Mini formation preview for matches */}
        {isMatch && prep?.formationId && (
          <div style={{ padding: '12px 16px' }}>
            <FormationPreview
              formationId={prep.formationId}
              lineup={prep.lineup}
              highlightPlayerId={playerId}
              compact
            />
          </div>
        )}

        {/* Drill preview for training */}
        {!isMatch && prep && prep.drillIds.length > 0 && (
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {prep.drillIds.map(id => {
                const drill = drillLibrary.find(d => d.id === id)
                if (!drill) return null
                return (
                  <span key={id} style={{
                    fontSize: 11, fontWeight: 600, color: dark ? '#CBD5E1' : '#475569',
                    background: dark ? 'rgba(255,255,255,0.08)' : '#F1F5F9', padding: '4px 10px', borderRadius: 8,
                  }}>
                    {drill.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {hasPrepData && (
          <div style={{
            padding: '10px 16px',
            borderTop: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F1F5F9',
            fontSize: 12, fontWeight: 600,
            color: playerTokens.primary,
            textAlign: 'center',
          }}>
            Tap to see {isMatch ? 'your game plan' : "what's planned"} →
          </div>
        )}
      </button>
    )
  }

  // Full view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{
        background: isMatch ? playerTokens.gradient : `${playerTokens.primary}12`,
        borderRadius: 14, padding: '18px 16px',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
          color: isMatch ? 'rgba(255,255,255,0.7)' : playerTokens.primary,
          marginBottom: 4,
        }}>
          {isMatch ? session.competition || 'Match' : 'Training Session'}
        </div>
        <div style={{
          fontSize: 22, fontWeight: 800,
          color: isMatch ? '#fff' : '#0F172A',
        }}>
          {isMatch ? `vs ${session.opponent || 'TBD'}` : 'Training Day'}
        </div>
        <div style={{
          display: 'flex', gap: 16, marginTop: 8,
          fontSize: 13, color: isMatch ? 'rgba(255,255,255,0.8)' : '#64748B',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={13} /> {formatSessionDate(session.date)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} /> {session.startTime}
          </span>
        </div>
      </div>

      {/* Formation for matches */}
      {isMatch && prep?.formationId && (
        <FormationPreview
          formationId={prep.formationId}
          lineup={prep.lineup}
          highlightPlayerId={playerId}
        />
      )}

      {/* Game Plan for matches */}
      {isMatch && prep?.playingStyle && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Playing Style</div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{prep.playingStyle}</p>
          </div>
          {prep.setPieces && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Set Pieces</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{prep.setPieces}</p>
            </div>
          )}
          {prep.tacticalNotes && (
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Tactical Notes</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{prep.tacticalNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Drills for training */}
      {!isMatch && prep && prep.drillIds.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Today&apos;s Plan</div>
          {prep.drillIds.map((id, i) => {
            const drill = drillLibrary.find(d => d.id === id)
            if (!drill) return null
            return <DrillCard key={id} drill={drill} index={i} />
          })}
        </div>
      )}

      {/* Tactical notes for training */}
      {!isMatch && prep?.tacticalNotes && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Coach&apos;s Notes</div>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>{prep.tacticalNotes}</p>
        </div>
      )}

      {/* What to bring */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>What to Bring</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['\u26BD Boots', '\uD83E\uDD3E Shin pads', '\uD83D\uDCA7 Water', '\u23F0 Arrive by ' + session.startTime].map(item => (
            <span key={item} style={{
              fontSize: 12, fontWeight: 500, color: '#475569',
              background: '#F8FAFC', padding: '6px 10px', borderRadius: 8,
              border: '1px solid #E2E8F0',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
