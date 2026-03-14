'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react'
import type { DrillInfo } from '@/lib/types'

const categoryColors: Record<string, string> = {
  Passing: '#4A4AFF',
  Dribbling: '#8B5CF6',
  Tactical: '#EC4899',
  Shooting: '#EF4444',
  Goalkeeping: '#F59E0B',
  Technical: '#10B981',
}

function getDifficultyColor(diff: string) {
  if (diff === 'Easy') return '#10B981'
  if (diff === 'Medium') return '#F59E0B'
  return '#EF4444'
}

export default function DrillCard({ drill, index }: { drill: DrillInfo; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const catColor = categoryColors[drill.category] || '#64748B'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Number */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: `${catColor}15`, color: catColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{drill.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: catColor,
              background: `${catColor}15`, padding: '2px 8px', borderRadius: 10,
            }}>
              {drill.category}
            </span>
            <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={11} /> {drill.duration}
            </span>
            <span style={{ fontSize: 11, color: getDifficultyColor(drill.difficulty), display: 'flex', alignItems: 'center', gap: 3 }}>
              <Zap size={11} /> {drill.difficulty}
            </span>
          </div>
        </div>

        {expanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '12px 0' }}>
            {drill.description}
          </p>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
            Coaching Points
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {drill.coachingPoints.map((point, i) => (
              <li key={i} style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>{point}</li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {drill.targetSkills.map(skill => (
              <span key={skill} style={{
                fontSize: 10, fontWeight: 600, color: '#64748B',
                background: '#F1F5F9', padding: '3px 8px', borderRadius: 8,
                textTransform: 'capitalize',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
