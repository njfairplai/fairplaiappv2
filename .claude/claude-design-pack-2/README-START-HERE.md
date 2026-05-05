# Claude Design Pack 2 — Match Center + Highlights

This is the bundle for the **fresh** Claude Design Project chat (the previous chat hit a "stream ended" error). Everything Claude Design needs lives here.

## How to use this pack

Open a brand-new Claude Design Project. **Attach the files in this order**, then paste the prompt:

1. `brand/BRAND-REFERENCE.md` — the brand DNA (palette tokens, typography rules, layout discipline). Loads first so colour + type decisions are anchored.
2. `brand/globals.css` — every CSS var Claude Design should reference. `--brand-sand`, `--brand-indigo`, `--brand-yellow`, etc. Source of truth for the runtime palette.
3. `reference-builds/01-player-profile-filmstrip.html` — the player profile design Claude Design produced last round (the filmstrip pattern). The Match Center calendar reuses this filmstrip language for its weekly view.
4. `reference-builds/02-direction-c-filmstrip-source.jsx` — JSX source for the player-profile filmstrip components. Shows how the Frame card, score arc, sprocket band, and footer are composed. Reuse these patterns.
5. `reference-builds/03-player-shared-helpers.jsx` — shared helpers (date formatting, score colour mapping, etc.) referenced by the design components.
6. `types-and-data/types.ts` — the canonical TypeScript types. Tells Claude Design exactly what fields exist on `Session`, `MatchAnalysis`, `Highlight`, etc. So the design uses real data shapes.
7. `screenshots/` — **add your own screenshots here before sending if you want.** Suggested:
   - `/coach/web/match/[any-analysed-id]` (the existing drill-in — Match Center should round-trip with this).
   - `/coach/web/player/[any-id]` (the player profile — the filmstrip pattern that informs the calendar weekly view).
   - `/coach/web/squad` (the squad pitch — the brand language Match Center should sit alongside).
   - `/coach/web/record` (the existing 4-step prep wizard — the prep form data fields Match Center will fold in).
   See `screenshots/README.md` for filename conventions.

Then **paste the contents of `PROMPT-MATCH-CENTER.md` as the chat message**.

This pack ships with **three briefs**. Send them in order, one at a time:

1. `PROMPT-MATCH-CENTER.md` — Match Center + Highlights tab. Big surface, biggest impact.
2. `PROMPT-IDP.md` — Individual Development Plan editor. Smaller scope.
3. `PROMPT-RECORD.md` — Prep form (attendance + bibs + lineup). Smaller scope. The form is delivered both standalone and inline within Match Center.

Don't send all three at once — let each design pack return before sending the next. Project memory is shared across the three briefs in the same chat, so each one builds context for the next.

## What's in the prompt

The brief covers two surfaces in one shot:

- **Match Center** — calendar of all sessions with five contextual states (upcoming, undecided, drills, processing, ready). Replaces the current `/coach/web/analysis` and `/coach/web/video` tabs.
- **Highlights tab** — same calendar primitive, clips bundled per match.

Both share a calendar primitive (Month grid + Weekly filmstrip toggle). The brief is single-direction — no variants, no name explores, no rationale paragraphs.

## What Claude Design should deliver

(Spelled out in the prompt's "Deliverable" section.)

1. HTML mockup of Match Center — desktop, tablet, mobile.
2. All 5 contextual states rendered.
3. HTML mockup of Highlights — desktop, mobile.
4. Calendar primitive in both Month and Week views, side-by-side.
5. Empty states for the four scenarios listed.
6. Annotation showing where the future Scout-watch chip slot lives.
7. Round-trip linking annotation: how `Open full match analysis →` and the drill-in's back-link talk to each other.

## What Claude Design should NOT do

- Redesign the existing match drill-in page (V3ScoreStrip / V3Timeline / V3ClipPanel) — it stays as-is, just shows the link points.
- Redesign the squad pitch / player profile / bib card — already shipped.
- Add Hub design (deferred for the future Coach Mikel agent).
- Add a Scouting tab (parked).

## After Claude Design returns

Use **Handoff to Claude Code…** or download the project as a ZIP. Save the export at:

```
/Users/naheljarmakani/fairplai-app/.claude/claude-design-pack-2/Handoffs/match-center/
```

Then tell me **"match center pack is in"** and I'll implement straight from the design.

---

## File index

```
.
├── README-START-HERE.md                 ← this file
├── PROMPT-MATCH-CENTER.md               ← brief 1: Match Center + Highlights
├── PROMPT-IDP.md                        ← brief 2: IDP editor + list
├── PROMPT-RECORD.md                     ← brief 3: Prep form (standalone + inline)
├── brand/
│   ├── BRAND-REFERENCE.md               ← palette + typography + discipline
│   └── globals.css                      ← every --brand-* CSS var
├── reference-builds/
│   ├── 01-player-profile-filmstrip.html ← rendered design from prior round
│   ├── 02-direction-c-filmstrip-source.jsx ← JSX source for the filmstrip pattern
│   └── 03-player-shared-helpers.jsx     ← shared helpers (formatting, colours)
├── types-and-data/
│   └── types.ts                         ← TypeScript types for real data shape
└── screenshots/                          ← drop screenshots here before sending
```
