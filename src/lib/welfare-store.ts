/**
 * LocalStorage-backed store for the welfare features (injury flags,
 * PPE flags, Coach-Cam clips, shared clips, fatigue samples).
 *
 * Lives in its own module to break the circular import that would
 * otherwise form between `match-center.ts` (producer helpers) and
 * `parent-portal.ts` (reader helpers + notification synthesis).
 */

// Single shared key per record-type (array). Producer helpers in
// match-center.ts append to these; parent-portal helpers read them.
export const LS_INJURY_FLAGS = 'fairplai_injury_flags'
export const LS_PPE_FLAGS = 'fairplai_ppe_flags'
export const LS_COACH_CAM = 'fairplai_coach_cam_clips'
export const LS_SHARED_CLIPS = 'fairplai_shared_clips'
export const LS_FATIGUE = 'fairplai_fatigue_samples'

/** Record of a coach-shared AI-analysed highlight pushed to a parent.
 *  CoachCam clips are stored separately (LS_COACH_CAM) since they aren't
 *  derived from a Highlight. */
export interface SharedClipRecord {
  id: string
  highlightId: string
  playerId: string
  parentId: string
  coachId: string
  message?: string
  sentAt: string
}

export function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function writeArray<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* localStorage unavailable */
  }
}

/** Append a single record to one of the welfare arrays. Producer helpers
 *  in match-center.ts use this. */
export function appendToWelfareStore<T>(key: string, record: T): void {
  const list = readArray<T>(key)
  list.push(record)
  writeArray(key, list)
}

/** Wipe a welfare store (used by demo reset flows). */
export function clearWelfareStore(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* localStorage unavailable */
  }
}

// ─── DEMO SEED ─────────────────────────────────────────────
// Seeds the welfare arrays once per browser so first-load surfaces have
// shape. Idempotent — calling multiple times re-checks but doesn't dupe.
// Uses a separate seed-marker key so we know seeding has run even if a
// store was deliberately emptied.

const SEED_MARKER_KEY = 'fairplai_welfare_seed_v1'
const DEMO_PLAYER_KIYAN = 'player_001'
const DEMO_PLAYER_ZAIN = 'player_009'
const DEMO_COACH = 'coach_001'

interface WelfareSeed {
  injuryFlags: unknown[]
  ppeFlags: unknown[]
  coachCamClips: unknown[]
  sharedClips: unknown[]
  fatigueSamples: unknown[]
}

function buildSeed(): WelfareSeed {
  // Helper closures so id generation is consistent + deterministic.
  let n = 0
  const id = (p: string) => `${p}_seed_${++n}`
  const isoDaysAgo = (d: number) => {
    const t = Date.now() - d * 24 * 60 * 60 * 1000
    return new Date(t).toISOString()
  }

  return {
    injuryFlags: [
      // One mild strain on Kiyan during the March 8 vs Al Nasr Cubs match.
      {
        id: id('inj'),
        sessionId: 'session_054',
        playerId: DEMO_PLAYER_KIYAN,
        minute: 53,
        type: 'strain',
        severity: 1,
        notes: 'Pulled up after a sprint, walked it off. Subbed at 60.',
        createdAt: isoDaysAgo(13),
      },
      // One collision on Zain in the Mar 15 Hatta match.
      {
        id: id('inj'),
        sessionId: 'session_056',
        playerId: DEMO_PLAYER_ZAIN,
        minute: 38,
        type: 'collision',
        severity: 2,
        notes: 'Aerial duel, head clash. Cleared by physio, finished match.',
        createdAt: isoDaysAgo(6),
      },
    ],
    ppeFlags: [
      // Open boots flag on Kiyan.
      {
        id: id('ppe'),
        playerId: DEMO_PLAYER_KIYAN,
        gearType: 'boots',
        notes: 'Studs are smoothing out — replace before next month.',
        status: 'open',
        createdAt: isoDaysAgo(4),
      },
    ],
    coachCamClips: [
      // A coach-cam clip the coach uploaded of Kiyan's drill rep.
      {
        id: id('cc'),
        playerId: DEMO_PLAYER_KIYAN,
        coachId: DEMO_COACH,
        uploadedAt: isoDaysAgo(2),
        source: 'phone_upload',
        caption: 'First-touch drill — proper technique on the half-turn.',
        tag: 'drill',
        thumbnailUrl: '',
        videoUrl: '',
        durationSeconds: 18,
      },
    ],
    sharedClips: [
      // Coach shared the Mar 8 brace with Kiyan's parent.
      {
        id: id('shc'),
        highlightId: 'h-m08-4',
        playerId: DEMO_PLAYER_KIYAN,
        parentId: 'parent_001',
        coachId: DEMO_COACH,
        message: 'The late run for 2-1 — exactly the timing we worked on.',
        sentAt: isoDaysAgo(12),
      },
    ],
    fatigueSamples: buildFatigueSeed(),
  }
}

function buildFatigueSeed(): unknown[] {
  // Two players × 8 sessions of fatigue. Kiyan trends high (workhorse),
  // Zain trends moderate. Numbers are mocked 0–100.
  const out: unknown[] = []
  const days = [56, 49, 42, 35, 28, 21, 14, 7]
  const kiyanLoads = [42, 48, 55, 61, 68, 72, 76, 81]
  const zainLoads = [38, 45, 50, 52, 58, 60, 62, 65]
  for (let i = 0; i < days.length; i++) {
    const date = new Date(Date.now() - days[i] * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    out.push({
      playerId: DEMO_PLAYER_KIYAN,
      date,
      load: kiyanLoads[i],
      topSprintKmh: 24 + (i * 0.3),
      sprintCount: 12 + i,
      distancePerMinute: 95 + i * 2,
    })
    out.push({
      playerId: DEMO_PLAYER_ZAIN,
      date,
      load: zainLoads[i],
      topSprintKmh: 23 + (i * 0.2),
      sprintCount: 10 + i,
      distancePerMinute: 88 + i,
    })
  }
  return out
}

/** Run the welfare seed if it hasn't been run before. Idempotent. */
export function seedWelfareIfEmpty(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.localStorage.getItem(SEED_MARKER_KEY)) return
    const seed = buildSeed()
    if (readArray(LS_INJURY_FLAGS).length === 0) {
      writeArray(LS_INJURY_FLAGS, seed.injuryFlags)
    }
    if (readArray(LS_PPE_FLAGS).length === 0) {
      writeArray(LS_PPE_FLAGS, seed.ppeFlags)
    }
    if (readArray(LS_COACH_CAM).length === 0) {
      writeArray(LS_COACH_CAM, seed.coachCamClips)
    }
    if (readArray(LS_SHARED_CLIPS).length === 0) {
      writeArray(LS_SHARED_CLIPS, seed.sharedClips)
    }
    if (readArray(LS_FATIGUE).length === 0) {
      writeArray(LS_FATIGUE, seed.fatigueSamples)
    }
    window.localStorage.setItem(SEED_MARKER_KEY, '1')
  } catch {
    /* localStorage unavailable */
  }
}
