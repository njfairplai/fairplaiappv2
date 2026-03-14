# Match Prep Workflow + Record Screen Cleanup

## Context

The Prep tab currently uses a single drill-planning workflow for ALL sessions. But training sessions and competitive matches need fundamentally different prep. The user wants:
- **Training sessions** → existing drill workflow (keep as-is)
- **Match sessions** → NEW workflow: squad size → formation → lineup on pitch → game plan → save

Additionally, the Record screen labels ("Drill"/"Match") are confusing — training sessions should say "Training Session" not "Drill".

---

## File Changes

| File | Action | ~Lines |
|------|--------|--------|
| `src/lib/formations.ts` | **CREATE** | ~120 |
| `src/components/coach/MatchPrepFlow.tsx` | **CREATE** | ~450 |
| `src/app/coach/insights/page.tsx` | **MODIFY** | +15 lines (branch logic) |
| `src/app/coach/record/page.tsx` | **MODIFY** | ~10 lines (label cleanup) |

---

## Step 1: Create `src/lib/formations.ts`

Formation data with position coordinates for pitch visualization.

```typescript
export type SquadSize = 5 | 7 | 9 | 11

export interface FormationPosition {
  role: string   // GK, CB, LB, CM, ST, etc.
  x: number      // % across pitch (0=left, 100=right)
  y: number      // % down pitch (0=own goal, 100=opponent goal)
}

export interface Formation {
  id: string
  label: string
  squadSize: SquadSize
  positions: FormationPosition[]
}
```

Formations to define:
- **5-a-side**: 1-2-1, 2-1-1, 1-1-2
- **7-a-side**: 2-3-1, 3-2-1, 2-1-2-1
- **9-a-side**: 3-3-2, 3-2-3, 2-4-2
- **11-a-side**: 4-3-3, 4-4-2, 3-5-2, 4-2-3-1

Each includes GK at position `{x:50, y:5}`.

---

## Step 2: Create `src/components/coach/MatchPrepFlow.tsx`

Props: `session`, `rosterPlayers` (Player[]), `onBack`, `onSave`

### Step 1 of 4 — Squad Size
- 4 large tappable cards: 5-a-side, 7-a-side, 9-a-side, 11-a-side
- Tapping auto-advances to formation selection

### Step 2 of 4 — Formation
- Show formations for selected squad size
- Each option: card with formation label + mini pitch diagram (dots at positions)
- "Next" button after selection

### Step 3 of 4 — Lineup
- **Top**: Portrait pitch (aspect-ratio 2:3, green background reusing `PitchHeatmap` styles from `src/components/coach/PitchHeatmap.tsx`)
- Position markers as 36px circles at formation coordinates
- Empty = role label (e.g. "CB"), filled = jersey number + first name
- **Bottom**: Scrollable player list (maxHeight ~240px)
- **Interaction**: Tap-to-assign (tap position → tap player). Already-assigned players shown dimmed.
- Auto-sort: players matching the tapped position's role shown first

### Step 4 of 4 — Game Plan
- Three text areas: Playing Style, Set Pieces, Tactical Notes
- "Review Plan" button

### Review & Save
- Summary: formation viz with assigned players, game plan text
- "Save Match Plan" green button → calls `onSave()`

---

## Step 3: Modify Prep landing (`src/app/coach/insights/page.tsx`)

Add branching when a session is tapped:
- `session.type === 'match'` or `'training_match'` → render `<MatchPrepFlow />`
- `session.type === 'drill'` → existing training flow

Add state: `matchPrepSessionId`. If set, render MatchPrepFlow instead of the training steps.

---

## Step 4: Clean up Record screen (`src/app/coach/record/page.tsx`)

Update `SessionTypeIcon` label mapping:
- `drill` → "Training"
- `match` → "Match"
- `training_match` → "Friendly"

Update session card display:
- Matches: "vs [Opponent]" prominently
- Training: show "Training Session" instead of roster name alone
- Confirm step type buttons: use clearer labels

---

## Implementation Order

1. `src/lib/formations.ts` — formation data
2. `src/components/coach/MatchPrepFlow.tsx` — the full match prep component
3. `src/app/coach/insights/page.tsx` — branch logic on landing
4. `src/app/coach/record/page.tsx` — label cleanup
5. Verify end-to-end in preview

## Verification

1. Navigate to Prep tab → tap a **Training Session** → should go to existing drill workflow
2. Tap a **Match** (e.g. vs Dubai SC) → should enter match prep flow
3. Step 1: select 11-a-side → auto-advance
4. Step 2: select 4-3-3 formation → see mini pitch diagrams → Next
5. Step 3: tap a position on pitch → player list highlights best-fit players → tap player → assigned
6. Step 4: enter game plan text → Review Plan
7. Review: see formation with players, game plan → Save → back to landing with "Prepped" badge
8. Record tab: session labels say "Training" / "Match" / "Friendly" (not "Drill")
9. No console errors
