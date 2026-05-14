/**
 * Public-CV helpers — slug ↔ playerId mapping + FIFA Connect IDs.
 *
 * The public player CV lives at /p/[slug] and is reachable without auth.
 * Slugs are kebab-case "firstname-lastname" derived from the player's
 * display name. We keep an explicit lookup map instead of computing
 * on-the-fly so renames don't break old share links — a slug can outlive
 * its underlying name change.
 *
 * FIFA Connect IDs are mocked here for the prototype. When FIFA Connect
 * exposes an API, replace this with a real fetch.
 */

import { players } from './mockData'
import type { Player } from './types'

/* Public slug → playerId. Add new entries as the demo roster grows. */
const SLUG_TO_PLAYER_ID: Record<string, string> = {
  'kiyan-makkawi':     'player_001',
  'ahmed-hassan':      'player_002',
  'omar-al-rashidi':   'player_003',
  'saeed-khalifa':     'player_004',
  'hamdan-al-mazrouei': 'player_005',
  'faisal-al-nuaimi':  'player_006',
  'zayed-al-mansoori': 'player_007',
  'rashid-al-shamsi':  'player_008',
  'zain-al-dosari':    'player_009',
}

/* Mocked FIFA Connect IDs for the prototype. Real implementation will
 * fetch from the FIFA Connect federation API (if/when DOFA gets us
 * access). Format mimics the FIFA Connect ID pattern (federation +
 * unique). */
const FIFA_CONNECT_IDS: Record<string, string> = {
  player_001: 'UAE-2014-K7M11',
  player_002: 'UAE-2014-A9H22',
  player_003: 'UAE-2014-O4R10',
  player_004: 'UAE-2014-S11K05',
  player_005: 'UAE-2014-H1M18',
  player_006: 'UAE-2014-F3N30',
  player_007: 'UAE-2014-Z8M14',
  player_009: 'UAE-2012-Z10D14',
}

/** Resolve a slug to the underlying Player record. Returns null when the
 *  slug isn't registered (the route renders a 404 in that case). */
export function getPlayerBySlug(slug: string): Player | null {
  const playerId = SLUG_TO_PLAYER_ID[slug]
  if (!playerId) return null
  return players.find(p => p.id === playerId) ?? null
}

/** Reverse lookup — get the public slug for a player. Used by share
 *  buttons that need to produce the public URL. */
export function getSlugForPlayer(playerId: string): string | null {
  const entry = Object.entries(SLUG_TO_PLAYER_ID).find(([, id]) => id === playerId)
  return entry?.[0] ?? null
}

/** FIFA Connect ID for the player, if registered. */
export function getFifaConnectId(playerId: string): string | null {
  return FIFA_CONNECT_IDS[playerId] ?? null
}

/** All slugs we've registered — used for static generation, scout
 *  discovery seed, and any "all CVs" admin view. */
export function getAllPublicSlugs(): string[] {
  return Object.keys(SLUG_TO_PLAYER_ID)
}

/** All players with a public CV (a slug registered). For scout
 *  discovery list. */
export function getAllPublicPlayers(): Array<{ player: Player; slug: string }> {
  return Object.entries(SLUG_TO_PLAYER_ID)
    .map(([slug, playerId]) => {
      const player = players.find(p => p.id === playerId)
      return player ? { player, slug } : null
    })
    .filter((x): x is { player: Player; slug: string } => x !== null)
}
