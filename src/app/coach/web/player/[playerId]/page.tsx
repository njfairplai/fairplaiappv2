'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { players, rosters, matchAnalyses } from '@/lib/mockData'
import { ScopeToggle, type ProfileScope } from '@/components/coach/player-profile/ScopeToggle'
import { getPlayerProgression, getLatestFrame } from '@/lib/player-progression'
import { getSeasonScore } from '@/lib/squad-season-score'
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
import { WorkloadSection } from '@/components/coach/player-profile/WorkloadSection'
import { ShareCardModal } from '@/components/coach/player-profile/ShareCardModal'
import { CardThumbButton } from '@/components/coach/player-profile/BibCard'
import { cn } from '@/lib/cn'

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
  const [scope, setScope] = useState<ProfileScope>('match')

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
      <div className="p-12 font-satoshi text-brand-indigo">
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
      className="bg-brand-sand text-brand-indigo font-satoshi"
      style={{ minHeight: 'calc(100vh - 108px)' }}
    >
      {/* 1. Identity strip — back / glyph / name. SEASON + LATEST score cells
          and the Compare-with-player button were removed: scores live in the
          mode-specific hero now (match or season), and Compare-with moved
          into the radar section's header where comparison logically lives. */}
      <section
        className={cn(
          'bg-brand-sand border-b border-brand-line grid items-center',
          isMobile ? 'px-4 py-4 gap-3' : 'px-9 py-5 gap-6',
        )}
        style={{
          gridTemplateColumns: isMobile
            ? 'auto 1fr auto'
            : 'auto minmax(0, 1fr) auto',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/coach/web/squad')}
          aria-label="Back to squad"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-paper border border-brand-line text-brand-indigo cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          className={cn(
            'flex items-center min-w-0',
            isMobile ? 'gap-2.5' : 'gap-[18px]',
          )}
        >
          <PlayerGlyph
            size={isMobile ? 56 : 72}
            jerseyNumber={player.jerseyNumber}
            name={`${player.firstName} ${player.lastName}`}
            motm={!!latest?.motm}
          />
          <div className="min-w-0">
            <span
              className={cn(
                'font-fragment tracking-[0.22em] text-brand-indigo-mute font-bold',
                isMobile ? 'text-[9px]' : 'text-[10.5px]',
              )}
            >
              {player.position.join(' · ')} · #{player.jerseyNumber}
            </span>
            <div
              className={cn(
                'font-clash tracking-[-0.02em] text-brand-indigo mt-0.5 overflow-hidden text-ellipsis break-words',
                isMobile ? 'text-[20px] whitespace-normal' : 'text-[38px] whitespace-nowrap',
              )}
              style={{ lineHeight: 1.1 }}
            >
              {player.firstName} {player.lastName}
            </div>
            {!isMobile && (
              <div className="font-satoshi text-[12.5px] text-brand-indigo-mute mt-1 flex gap-2.5 flex-wrap">
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
        <CardThumbButton
          player={player}
          seasonScore={seasonScore.avg || 0}
          onClick={() => setShareOpen(true)}
          size={isMobile ? 'sm' : 'md'}
        />
      </section>

      {/* 2. Scope toggle — match (default) vs season. Drives every section
          below so the page commits to one story at a time. */}
      <ScopeToggle
        scope={scope}
        onChange={setScope}
        matchLabel={
          currentFrame
            ? `vs ${currentFrame.opp} . ${currentFrame.shortDate}`
            : ''
        }
        isMobile={isMobile}
      />

      {scope === 'match' ? (
        <>
          {/* Match hero (latest or scrubbed playhead) — match score arc + key stats inline */}
          {currentFrame &&
            (isCurrentLatest && latest ? (
              <LatestHero player={player} latest={latest} isMobile={isMobile} />
            ) : (
              <PlayheadDetail frame={currentFrame} player={player} isMobile={isMobile} />
            ))}

          {/* Filmstrip — only visible in match mode (it's the match navigator) */}
          {progression.length > 0 && (
            <div className={cn(isMobile ? 'px-3 py-5' : 'px-9 py-6')}>
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

          {/* Highlights filtered to the playhead match */}
          <HighlightsSection
            player={player}
            currentSessionId={currentFrame?.sessionId}
            scope="match"
            isMobile={isMobile}
          />

          {/* Radar with both polygons (match solid, season dotted) */}
          <RadarSection
            player={player}
            records={seasonAnalyses}
            currentSessionId={currentFrame?.sessionId}
            scope="match"
            isMobile={isMobile}
          />

          {/* Heatmap of this match — supports the radar story below it */}
          <HeatmapSection
            player={player}
            currentSessionId={currentFrame?.sessionId}
            isTraining={currentFrame?.kind === 'training'}
            scope="match"
            isMobile={isMobile}
          />
        </>
      ) : (
        <>
          {/* Season hero — composite + Matches/Goals/Key passes/MOTMs/Minutes/Trend */}
          {progression.length > 0 && (
            <SeasonNumbers
              data={progression}
              hero
              seasonScore={seasonScore.avg || 0}
              isMobile={isMobile}
            />
          )}

          {/* Highlights — season reel only, no clip grid */}
          <HighlightsSection
            player={player}
            currentSessionId={undefined}
            scope="season"
            isMobile={isMobile}
          />

          {/* Radar — season polygon only, no overlay */}
          <RadarSection
            player={player}
            records={seasonAnalyses}
            currentSessionId={null}
            scope="season"
            isMobile={isMobile}
          />

          {/* Heatmap — season aggregate */}
          <HeatmapSection
            player={player}
            currentSessionId={undefined}
            isTraining={false}
            scope="season"
            isMobile={isMobile}
          />
        </>
      )}

      {/* Workload + gear — match-agnostic, sits between scope content and IDP */}
      <WorkloadSection
        playerId={player.id}
        playerName={`${player.firstName} ${player.lastName}`}
        isMobile={isMobile}
      />

      {/* IDP — match-agnostic, lives in both modes */}
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
