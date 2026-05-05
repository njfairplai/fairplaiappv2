# Refinement prompt for Claude Design — Record / Prep form

Paste this into the **same** Claude Design Project chat where you produced Match Center + IDP. Project knowledge is loaded — reusing the chat saves credits.

This brief is **single-direction**. No variants, no name explores, no rationale paragraphs. Build the design described.

---

## What we're building

The **prep form** — what coaches use before a match to capture attendance + jersey numbers + bib (Team A/B) colour assignments + lineup. Currently lives at `/coach/web/record` as a 4-step wizard with Step 1 / Step 2 / Step 3 / Step 4 chrome. The wizard chrome is the problem; the data model is right.

Two delivery surfaces — **same form, two contexts**:

1. **Inline within Match Center** — when a coach selects an "Upcoming match" frame on the Match Center calendar, the contextual pane below the calendar embeds this form.
2. **Standalone at `/coach/web/record`** — when a coach taps `+ Record session` from the Match Center calendar header, they get the same form full-screen for a new session.

Build the form once as a tabbed component that works in both contexts.

## Form data model (don't redesign — already locked)

The form captures:

- **Session metadata** (only required for the standalone `+ New session` flow — Match Center already knows these for an existing session):
  - Session type: `Match` | `Training` (radio)
  - Opponent name (text input, only for `Match`)
  - Date (date picker)
  - Time (time picker)
  - Pitch (dropdown, from `mockData.pitches`)

- **Attendance** (one row per roster player):
  - Present checkbox (default ON)
  - Jersey number (numeric input, default = player's stored jersey#)

- **Bib colours + team assignments** (training matches only):
  - Team A colour (one of: Red `#EF4444`, Blue `#3B82F6`, Green `#10B981`, Yellow `#EAB308`, Orange `#F97316`, Purple `#8B5CF6`, White `#94A3B8`, Black `#1E293B`)
  - Team B colour (same picker)
  - Per-player team assignment: `Team A` / `Team B` / `Unassigned`

- **Lineup** (optional):
  - Football pitch silhouette with formation slots
  - Default formation: 4-3-3 for matches, 3-3-1 + 3-3-1 (per team) for training matches
  - Drag/tap to assign players to slots

## Surface composition

### Tabs (replace the wizard steps)

A horizontal tab rail at the top of the form. **No step numbers, no progress bar.**

Tabs:
- `Session` (only shown in the standalone flow — hidden when embedded in Match Center for an existing session)
- `Attendance`
- `Bibs` (only shown for training matches — hidden for competitive matches)
- `Lineup`
- `Confirm`

The active tab gets indigo fill + sand text. Inactive tabs are sand background + indigo text + 1px line border.

### Tab — Session (standalone only)

Two-column form on desktop. Left: type radio + opponent input + date + time. Right: pitch dropdown + small map preview of the selected pitch. Mobile: single-column stack.

### Tab — Attendance

One large card. Inside:

- Header row: `{N} of {M} present` mono eyebrow + `Mark all present` link in mono on the right.
- Table-like grid:
  - Each row: avatar (28px) + full name (body) + position pill (CM/ST/GK) + jersey# numeric input (3 chars wide) + present checkbox.
  - Sticky table header.
  - Alternating sand / paper row backgrounds for scan-ability.
- Below the grid: a small `Default to last match's lineup` link in mono if the player has prior data.

### Tab — Bibs (training only)

Two stacked sections.

**Section 1 — Team colours**
- Two side-by-side colour pickers: `Team A` and `Team B`.
- Picker shows 8 swatches in a 4×2 grid. Selected swatch has a 2px indigo ring.
- Above each picker: the team's count (`Team A · 8 players`).

**Section 2 — Player assignment**
- Roster grid of present players (from Attendance tab — players marked absent are excluded).
- Each player chip: avatar (24px) + name + jersey#. Chip background = the assigned team's bib colour (semi-transparent, 0.18 alpha) with the team colour as a left border. Unassigned chips are sand with no border.
- Click cycles `Unassigned → Team A → Team B → Unassigned`.
- Or drag a chip onto a `Team A` / `Team B` drop-zone column on the right side of the grid.
- A `Auto-split evenly` link in mono splits present players randomly into balanced teams.

### Tab — Lineup (optional)

Football pitch silhouette, horizontal orientation. Vector background — same colours as the Match Center heatmap pitch.

- Formation slots highlighted as small circles. Player chips drag in.
- A `Skip lineup — let AI infer` link below the pitch. Most coaches will use this.
- For training matches: two pitches stacked, one per team.

### Tab — Confirm

Summary card. Three sub-sections:

1. **Session** — type chip, opponent (or "Training match"), date, time, pitch.
2. **Attendance** — `{N} of {M} present` + the absent players' names listed.
3. **Bibs / Lineup** — for training: bib counts + colours. For matches: formation if set.

A single `Confirm prep` CTA at the bottom (filled yellow, indigo text). Above it, a small `Edit any tab to change` mono note.

## Inline (Match Center) vs standalone behaviour

- **Inline**: skip the `Session` tab. Tabs render inside the Match Center contextual pane below the calendar, no full-page chrome. After `Confirm prep`, the calendar's selected frame's status changes from `Upcoming` to `Prep done` (visual: the status pill in the sprocket band updates).
- **Standalone**: render at `/coach/web/record` with a brand-aligned page header (`+ New session` display headline). After `Confirm prep`, redirect to `/coach/web/match-center?session={newSessionId}` so the coach lands on the calendar with the new session selected.

## Empty / edge states

- Roster has zero players: `Add players to your roster first.` with a CTA back to the Players tab.
- Coach selects `Match` with no opponent name: Confirm tab disables `Confirm prep` and shows an inline `Add an opponent on the Session tab` warning.
- Coach selects `Training` and skips `Bibs`: Confirm tab shows `No bibs assigned · the AI will infer teams from footage`.

## Brand chrome

- Sand `#EEE4C8` page surface, paper `#F8F2DE` card surface.
- Indigo `#1B1550` text + structure. Yellow `#FCD718` accent for the Confirm CTA + active tab + filled bib swatches.
- Coral `#EB4D6D` for warnings / missing-data states.
- Clash Display headlines, Satoshi body, Fragment Mono eyebrows + counts + tab labels.

## Real data only

- `mockData.players` filtered to the active roster.
- `mockData.pitches` for the pitch dropdown.
- `mockData.rosters` for the active roster + roster size.
- The 8 jersey colours are fixed (listed above).

## Deliverable

1. **HTML mockup of the standalone flow** at `/coach/web/record` — desktop + mobile, all 5 tabs rendered.
2. **HTML mockup of the inline flow** inside Match Center — render the form embedded under the calendar with `Upcoming match` selected. Show how the tab rail integrates with the surrounding Match Center pane.
3. **Bibs tab — training-match state** — fully populated with a sample roster split between two teams.
4. **Confirm tab — populated state** — show the summary card with sample data.
5. **Edge state** — Match selected with no opponent (the disabled Confirm CTA + warning).

No name explores. No rationale. No variants. Build it.

---

## After Claude Design returns

1. Export with **Handoff to Claude Code…** or **Download project as .zip**.
2. Save the export into `/Users/naheljarmakani/fairplai-app/.claude/claude-design-pack-2/Handoffs/record-prep/`.
3. Tell me **"record pack is in"** and I'll implement.
