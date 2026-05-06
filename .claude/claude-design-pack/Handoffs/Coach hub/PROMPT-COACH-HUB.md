# Coach Hub — single direction

**Surface:** `/coach/web` — Coach's Hub (the landing tab)
**Variations:** one. Don't generate alternates.

## Concept

The Hub is **Coach Mikel** — an LLM agent — as the front door. A centered chat input is the hero. The coach asks; Mikel answers with rich responses (text, embedded clip cards, embedded composite chips, embedded player chips). Every other coach surface (Match Center / Players / Highlights) is reachable when Mikel chooses to link there.

This is the same product family as the existing Match Center / Highlights / Squad surfaces — sand-first / indigo / yellow. Don't invent new chrome.

## Anchors (build exactly these, no more)

1. **Hero**
   - Display headline: `Ask Mikel anything.`
   - Below it, one short sub-line in body: `Match prep, player insight, reels — just ask.`
   - Centered chat input below — large, sand-paper background, indigo border.

2. **Suggestion chip strip** above the input — 4–6 starter prompts in mono-eyebrow style (e.g. `WHO NEEDS PREP THIS WEEK?`, `WHAT WAS OUR WEAKNESS VS AL WASL?`, `BUILD A 5-CLIP REEL ON SAEED'S PRESSING`, `MOTM THIS MONTH?`). Tap a chip → fills the input.

3. **A single Mikel response card** below the input — pre-populated as a demo so the surface is never empty when the coach lands. Show: a short Mikel reply (3–5 lines), one embedded clip card, one embedded player chip, a `↗ Open match` link inside the answer. Mikel's avatar (small indigo circle, yellow star) anchors the top-left of the card.

4. **Tile rail** below the response — 3–4 small cards: `NEXT SESSION`, `LATEST MATCH`, `PLAYERS WHO NEED PREP`, `SEASON COMPOSITE`. Each is one stat (display font, big number) + one mono eyebrow + one body line. Tappable, links to the relevant surface.

## Brand chrome

- Surface: `#EEE4C8` (brand-sand)
- Ink: `#1B1550` (brand-indigo) — all readable text
- Accent: `#FCD718` (brand-yellow) — Mikel's avatar star, suggestion-chip hover, highlight pill on key Mikel-response embeds. Keep ≤6% of the screen.
- TYPE.display ("Anton" stand-in for Clash Display) — hero only
- TYPE.body ("Inter" stand-in for Satoshi) — Mikel's reply, body copy
- TYPE.mono ("JetBrains Mono" stand-in for Fragment Mono) — eyebrows, suggestion chips, tile labels

## Out of scope

- Real LLM streaming or model integration — the response card is a static mock. We're testing the surface, not the conversation.
- Multi-turn history. Show one current response only.
- Settings, account, billing — none of that lives on the Hub.

## Reference surfaces (in this same handoff repo if available)

- Match Center + Highlights direction → coach surface vocabulary
- Player profile filmstrip → embedded-clip card pattern
