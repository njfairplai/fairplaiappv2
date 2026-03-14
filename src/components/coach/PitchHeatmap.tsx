'use client'

import type { PlayerHeatmapData } from '@/lib/types'

interface PitchHeatmapProps {
  data: PlayerHeatmapData
  width?: number
  showLegend?: boolean
}

export default function PitchHeatmap({ data, showLegend = false }: PitchHeatmapProps) {
  return (
    <div>
      {/* Pitch container */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 2',
        background: '#2E7D32',
        borderRadius: 10,
        overflow: 'hidden',
        border: '2px solid #1B5E20',
      }}>
        {/* Pitch markings */}
        {/* Outline */}
        <div style={{
          position: 'absolute', inset: '4%',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 2,
        }} />

        {/* Center line */}
        <div style={{
          position: 'absolute', top: '4%', bottom: '4%', left: '50%',
          width: 2, background: 'rgba(255,255,255,0.5)',
          transform: 'translateX(-50%)',
        }} />

        {/* Center circle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '18%', height: '27%',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Center dot */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Left penalty area */}
        <div style={{
          position: 'absolute', top: '22%', left: '4%',
          width: '16%', height: '56%',
          border: '2px solid rgba(255,255,255,0.4)',
          borderLeft: 'none', borderRadius: '0 2px 2px 0',
        }} />

        {/* Left goal area */}
        <div style={{
          position: 'absolute', top: '35%', left: '4%',
          width: '8%', height: '30%',
          border: '2px solid rgba(255,255,255,0.4)',
          borderLeft: 'none', borderRadius: '0 2px 2px 0',
        }} />

        {/* Right penalty area */}
        <div style={{
          position: 'absolute', top: '22%', right: '4%',
          width: '16%', height: '56%',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRight: 'none', borderRadius: '2px 0 0 2px',
        }} />

        {/* Right goal area */}
        <div style={{
          position: 'absolute', top: '35%', right: '4%',
          width: '8%', height: '30%',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRight: 'none', borderRadius: '2px 0 0 2px',
        }} />

        {/* Heat points */}
        {data.points.map((point, idx) => {
          const size = 30 + point.intensity * 40
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(255,69,0,${point.intensity * 0.7}) 0%, rgba(255,165,0,${point.intensity * 0.4}) 40%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                mixBlendMode: 'screen',
              }}
            />
          )
        })}

        {/* Average position marker */}
        <div style={{
          position: 'absolute',
          left: `${data.averagePosition.x}%`,
          top: `${data.averagePosition.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}>
          {/* Outer pulse ring */}
          <div style={{
            position: 'absolute', inset: -6,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.6)',
            animation: 'avgPosPulse 2s ease-in-out infinite',
          }} />
          {/* Inner dot */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#fff',
            border: '2px solid rgba(0,0,0,0.3)',
            boxShadow: '0 0 6px rgba(0,0,0,0.3)',
          }} />
        </div>

        {/* Position label */}
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          background: 'rgba(0,0,0,0.6)', borderRadius: 6,
          padding: '3px 8px',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{data.positionLabel}</span>
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes avgPosPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Legend */}
      {showLegend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 11, color: '#6B7280' }}>Low</span>
          <div style={{
            flex: 1, height: 8, borderRadius: 4,
            background: 'linear-gradient(90deg, transparent, #FCD34D, #F97316, #EF4444)',
          }} />
          <span style={{ fontSize: 11, color: '#6B7280' }}>High</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '2px solid #999' }} />
            <span style={{ fontSize: 11, color: '#6B7280' }}>Avg Pos</span>
          </div>
        </div>
      )}
    </div>
  )
}
