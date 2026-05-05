'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, GitCompareArrows } from 'lucide-react'
import { players, rosters, matchAnalyses } from '@/lib/mockData'
import { PlayerPickerPopover } from '@/components/coach/compare/PlayerPickerPopover'
import { getPlayerProgression, getLatestFrame } from '@/lib/player-progression'
import { getSeasonScore, scoreColor } from '@/lib/squad-season-score'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PlayerGlyph } from '@/components/coach/player-profile/PlayerGlyph'
import { LatestHero } from '@/components/coach/player-profile/LatestHero'
import { PlayheadDetail } from '@/components/coach/player-profile/PlayheadDetail'
import { Filmstrip } from '@/components/coach/player-profile/Filmstrip'
import { SeasonNumbers } from '@/components/coach/player-profile/SeasonNumbers'
import { RadarSection } from '@/components/coach/player-profile/RadarSection'
import { HeatmapSection } from '@/components/coach/player-profile/HeatmapSection'
import { HighlightsSection } from '@/components/coach/player-profile/HighlightsSection'
import { IdpPostscript } from '@/components/coach/player-profile/IdpPostscript'
import { ShareCardModal } from '@/components/coach/player-profile/ShareCardModal'
import { CardThumbButton } from '@/components/coach/player-profile/BibCard'

/**
 * Coach Player Profile — Slice 6.1.1, Direction C v2 (the Filmstrip Season).
 *
 * One scrollable page, no sub-tabs. Sections, in order:
 *
 *   1. Identity strip    — photo, jersey, position, season + latest scores, Make a card CTA
 *   2. Latest match hero — score arc, key stats inline, coach note (always the lead)
 *   3. Playhead detail   — same shape, populated from a non-latest scrubbed match
 *   4. Filmstrip         — 7-frame paged window with chevrons + mini-map dots
 *   5. Season numbers    — Matches / Goals / Key passes / MOTMs + trend marker
 *   6. Performance radar — 6-axis, non-interactive (drill returns when AI delivers real sub-fields)
 *   7. IDP postscript    — simplified GOALS list, no per-goal status, Open IDP CTA
 *
 * The "session vs season" scope is implied by which frame the playhead points at —
 * tap a frame to scrub, the latest hero collapses into the playhead detail.
 */
export default function CoachWebPlayerPage() {
  const router = useRouter()
  const { playerId } = useParams<{ playerId: string }>()
  const isMobile = useIsMobile()
  const [shareOpen, setShareOpen] = useState(false)
  const [comparePickerOpen, setComparePickerOpen] = useState(false)

  const player = players.find(p => p.id === playerId)

  const progression = useMemo(
    () => (player ? getPlayerProgression(player.id) : []),
    [player],
  )
  const latest = useMemo(() => getLatestFrame(progression), [progression])

  const [currentMd, setCurrentMd] = useState<number | null>(null)
  const effectiveMd = currentMd ?? latest?.md ?? null

  if (!player) {
    return (
      <div style={{ padding: 48, fontFamily: 'var(--font-body)', color: 'var(--brand-indigo)' }}>
        Player not found.
      </div>
    )
  }

  const seasonScore = getSeasonScore(player.id)
  const currentFrame =
    progression.find(f => f.md === effectiveMd) ?? latest ?? null
  const isCurrentLatest = currentFrame?.md === latest?.md

  const seasonAnalyses = matchAnalyses.filter(a => a.playerId === player.id)

  // Resolve a roster name from the player's academy + the rosters table.
  const playerRoster = rosters.find(r => r.academyId === player.academyId)

  return (
    <div
      style={{
        background: 'var(--brand-sand)',
        color: 'var(--brand-indigo)',
        fontFamily: 'var(--font-body)',
        minHeight: 'calc(100vh - 108px)',
      }}
    >
      {/* 1. Identity strip */}
      <section
        style={{
          padding: isMobile ? '16px 16px' : '20px 36px',
          background: 'var(--brand-sand)',
          borderBottom: '1px solid var(--brand-line)',
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'auto 1fr auto auto'
            : 'auto minmax(0, 1fr) auto auto auto auto',
          gap: isMobile ? 12 : 24,
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/coach/web/squad')}
          aria-label="Back to squad"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--brand-paper)',
            border: '1px solid var(--brand-line)',
            color: 'var(--brand-indigo)',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 10 : 18,
            minWidth: 0,
          }}
        >
          <PlayerGlyph
            size={isMobile ? 56 : 72}
            jerseyNumber={player.jerseyNumber}
            name={`${player.firstName} ${player.lastName}`}
            motm={!!latest?.motm}
          />
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: isMobile ? 9 : 10.5,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              {player.position.join(' · ')} · #{player.jerseyNumber}
            </span>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? 24 : 38,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--brand-indigo)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {player.firstName} {player.lastName}
            </div>
            {!isMobile && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12.5,
                  color: 'var(--brand-indigo-mute)',
                  marginTop: 4,
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span>{computeAge(player.dateOfBirth)} yrs</span>
                <span>·</span>
                <span>{player.dominantFoot}-foot</span>
                <span>·</span>
                <span>{player.status}</span>
                {playerRoster && (
                  <>
                    <span>·</span>
                    <span>{playerRoster.name}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {!isMobile && (
          <div
            style={{
              textAlign: 'center',
              borderLeft: '1px solid var(--brand-line)',
              padding: '0 22px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              SEASON
            </span>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 38,
                color: scoreColor(seasonScore.avg || 0),
                letterSpacing: '-0.02em',
                marginTop: 3,
              }}
            >
              {seasonScore.avg || '—'}
            </div>
          </div>
        )}
        {!isMobile && latest && (
          <div
            style={{
              textAlign: 'center',
              borderLeft: '1px solid var(--brand-line)',
              padding: '0 22px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                letterSpacing: '0.22em',
                color: 'var(--brand-indigo-mute)',
                fontWeight: 700,
              }}
            >
              LATEST
            </span>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 38,
                color: latest.motm ? 'var(--brand-yellow)' : scoreColor(latest.score),
                letterSpacing: '-0.02em',
                marginTop: 3,
                WebkitTextStroke: latest.motm ? '1.5px var(--brand-indigo)' : 'none',
              }}
            >
              {latest.score}
            </div>
            {latest.motm && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                  color: 'var(--brand-indigo)',
                  marginTop: 2,
                }}
              >
                ★ MOTM
              </div>
            )}
          </div>
        )}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <button
            type="button"
            onClick={() => setComparePickerOpen(o => !o)}
            aria-label="Compare with another player"
            style={{
              background: 'transparent',
              color: 'var(--brand-indigo)',
              border: '1px solid var(--brand-line)',
              padding: isMobile ? '8px 10px' : '10px 14px',
              borderRadius: 8,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: isMobile ? 12 : 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <GitCompareArrows size={isMobile ? 13 : 14} />
            {isMobile ? '' : 'Compare with…'}
          </button>
          <PlayerPickerPopover
            pool={players}
            excluded={[player.id]}
            open={comparePickerOpen}
            onClose={() => setComparePickerOpen(false)}
            onPick={otherId =>
              router.push(`/coach/web/compare?players=${player.id},${otherId}`)
            }
            align="right"
          />
        </div>
        <CardThumbButton
          player={player}
          seasonScore={seasonScore.avg || 0}
          onClick={() => setShareOpen(true)}
        />
      </section>

      {/* 2/3. Latest hero or scrubbed playhead detail */}
      {currentFrame &&
        (isCurrentLatest && latest ? (
          <LatestHero player={player} latest={latest} />
        ) : (
          <PlayheadDetail frame={currentFrame} playerId={player.id} />
        ))}

      {/* 4. Filmstrip */}
      {progression.length > 0 && (
        <div style={{ padding: isMobile ? '20px 12px' : '24px 36px' }}>
          <Filmstrip
            data={progression}
            currentMd={effectiveMd ?? progression[0].md}
            onSelect={setCurrentMd}
            frameW={isMobile ? 116 : 138}
            frameH={isMobile ? 152 : 172}
            dark
          />
        </div>
      )}

      {/* 5. Season numbers strip */}
      {progression.length > 0 && <SeasonNumbers data={progression} />}

      {/* 6. Highlights — moved right after filmstrip+numbers so the season
          story flows: matches → numbers → moments. */}
      <HighlightsSection
        player={player}
        currentSessionId={currentFrame?.sessionId}
        isMobile={isMobile}
      />

      {/* 7. Radar — interactive 6 categories with click-to-drill sub-stats */}
      <RadarSection
        player={player}
        records={seasonAnalyses}
        currentSessionId={currentFrame?.sessionId}
        isMobile={isMobile}
      />

      {/* 8. Heatmap — horizontal pitch with heat overlay */}
      <HeatmapSection
        player={player}
        currentSessionId={currentFrame?.sessionId}
        isTraining={currentFrame?.kind === 'training'}
        isMobile={isMobile}
      />

      {/* 9. IDP postscript */}
      <IdpPostscript player={player} />

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        player={player}
        latest={latest}
        seasonScore={seasonScore.avg || 0}
        records={seasonAnalyses}
        progression={progression}
        rosterName={playerRoster?.name}
      />
    </div>
  )
}

/** Compute age from ISO date-of-birth string. */
function computeAge(dob: string): number {
  const now = new Date()
  const birth = new Date(dob)
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}
