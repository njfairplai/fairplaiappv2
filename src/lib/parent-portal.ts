import { players, parents, sessions, matchAnalyses, highlights, attendanceData } from '@/lib/mockData'
import type { Player, Session, MatchAnalysis, Highlight } from '@/lib/types'

/**
 * Helpers for the shared parent + player portal. Both audiences look at the
 * same kid through different lenses; these helpers resolve the active kid
 * (multi-kid families notwithstanding) + the data they need.
 *
 * Multi-kid override: in mockData every parent has a single child. To
 * exercise the multi-kid switcher pattern, parent_001 here is treated as
 * having both player_001 (Kiyan) and player_009 (Zain) as their kids.
 */

const MULTI_KID_OVERRIDE: Record<string, string[]> = {
  parent_001: ['player_001', 'player_009'],
}

export type PortalRole = 'parent' | 'player'

/** All kids the given parent can switch between. */
export function getKidsForParent(parentId: string): Player[] {
  const override = MULTI_KID_OVERRIDE[parentId]
  if (override) {
    return players.filter(p => override.includes(p.id))
  }
  const parent = parents.find(p => p.id === parentId)
  if (!parent) return []
  return players.filter(p => parent.playerIds.includes(p.id))
}

/** The kid currently in focus — first in the list by default; switcher
 *  will mutate this through React state, not by changing mock. */
export function getDefaultKid(parentId: string): Player | null {
  const kids = getKidsForParent(parentId)
  return kids[0] ?? null
}

/** Used in player-role: derive the active player from a localStorage key
 *  (in real app would come from auth). Falls back to player_001. */
export function getPlayerSelf(playerId?: string | null): Player | null {
  if (!playerId) return players[0] ?? null
  return players.find(p => p.id === playerId) ?? null
}

/** Match list for a single kid: every analysed past match + upcoming
 *  scheduled match, chronological. Drills (type === 'drill') are excluded
 *  — parents/players don't track drill sessions. Cancelled excluded. */
export function getMatchListForKid(playerId: string): Session[] {
  return sessions
    .filter(
      s =>
        (s.type === 'match' || s.type === 'training_match') &&
        s.status !== 'cancelled' &&
        s.participatingPlayerIds.includes(playerId),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Most-recent analysed match for the kid — drives Home hero default. */
export function getLatestAnalysedMatch(playerId: string): Session | null {
  const list = getMatchListForKid(playerId)
  for (let i = list.length - 1; i >= 0; i--) {
    const s = list[i]
    if (s.status === 'analysed' || s.status === 'playback_ready') return s
  }
  return null
}

/** Next upcoming session (any kind: match, training match, drill). Used
 *  in Home's footer "what's next" card and in the Stats forward-looking
 *  match list. */
export function getNextUpcomingSession(playerId: string): Session | null {
  const today = new Date().toISOString().slice(0, 10)
  return (
    sessions
      .filter(
        s =>
          s.participatingPlayerIds.includes(playerId) &&
          s.date >= today &&
          s.status === 'scheduled',
      )
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  )
}

/** Single best clip for a kid's most recent analysed match — drives the
 *  Home hero clip half. Picks goals first, then key passes, then anything. */
export function getBestClipFromMatch(
  playerId: string,
  sessionId: string,
): Highlight | null {
  const clips = highlights.filter(
    h => h.playerId === playerId && h.sessionId === sessionId,
  )
  if (clips.length === 0) return null
  const goal = clips.find(c => c.eventType === 'goal')
  if (goal) return goal
  const keyPass = clips.find(c => c.eventType === 'key_pass')
  if (keyPass) return keyPass
  return clips[0]
}

/** Notification types backed by data we actually have today. MOTM was
 *  dropped — there's no MOTM tagging system yet. Triggers we can derive:
 *  new clips, coach notes (localStorage), IDP updates (localStorage),
 *  attendance milestones, scheduled sessions. */
export type NotificationKind =
  | 'clips'
  | 'coach_note'
  | 'idp_update'
  | 'attendance_milestone'
  | 'session_scheduled'

export interface PortalNotification {
  id: string
  kind: NotificationKind
  title: string
  body?: string
  /** ISO date — used for sort + display. */
  date: string
  shortDate: string
  /** Where tapping the notification should navigate to. */
  href: string
  /** Whether the user has read this. Stored in localStorage; defaults to false. */
  read?: boolean
}

const ATTENDANCE_MILESTONES = [10, 20, 30, 50]

/** Hand-authored demo notifications per player. Without these the feed
 *  is sparse (real data only emits clips + scheduled-session triggers).
 *  When the backend ships this dies; for now it gives every event-kind
 *  a rendered example in Lately + the notification centre. */
const DEMO_NOTIFICATIONS: Record<string, PortalNotification[]> = {
  player_001: [
    {
      id: 'demo_note_p1_a',
      kind: 'coach_note',
      title: 'New note from Coach Sara',
      body: 'Loved the late run on the right. Keep finding that pocket — you have the legs for it.',
      date: '2026-04-28',
      shortDate: 'Tue Apr 28',
      href: '/parent/stats',
    },
    {
      id: 'demo_idp_p1',
      kind: 'idp_update',
      title: 'Progress plan refreshed',
      body: 'Coach Sara updated the focus areas — first touch under pressure and decision-making in the final third.',
      date: '2026-04-25',
      shortDate: 'Sat Apr 25',
      href: '/parent/development',
    },
    {
      id: 'demo_milestone_p1',
      kind: 'attendance_milestone',
      title: '30 sessions attended',
      body: 'A consistent run — keep it up.',
      date: '2026-04-22',
      shortDate: 'Wed Apr 22',
      href: '/parent/development',
    },
    {
      id: 'demo_clips_p1_old',
      kind: 'clips',
      title: '4 new clips',
      body: 'vs Sharjah FC',
      date: '2026-01-24',
      shortDate: 'Sat Jan 24',
      href: '/parent/highlights',
    },
    {
      id: 'demo_milestone_p1_b',
      kind: 'attendance_milestone',
      title: '20 sessions attended',
      body: 'Reliable as ever.',
      date: '2026-03-12',
      shortDate: 'Thu Mar 12',
      href: '/parent/development',
    },
  ],
  player_009: [
    {
      id: 'demo_note_p9',
      kind: 'coach_note',
      title: 'New note from Coach Sara',
      body: 'Strong shift defensively. Be louder on the line — you see it before the back four.',
      date: '2026-04-26',
      shortDate: 'Sun Apr 26',
      href: '/parent/stats',
    },
    {
      id: 'demo_idp_p9',
      kind: 'idp_update',
      title: 'Progress plan refreshed',
      body: 'Aerial duels + recovery sprints highlighted as growth areas.',
      date: '2026-04-20',
      shortDate: 'Mon Apr 20',
      href: '/parent/development',
    },
    {
      id: 'demo_milestone_p9',
      kind: 'attendance_milestone',
      title: '20 sessions attended',
      body: 'Good rhythm — half the season in.',
      date: '2026-04-08',
      shortDate: 'Wed Apr 08',
      href: '/parent/development',
    },
  ],
}

/** Build the notification list for a kid. Combines:
 *   - clips: highlights flagged in the last ~30 days (sessions with clips)
 *   - coach_note: notes added (read from localStorage at runtime — see
 *     `getNotificationsForKid` browser flow). For SSR fallback we don't
 *     surface notes (returns empty for SSR).
 *   - idp_update: IDP draft updated (localStorage)
 *   - attendance_milestone: hit a round-number streak
 *   - session_scheduled: any session in the next 7 days
 *
 *  Sorted newest first. The Home "Lately" preview takes the top 3-5; the
 *  full notification center route shows everything.
 */
export function getNotificationsForKid(playerId: string): PortalNotification[] {
  const out: PortalNotification[] = [...(DEMO_NOTIFICATIONS[playerId] ?? [])]

  // Clip-drop notifications — group by session, one notification per
  // session that has clips for this kid. Only sessions analysed in the
  // last 30 days surface (else feed gets noisy on long-tail history).
  const matches = getMatchListForKid(playerId).filter(
    s => s.status === 'analysed' || s.status === 'playback_ready',
  )
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  for (const s of matches) {
    if (s.date < cutoffIso) continue
    const matchClips = highlights.filter(
      h => h.sessionId === s.id && h.playerId === playerId,
    )
    if (matchClips.length === 0) continue
    out.push({
      id: `clips_${s.id}`,
      kind: 'clips',
      title: `${matchClips.length} new clip${matchClips.length === 1 ? '' : 's'}`,
      body:
        s.type === 'training_match'
          ? 'From the latest training match.'
          : `vs ${s.opponent ?? 'Match'}`,
      date: s.date,
      shortDate: formatShortDate(s.date),
      href: '/parent/highlights',
    })
  }

  // Coach note notifications — read from localStorage at the call-site
  // (browser only). The lib returns the synthesis logic; the hook reads
  // localStorage and feeds notes into the merge.
  // NOTE: callers should call `mergeCoachNoteNotifications` after this.

  // IDP update — same pattern; callers fold in localStorage IDP-draft
  // timestamps.

  // Attendance milestones.
  const att = Object.values(attendanceData)
    .flat()
    .find(a => a.playerId === playerId)
  if (att) {
    for (const m of ATTENDANCE_MILESTONES) {
      if (att.sessionsAttended >= m) {
        out.push({
          id: `attendance_${m}`,
          kind: 'attendance_milestone',
          title: `${m} sessions attended`,
          body: 'A consistent run — keep it up.',
          date: new Date().toISOString().slice(0, 10),
          shortDate: 'Recently',
          href: '/parent/development',
        })
      }
    }
  }

  // Upcoming session — single notification for the next scheduled session
  // within 7 days.
  const next = getNextUpcomingSession(playerId)
  if (next) {
    const nextDate = new Date(`${next.date}T00:00:00`)
    const daysAway = Math.round(
      (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
    if (daysAway >= 0 && daysAway <= 7) {
      out.push({
        id: `scheduled_${next.id}`,
        kind: 'session_scheduled',
        title:
          next.type === 'match'
            ? `Match vs ${next.opponent ?? 'TBA'}`
            : next.type === 'training_match'
            ? 'Training match'
            : 'Training session',
        body:
          daysAway === 0
            ? 'Today.'
            : daysAway === 1
            ? 'Tomorrow.'
            : `In ${daysAway} days.`,
        date: next.date,
        shortDate: formatShortDate(next.date),
        href: '/parent/stats',
      })
    }
  }

  // Sort newest first.
  return out.sort((a, b) => b.date.localeCompare(a.date))
}

/** Browser-only: fold localStorage-backed notifications (coach notes +
 *  IDP updates) into the base list returned by `getNotificationsForKid`.
 *  Call from `useEffect` so SSR returns the deterministic base list. */
export function readClientNotifications(playerId: string): PortalNotification[] {
  if (typeof window === 'undefined') return []
  const out: PortalNotification[] = []

  // Coach notes
  try {
    const raw = localStorage.getItem('fairplai_match_notes')
    if (raw) {
      const all = JSON.parse(raw) as Record<
        string,
        { text: string; savedAt: number; author: string }
      >
      for (const [key, note] of Object.entries(all)) {
        if (!key.startsWith(`${playerId}__`)) continue
        const sessionId = key.split('__')[1]
        const session = sessions.find(s => s.id === sessionId)
        if (!session) continue
        out.push({
          id: `note_${sessionId}`,
          kind: 'coach_note',
          title: 'New note from coach',
          body:
            note.text.length > 80 ? note.text.slice(0, 77) + '…' : note.text,
          date: new Date(note.savedAt).toISOString().slice(0, 10),
          shortDate: formatShortDate(
            new Date(note.savedAt).toISOString().slice(0, 10),
          ),
          href: '/parent/stats',
        })
      }
    }
  } catch {
    /* localStorage unavailable */
  }

  // IDP draft updates
  try {
    const raw = localStorage.getItem('fairplai_idp_drafts')
    if (raw) {
      const all = JSON.parse(raw) as Record<
        string,
        { savedAt: number; observation?: string }
      >
      const draft = all[playerId]
      if (draft && draft.savedAt) {
        out.push({
          id: `idp_${playerId}`,
          kind: 'idp_update',
          title: 'IDP updated',
          body: 'Coach updated your development plan.',
          date: new Date(draft.savedAt).toISOString().slice(0, 10),
          shortDate: formatShortDate(
            new Date(draft.savedAt).toISOString().slice(0, 10),
          ),
          href: '/parent/development',
        })
      }
    }
  } catch {
    /* localStorage unavailable */
  }

  return out
}

/** Merge SSR-safe notifications with localStorage ones. Sorts newest first. */
export function mergeNotifications(
  base: PortalNotification[],
  client: PortalNotification[],
): PortalNotification[] {
  return [...base, ...client].sort((a, b) => b.date.localeCompare(a.date))
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}
