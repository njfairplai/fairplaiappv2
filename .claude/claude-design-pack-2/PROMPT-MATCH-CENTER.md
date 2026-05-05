# Refinement prompt for Claude Design — Match Center + Highlights

Paste this into the **same** Claude Design Project chat where you produced the player profile + bib card + compare. Project knowledge is loaded — reusing the chat saves credits.

This brief is **single-direction, combined**. Two surfaces share one calendar primitive, so they're designed together. No variants, no name explores, no rationale paragraphs. Build the design described.

---

## Context

The coach web portal currently has four tabs: `Coach's Hub · Video · Analysis · Squad`. The new structure is:

```
Hub  ·  Match Center  ·  Players  ·  Highlights
```

Hub stays as a placeholder for the future Coach Mikel agent — out of scope here. Players is today's squad pitch (already designed) — out of scope here.

This brief covers the two new surfaces: **Match Center** and **Highlights**.

The match drill-in page (`/coach/web/match/[sessionId]` — V3ScoreStrip / V3Timeline / V3ClipPanel / V3MatchStats) **is already built and stays as a deep-link destination**. Match Center does NOT replace it. Match Center is the surface coaches land on to pick + preview a match; the drill-in page is where they go for full per-match detail.

The two surfaces round-trip:

- **Match Center → drill-in** via the `Open full match analysis →` CTA in the analysis-ready state.
- **Drill-in → Match Center** via the existing `← Back to matches` button (re-target to `/coach/web/match-center?session=<id>` so the same match is pre-selected), AND the existing `Watch full match ▶` button (re-target to the same URL — Match Center is where the video lives inline).

Mental model: Match Center is the **match home**. The drill-in is the **deep dive**. A coach moves freely between them, never feels lost.

**Drill-in surface (for context — DO NOT REDESIGN):**
- Top header strip: home team name `2 - 1` away team name with the winning score backed by a yellow swatch; underneath `FT · SUN 24 FEB · Pitch 1`; on the right an `All / Goals / Key passes / Tackles / Saves / Sprints` filter pill row.
- Five paired horizontal team-stat bars (possession, pass accuracy, shots on target, tackles, intercepts), home in indigo / away in indigo-mute.
- A horizontal scrub-bar timeline of the whole match. Event markers sit on the timeline at their minute. A vertical playhead bar marks the active event.
- A two-pane below: left = active event clip (large), right = AI commentary card with the moment's narrative + a small player chip + key stats.
- A roster column on the right side of the page listing every player who appeared in the match (avatar, name, position, jersey, composite). Clicking filters timeline events to that player.

This is the destination of the `Open full match analysis →` CTA. Don't change it. Match Center should feel like the *front door* to this surface, not a duplicate of it.

## Shared calendar primitive

Both Match Center and Highlights use the same calendar component as their navigator. Design it once, render it twice with different content panes below it.

### Two views

- **Monthly grid** (default): a 5-row × 7-column traditional month calendar. Each day cell shows a small badge for the session(s) on that day. Empty days are sand. The current month label + prev/next month chevrons sit above the grid.
- **Weekly view** (toggle): horizontal filmstrip of 5–7 frames, one per session in the active week. Clicking a frame selects it. Same frame visual encoding as the player-profile filmstrip we already shipped. Used when the coach wants to scrub session-by-session inside a tight time window.

A toggle pill in the calendar header switches between Month and Week views. Default is Month.

### Frame visual encoding (both views)

Each session frame encodes:

- **Date** in mono eyebrow (e.g. `FEB 24`).
- **Status pill** in the sprocket band:
  - `Prep needed` — coral
  - `Processing` — indigo-mute (animated dot)
  - `Ready` — indigo
  - `Drills` — sand-deep
  - `Upcoming` — translucent
- **Match kind chip** in the footer:
  - Match (vs external opponent) — opponent name in body font, no chip
  - Training match (in-house Team A vs Team B) — yellow `TRAINING` chip
  - Drills only (no match played) — `DRILLS` chip in indigo-mute
- **Composite score arc** — small (50px) top-left, only for analysed/ready sessions
- **Reserved space for a future `Scout watch` chip** near the player-of-the-match label — DO NOT render the chip itself in this design (the backend doesn't exist yet). Just leave the visual real estate.

### Calendar header

```
[ ◀ ] FEBRUARY 2026 [ ▶ ]                         [ Month | Week ]   [ + Record session ]
```

- Month / year label, prev / next month controls
- View toggle (Month | Week)
- `+ Record session` CTA — top-right, opens the existing `/coach/web/record` flow inline as the prep form (see Match Center prep state below)

## Match Center — full surface

### Above the fold

- Top: page title (`Match Center` in display) + subtitle (`{rosterName} · Spring 2026 — N matches played, M scheduled`)
- Below: the calendar primitive

### Below the fold (contextual content pane)

Driven by the selected calendar frame. Five states, five layouts. Coach scrubs to a frame → pane below morphs to that frame's state.

#### State 1 — Upcoming match (future date, prep not done)

```
[ Eyebrow: PREP NEEDED · vs Al Wasl Academy · Sun 24 Feb · 15:00 · Pitch 1 ]
[ Headline: Plan your matchday ]

[ Tabs: Attendance | Bibs (training only) | Lineup | Confirm ]

[ Inline prep form — adapted from /coach/web/record ]

[ Footer CTA bar:    Mark as drill only ↗     Save draft     Confirm prep → ]
```

The prep form is a re-skin of the existing 4-step wizard's content (attendance grid + jersey numbers + Team A/B bib colour for training matches). The wizard chrome is gone; the steps become tabs INSIDE the contextual pane. Same data captured, less ceremonial.

For competitive matches (vs external opponent), the Bibs tab is hidden — only Attendance + Lineup + Confirm.

**Data fields per tab** (so you don't have to guess):

- **Attendance** — table of every roster player. Each row: small avatar (28px circle), full name, position pill (CM/ST/GK), `Present` checkbox, jersey number numeric input (default to player's stored jersey#, editable). Sticky header. ~16 rows for a typical roster. Sort: roster order. A "Mark all present" link in the table header.
- **Bibs** (training only) — two side-by-side colour pickers ("Team A" / "Team B"). Available colours: Red `#EF4444`, Blue `#3B82F6`, Green `#10B981`, Yellow `#EAB308`, Orange `#F97316`, Purple `#8B5CF6`, White `#94A3B8`, Black `#1E293B`. Below the colour pickers: a roster grid of present players (from Attendance tab) where each player chip can be dragged or tapped to assign Team A / Team B / Unassigned. Show counts per team (e.g. `Team A: 8 · Team B: 8 · Unassigned: 0`).
- **Lineup** — optional. A football pitch silhouette (horizontal) with formation slots. Default formation: 4-3-3 for matches, 3-3-1 + 3-3-1 for training-match (per team). Drag present players into slots. If skipped, AI infers position from match footage.
- **Confirm** — summary card showing what's been entered (count of attendees, bib split if training, formation if set), session metadata (opponent / date / pitch), and a single `Confirm prep` CTA.

#### State 2 — Past, type undecided (coach hasn't told us if it was a match or drills)

```
[ Eyebrow: NEEDS CATEGORISATION · Mon 12 Feb · Pitch 2 ]
[ Video player, 16:9 ]

[ Question card:  "Was this a match or a drill session?" ]
[ CTAs:  [ Mark as match — enter lineup ]   [ Mark as drills only ] ]
```

Resolves the AI's blindspot — the AI doesn't know if a session was a real match or just drills.

#### State 3 — Past, drills only (coach marked it that way)

```
[ Eyebrow: DRILLS · Wed 14 Feb · Pitch 2 ]
[ Video player, 16:9 ]
[ Caption: "Drills session. No analysis." ]
[ Small text link: "Actually it was a match → enter lineup" ]
```

#### State 4 — Past match, prep entered, AI processing

```
[ Eyebrow: PROCESSING · vs Al Wasl Academy · Sun 24 Feb ]
[ Video player, 16:9 ]
[ Card:  ◐ Analysis in progress · usually ~2 hours ]
```

#### State 5 — Past match, analysis ready (the populated state)

```
[ Eyebrow: ★ MOTM SAEED KHALIFA · vs Al Wasl Academy · Sun 24 Feb · 3-1 W ]
[ Video player, 16:9 ]

[ Highlights row — 3-5 clip cards, horizontal carousel.
  Each card = the clip-card component already in the player profile's
  HighlightsSection: NO thumbnail image, just a small play-icon button on
  the left, a coloured event badge (GOAL = yellow, KEY = indigo, TACKLE =
  coral, SAVE = indigo, SPRINT = indigo-mid), player name + jersey#,
  minute' + duration, plus a small ShareMenu icon and Flag icon inline
  on the right of the card. Reuse this component verbatim. ]

[ Two-column summary:                                                                  ]
[                                                                                       ]
[ TEAM SUMMARY                          | TOP PERFORMERS THIS MATCH                    ]
[ Squad avg: 76                         | 1. Saeed Khalifa  82  RW                     ]
[ MOTM: Saeed Khalifa  82               | 2. Kiyan Makkawi  79  CM                     ]
[ Goals: 3 (2 by Saeed, 1 Kiyan)        | 3. Ahmed Hassan   76  ST                     ]
[ Assists: 2                            |                                              ]
[ Possession: 62%                       | [reserved slot for Scout watch chips here]   ]
[ Pass acc: 78%                         |                                              ]
[                                                                                       ]
[ [ Open full match analysis → ]                                                       ]
```

The `Top performers` column is the scout-signal surface — leave visual room next to each player row for a future `Scout watch` chip. Don't render the chip; leave the slot.

The `Open full match analysis →` CTA routes to `/coach/web/match/[id]` (the existing built drill-in).

## Highlights — full surface

### Above the fold

- Top: page title (`Highlights` in display) + subtitle (`{rosterName} · {totalClipCount} moments captured this season`)
- Filter chips row: `All / Goals / Key passes / Tackles / Saves / Sprints` — applies across the whole season, filters which calendar frames show clip-thumbnail count badges
- Below: the same calendar primitive (month + week toggle)

### Below the fold

When a match is selected:

```
[ Eyebrow: vs Al Wasl Academy · Sun 24 Feb · 3-1 W · 7 clips ]

[ Match-aggregate reel hero card ]
[ ▶ Watch all 7 highlights · 1m 24s · Share ↗ ]

[ Grid of clip cards (2-3 cols desktop, 1 col mobile) ]
[ Each card: play icon, event badge (GOAL / KEY / TACKLE / SAVE / SPRINT), ]
[             player name + jersey #, minute, duration, ShareMenu, Flag ]
```

Reuse the existing `HighlightsSection` clip-card component — just embedded under the calendar instead of inside the player profile.

When no match is selected (default landing): a "Season reel" hero card chains every clip across the season, with a season-wide top performers row underneath.

## Empty states

| State | Message |
|---|---|
| No upcoming sessions on the calendar | `No matches scheduled. Tap "+ Record session" to add one.` |
| Selected frame has no clips (Highlights tab) | `No moments captured for this match yet.` |
| Filter chip + season has zero matches | `No {filter} this season — yet.` |
| Squad has no analysed matches at all (new academy) | A small empty-state hero in Match Center: `Your first match is waiting. Record one to get started.` |

## Mobile

- Calendar collapses to weekly view by default on mobile (month grid is too dense at narrow widths). Toggle still available.
- Match Center contextual pane stacks vertically under the calendar — video first, then summary cards, then CTAs.
- Highlights clip grid is 1 column.
- Tabs in the prep form become a horizontal scrolling pill rail.

## Brand chrome

- Sand `#EEE4C8` page surface, paper `#F8F2DE` card surfaces, indigo `#1B1550` structure / text, yellow `#FCD718` accent, coral `#EB4D6D` for `Prep needed` / warnings.
- Clash Display headlines, Satoshi body, Fragment Mono for eyebrows / data labels.
- The video player chrome is indigo with yellow scrub progress (matches the existing match drill-in).
- Calendar grid lines: `var(--brand-line)`.

## Real data only

- `mockData.sessions` — all sessions, including `type: 'match' | 'training_match' | 'drill'`.
- `mockData.matchAnalyses` — per-player composites for the analysis-ready state.
- `mockData.highlights` — clips for the Highlights tab.
- `mockData.gameTeamStats` — possession / pass acc for the team summary.
- Session statuses: `scheduled / in_progress / processing / complete / analysed / playback_ready / cancelled`.

## Deliverable

1. **HTML mockup of Match Center** — desktop, tablet, mobile.
2. **All 5 contextual states** rendered as separate canvas frames so the coach's experience for each session-state is clear.
3. **HTML mockup of Highlights** — desktop + mobile.
4. **Calendar primitive** in both Month and Week views, side-by-side, so the toggle behaviour is clear.
5. **Empty states** rendered for the four scenarios listed.
6. **Annotation note** on player rows in the Top Performers column + Highlights clip cards: where the future `Scout watch` chip will live (visual slot reserved, chip not rendered).
7. **Round-trip linking** — annotated arrows in your spec sheet showing the navigation loop: Match Center ready-state `Open full match analysis →` lands on the existing drill-in; drill-in `← Back to matches` and `Watch full match ▶` return to Match Center with that session pre-selected. Don't redesign the drill-in — just show the link points and the URL targets.

No name explores. No rationale. No variants. Build it.

---

## After Claude Design returns

1. Export with **Handoff to Claude Code…** or **Download project as .zip**.
2. Save the export into `/Users/naheljarmakani/fairplai-app/.claude/claude-design-pack/Handoffs/fairplai-match-center/`.
3. Tell me **"match center pack is in"** and I'll start implementation as Slice 6.2 phase 5.
