/**
 * Demo footage URLs — real 5-minute match clip + AI overlay version.
 *
 * Hosted on Azure Blob (fairplaistorage) with SAS tokens valid through
 * 2027-05-07. Public-read by the SAS, no auth needed in the app.
 *
 * Two assets back ONE match (session_007 — Kiyan vs Al Wasl Academy,
 * 2026-02-24, the calendar's default day on Match Center). Coach side
 * lands here naturally; parent side is forced to land here too via
 * the demo-focal override in `getLatestAnalysedMatch` so both portals
 * are looking at the same match.
 *
 * Highlight clipping is done via HTML5 `#t=start,end` URL fragments — no
 * ffmpeg, no re-upload, the browser plays the requested range from the
 * single source file. `clipFragment(start, end)` returns the suffix.
 *
 * The overlay version is the SAME 5 minutes with object-detection
 * annotations rendered. Coach drill-in lets the user toggle between
 * the two (default ON = overlay, that's the AI moment we want to lead
 * with). Parent side never shows the overlay — same asymmetric rule
 * we apply elsewhere.
 */

export const DEMO_MATCH_VIDEO_URL =
  'https://fairplaistorage.blob.core.windows.net/full-videos/fairplai_5_min_.mp4?sp=r&st=2026-05-07T14:29:51Z&se=2027-05-07T22:44:51Z&spr=https&sv=2025-11-05&sr=b&sig=qiOWMG5%2Fb4W0H%2B4ZL%2F1lnIO%2F0P1%2FzXmFEfc1%2BC3wcEg%3D'

export const DEMO_MATCH_OVERLAY_URL =
  'https://fairplaistorage.blob.core.windows.net/full-videos/fairplai_overlay_5_min.mp4?sp=r&st=2026-05-07T14:46:44Z&se=2027-05-07T23:01:44Z&spr=https&sv=2025-11-05&sr=b&sig=ZtrS%2FVZKnXQ2qktCleT9rjmtMCpMMH5DgEyLwXYKl40%3D'

/** Append a time-range fragment to a video URL. The fragment is honored
 *  by HTML5 `<video>` to play `start..end` seconds from the source. */
export function clipFragment(startSec: number, endSec: number): string {
  return `#t=${startSec},${endSec}`
}

/** Convenience: return a URL that plays only `start..end` of the demo
 *  raw match. Used to back highlight clips without re-uploading. */
export function demoClipUrl(startSec: number, endSec: number): string {
  return `${DEMO_MATCH_VIDEO_URL}${clipFragment(startSec, endSec)}`
}

/** The session id this footage backs. Single source of truth so any new
 *  surface that wants to render the demo video can check membership. */
export const DEMO_FOCAL_SESSION_ID = 'session_007'
