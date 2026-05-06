/**
 * localStorage-backed helpers for Match Center user state.
 *
 * Mirrors the convention from `src/lib/parent-portal.ts`: every helper
 * is SSR-safe (returns the empty / null value when `window` is undefined),
 * reads parse JSON inside try/catch so a corrupt blob never crashes the
 * page, and writes JSON.stringify the new value.
 *
 * Keys
 * ----
 *   fairplai_prep_attendance_${sessionId}   Record<jerseyNum, boolean>
 *   fairplai_prep_jerseys_${sessionId}      Record<originalNum, newNum>
 *   fairplai_prep_draft_${sessionId}        { tab, savedAt }
 *   fairplai_prep_confirmed_${sessionId}    { confirmed: true, confirmedAt }
 *   fairplai_session_classify_${sessionId}  MatchCenterStatus override
 *   fairplai_flagged_clips                  string[]   (clip IDs)
 *
 * The session ID we use throughout this slice is `feb-${day}` (e.g.
 * `feb-24`, `feb-28`) — matches the deep-link query param and makes the
 * keys readable when inspecting localStorage in DevTools.
 */

import type { MatchCenterStatus } from './match-center'

const isBrowser = () => typeof window !== 'undefined'

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / disabled — silent */
  }
}

/** Stable session identifier used by all the per-session keys below. */
export function sessionIdForDay(day: number): string {
  return `feb-${String(day).padStart(2, '0')}`
}

// ─── Attendance ─────────────────────────────────────────────────────

export type AttendanceMap = Record<number, boolean>

export function readPrepAttendance(sessionId: string): AttendanceMap {
  return readJson<AttendanceMap>(`fairplai_prep_attendance_${sessionId}`, {})
}

export function writePrepAttendance(sessionId: string, map: AttendanceMap) {
  writeJson(`fairplai_prep_attendance_${sessionId}`, map)
}

// ─── Jersey overrides ───────────────────────────────────────────────

export type JerseyMap = Record<number, number>

export function readPrepJerseys(sessionId: string): JerseyMap {
  return readJson<JerseyMap>(`fairplai_prep_jerseys_${sessionId}`, {})
}

export function writePrepJerseys(sessionId: string, map: JerseyMap) {
  writeJson(`fairplai_prep_jerseys_${sessionId}`, map)
}

// ─── Prep draft + confirmation ──────────────────────────────────────

export interface PrepDraft {
  tab?: 'attendance' | 'lineup' | 'confirm'
  savedAt: string
}

export function readPrepDraft(sessionId: string): PrepDraft | null {
  return readJson<PrepDraft | null>(`fairplai_prep_draft_${sessionId}`, null)
}

export function writePrepDraft(sessionId: string, draft: PrepDraft) {
  writeJson(`fairplai_prep_draft_${sessionId}`, draft)
}

export interface PrepConfirmation {
  confirmed: true
  confirmedAt: string
}

export function readPrepConfirmation(sessionId: string): PrepConfirmation | null {
  return readJson<PrepConfirmation | null>(`fairplai_prep_confirmed_${sessionId}`, null)
}

export function writePrepConfirmation(sessionId: string, payload: PrepConfirmation) {
  writeJson(`fairplai_prep_confirmed_${sessionId}`, payload)
}

// ─── Session classification override ─────────────────────────────────
// When the coach reclassifies a session ("Mark as drills only", "Actually
// it was a match → enter lineup"), we persist the override here so the
// Match Center pane reflects the new state on the next render and after
// a refresh. `getEffectiveStatus` consults this before falling back to
// the mock-data status.

export function readSessionClassify(sessionId: string): MatchCenterStatus | null {
  return readJson<MatchCenterStatus | null>(`fairplai_session_classify_${sessionId}`, null)
}

export function writeSessionClassify(sessionId: string, status: MatchCenterStatus) {
  writeJson(`fairplai_session_classify_${sessionId}`, status)
}

// ─── Flagged clips ──────────────────────────────────────────────────
// Coach taps the ⚑ icon on a HighlightCard → clip ID gets stored. The
// icon then renders in the filled state. Persists across reloads.

export function readFlaggedClips(): string[] {
  return readJson<string[]>('fairplai_flagged_clips', [])
}

export function isClipFlagged(clipId: string): boolean {
  return readFlaggedClips().includes(clipId)
}

export function toggleFlaggedClip(clipId: string): boolean {
  const current = readFlaggedClips()
  const idx = current.indexOf(clipId)
  if (idx >= 0) {
    current.splice(idx, 1)
    writeJson('fairplai_flagged_clips', current)
    return false
  }
  current.push(clipId)
  writeJson('fairplai_flagged_clips', current)
  return true
}
