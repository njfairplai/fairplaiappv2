'use client'

import type { CategoryGrade as CategoryGradeType } from '@/lib/types'
import { SHADOWS, COLORS } from '@/lib/constants'

export default function CategoryGrade({ item }: { item: CategoryGradeType }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: SHADOWS.card }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: '0 0 4px' }}>{item.category}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: item.gradeColor, lineHeight: 1 }}>{item.grade}</span>
        <span style={{ fontSize: 11, color: '#9DA2B3', fontWeight: 600 }}>{item.score}/100</span>
      </div>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: '2px 0 8px' }}>{item.label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {item.subMetrics.map((m) => (
          <span key={m} style={{ background: '#F5F6FC', color: COLORS.muted, fontSize: 11, borderRadius: 8, padding: '3px 8px', fontWeight: 500 }}>{m}</span>
        ))}
      </div>
    </div>
  )
}
