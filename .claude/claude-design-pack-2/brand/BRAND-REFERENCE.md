# Fair Play — Brand Reference

Source: https://fairplai.framer.website/

The redesign should align with this visual language — warm sand background, deep navy, bold editorial typography, layered card compositions with subtle rotation.

---

## Color tokens (extracted from the live page CSS)

| Hex | Use |
|---|---|
| `#1B1550` | **Primary navy.** Body backgrounds (dark sections), nav bar, headline text on sand. The dominant "brand color." |
| `#EEE4C8` | **Sand / cream.** The signature warm background. Body text on navy. Button backgrounds on the dark nav. |
| `#063D30` | **Forest green.** Secondary surface — used as alternate dark section background or accent. |
| `#FCD718` | **Yellow accent.** The hand-drawn scribble decoration (e.g. checkmark next to images). Use sparingly as a highlight. |
| `#EB4D6D` | **Coral / pink accent.** Used sparingly — likely for badges, alerts, or callouts. |
| `#020202` | Near-black for the highest-contrast text. |
| `#000000` | Pure black (used in deep shadow stacks). |

### Suggested semantic mapping for the app

- `--brand-navy: #1B1550;` (replaces existing `COLORS.navy: #1B1650` — note: the existing app value is one digit off; align to the landing page)
- `--brand-sand: #EEE4C8;` (new)
- `--brand-forest: #063D30;` (new — for alternate dark sections)
- `--brand-yellow: #FCD718;` (new — sparingly used accent)
- `--brand-coral: #EB4D6D;` (new — for warnings/alerts/badges)

The current app's indigo `#4A4AFF` and electric navy `#282689` aren't used on the landing page. They feel cooler / more "tech." The redesign should pull toward the warmer navy + sand combo for visual coherence.

---

## Typography

The landing page loads custom WOFF2 files from `framerusercontent.com` (Framer hosts custom typefaces with hashed filenames so the exact names don't appear in CSS). Plus Fragment Mono (Google Fonts) and Inter as fallback.

**Per the founder, the brand uses:**
- **Clash Display** — the loud uppercase display font for hero headlines like "THE NEXT GENERATION OF PERFORMANCE" and "YOU TRAIN YOUR PLAYERS. WE ANALYZE THEIR GAME." Heavy weight, slightly condensed feel.
- **Satoshi** — body copy, navigation, buttons. Clean modern geometric sans.

**Visually verified usage on the page:**
1. **Loud display headlines** — uppercase, very heavy weight, near-condensed. Used at hero scale (≥56px). E.g. "THE NEXT GENERATION OF PERFORMANCE."
2. **Soft display headlines** — sentence-case, lighter weight, slightly more humanist letterforms. Used for second-tier headlines like "Development, made visible." Possibly Clash Display Medium or a different weight of the same family.
3. **Body copy** — clean modern sans, modest weight (~400–500), set at ~18–20px. Used for descriptive paragraphs.
4. **Nav / buttons** — same body sans, slightly heavier weight (~600), set at smaller size.
5. **Eyebrow labels** — uppercase, letter-spaced, small. E.g. "ABOUT US", "AI PERFORMANCE ANALYST" above the soft headline.

### Suggested CSS

```css
:root {
  --font-display: 'Clash Display', system-ui, sans-serif;
  --font-body: 'Satoshi', system-ui, sans-serif;
  --font-mono: 'Fragment Mono', ui-monospace, monospace;
}
```

Weights to load (minimum):
- Clash Display: 500, 600, 700 (hero), maybe 800 if available
- Satoshi: 400 (body), 500, 600 (nav/buttons), 700 (emphasis)

---

## Component patterns

### Buttons
- **Pill-shaped**, fully rounded (border-radius matches the height — ~9999px / "fully rounded").
- Two primary variants:
  - **On sand bg:** navy fill + sand text. E.g. the hero "Book a Demo" CTA.
  - **On navy bg:** sand fill + navy text. E.g. the nav buttons.
- Generous padding: roughly `12–14px vertical / 24–28px horizontal`.

### Nav bar
- Fixed pill-container at the top: navy outer pill containing sand-filled inner pill buttons.
- Logo "FAIRPL.AI" at left in sand.

### Image cards
- **Rounded corners**, ~16–24px radius.
- **Subtle drop shadow** (soft, large blur, mild opacity).
- **Slight rotation** (~2–6°) on hero cards — they overlap and angle differently to feel layered/editorial rather than gridded.
- **Hand-drawn yellow scribble** decoration occasionally placed at card corners for personality.

### Section structure
1. **Hero** — sand bg, huge condensed display headline left, layered rotated image cards right, CTA below.
2. **About Us** — navy bg, sand text, single image card (slight rotation), with yellow scribble decoration.
3. **AI Performance Analyst** — navy bg, sand text, eyebrow label + soft headline, large radar-chart visual right.
4. **(other sections)** — alternate sand and navy backgrounds; the contrast carries the rhythm.

---

## Tone & feel

- **Editorial, not corporate.** The headlines feel like a magazine cover, not a SaaS dashboard.
- **Warm, not sterile.** Sand softens the deep navy; warm yellow scribbles add humanity.
- **Confident.** Type is large, statements are short ("Cameras live at your facility. Every player tracked. Every session scored.").
- **Layered, not flat.** Rotated image cards, drop shadows, overlapping elements — depth and motion implied.

The current app feels colder, flatter, and more "dashboard." The redesign should keep functional clarity but borrow the editorial confidence and warmth.

---

## Out of scope for this brand reference

- Motion specs (transitions, hover states) — Framer handles those natively; we'll add app-side equivalents during implementation.
- Specific spacing scale — derive from screenshots during implementation.
- Iconography — the landing page uses minimal icons; the app will need a coherent icon set, but that's a separate decision.
