# Refinement prompt for Claude Design — IDP (Individual Development Plan)

Paste this into the **same** Claude Design Project chat where you produced Match Center. Project knowledge is loaded — reusing the chat saves credits.

This brief is **single-direction**. No variants, no name explores, no rationale paragraphs. Build the design described.

---

## What we're building

The **Individual Development Plan (IDP)** screen at `/coach/web/idps`. The coach's surface for capturing a structured development assessment per player + sending it to parents. Currently on the old design system (system fonts, white cards, blue gradient chrome) — full redesign to brand.

The IDP is a recurring artefact: every 4-6 weeks the coach revisits each player and produces a fresh plan. Two views in one route: a **list** (which players need attention) and an **editor** (a single player's plan).

## Surface composition

### List view (lands here)

**Header**
- `INDIVIDUAL DEVELOPMENT PLANS` mono eyebrow
- Display headline: `{rosterName}` (e.g. `MAK U12 Red`)
- Sub-line in mono: `{N} reports due · {M} drafts · {K} sent this season`

**Filter / sort controls**
- Filter chips: `Due / Drafts / Sent / All`
- Sort dropdown: `Status · Name · Last reviewed`

**Player list**
- One row per player in the active roster.
- Each row: avatar (32px), full name, position pill (CM / ST / GK), jersey number, season composite score, status pill (`Due` coral / `Draft` indigo / `Sent` indigo-mid), last-reviewed eyebrow (`6 weeks ago` mono), chevron-right.
- Click → opens editor view for that player.
- Sticky header. ~16 rows for a typical roster.

### Editor view (clicked into)

**Editor header**
- `← Back to list` link (top-left, mono)
- Player avatar (48px) + full name (display) + position pill + #jersey
- Status badge (`Due` / `Draft · saved 3 min ago` / `Sent · Mar 12`)

**Two-column body** (desktop), single column stack (mobile)

#### Left column — Auto-populated (read-only)

Six cards, top to bottom:

1. **PERFORMANCE**
   - Big composite score (display, 56px), `+5 vs season avg` mono in indigo or coral
   - `SEASON AVG: 73` mono eyebrow underneath

2. **SKILL PROFILE**
   - 6-axis radar (Phys / Posi / Pass / Drib / Cont / Defe) — same `PolyRadar` primitive as the player profile, single solid indigo polygon (no overlay needed for IDP).
   - 160px square, axis labels in mono.

3. **KEY STATS** (season aggregates)
   - 6-row data table: Goals, Assists, Shots, Shot Accuracy, Dribbles, Avg Score.
   - Two columns: label (body) | value (display).

4. **STRENGTHS / AREAS FOR DEVELOPMENT**
   - Two stacked sub-sections.
   - `Strengths` heading in indigo, then 2-3 yellow chips (e.g. `Pace`, `Dribbling`, `Composure`).
   - `Areas for development` heading in coral, 2-3 coral chips (e.g. `Aerial duels`, `Passing range`).
   - From `developmentReportData[playerId]` mock.

5. **DATA-BACKED SOFT SKILLS**
   - 5 horizontal bars: Attitude, Effort, Coachability, Sportsmanship, Leadership.
   - Each bar: label (body), filled portion in indigo (or yellow for top 2 scores), score number (mono) on the right.
   - Subtitle: `Inferred from session attendance + coach feedback history`.

6. **SEASON SNAPSHOT**
   - 3 small stat tiles in a row: `Highlights captured` / `Matches played` / `Attendance %`.
   - Each tile: number (display, 22px) + label (mono eyebrow).

#### Right column — Coach inputs (editable)

Three cards:

1. **TEMPERAMENT & ATTITUDE**
   - 4 rows. Each row: label (body) + 5-star rating (yellow filled, line stars unfilled).
   - Labels: `Attitude`, `Effort`, `Coachability`, `Sportsmanship`.
   - Stars are clickable — tap a star to set the rating.

2. **COACH'S OBSERVATION**
   - Textarea, 6 rows tall, brand-styled border + sand background.
   - Placeholder: `Saeed has explosive pace and good instincts. Needs to channel energy more productively in tight situations.`
   - Character counter (`0 / 280`) bottom-right in mono.

3. **DEVELOPMENT GOALS**
   - Three numbered text inputs (1, 2, 3).
   - Placeholder per row: `Goal {N}: e.g. Improve first touch under pressure in next 4 sessions`.
   - Optional 4th `+ Add another goal` link in mono if you want extensibility.

**Footer CTA bar** (sticky to bottom of editor on desktop, full-width row on mobile)
- Three buttons left-to-right:
  - `Save draft` — outlined, indigo border + indigo text.
  - `Download PDF` — outlined, indigo border + indigo text. Icon: download arrow.
  - `Send to parent` — filled yellow, indigo text. Icon: paper-plane. Primary.
- Saves auto-persist to localStorage under `fairplai_idp_drafts` keyed by playerId. The Save draft button just confirms — auto-save is on.

## Brand chrome

- Sand `#EEE4C8` page surface, paper `#F8F2DE` card surface, indigo `#1B1550` text + structure.
- Yellow `#FCD718` accent for star ratings + Send CTA + strength chips.
- Coral `#EB4D6D` for `Due` status pill + `Areas for development` chips.
- Clash Display headlines, Satoshi body, Fragment Mono eyebrows + data labels.
- Cards: 1px line border, 12px radius, 18-20px padding. No drop shadows (or very faint — `0 2px 6px rgba(11, 8, 40, 0.04)`).

## Real data only

- `mockData.players` + `rosters` for the player + roster context.
- `mockData.squadScores[playerId]` for composite + season avg.
- `mockData.playerSeasonStats[playerId].stats` for the Key Stats table.
- `mockData.playerRadarData[playerId]` for the 6-axis radar.
- `mockData.developmentReportData[playerId]` for strengths + areas for development.
- `mockData.coachFeedbackHistory` for soft-skill bars + temperament defaults.
- `mockData.attendanceData[rosterId]` for attendance %.
- `mockData.highlights` for highlight count.

## Mobile

- Editor: 2-column body stacks vertically (auto-populated cards first, then coach inputs).
- List: rows shrink — avatar + name + composite + status pill + chevron. Position pill drops on narrow widths.
- Footer CTA bar becomes a full-width sticky bottom row.

## Empty states

- New academy / no players: `Add players to your roster to start writing development plans.`
- All plans up-to-date: `Every player has a current plan. Next reviews due in {N} weeks.`
- Player has no analysed matches yet: in the editor, the auto-populated left column shows `Not enough match data yet` placeholders; coach inputs still editable.

## Deliverable

1. **HTML mockup of the list view** — desktop + mobile.
2. **HTML mockup of the editor view** — desktop + mobile.
3. **Draft state** — editor with some inputs partially filled + the auto-save indicator visible.
4. **Sent state** — editor for a player whose IDP has already been sent (read-only mode, with `Resend to parent` button).
5. **Empty states** rendered for the three scenarios listed.

No name explores. No rationale. No variants. Build it.

---

## After Claude Design returns

1. Export with **Handoff to Claude Code…** or **Download project as .zip**.
2. Save the export into `/Users/naheljarmakani/fairplai-app/.claude/claude-design-pack-2/Handoffs/idp/`.
3. Tell me **"idp pack is in"** and I'll implement.
