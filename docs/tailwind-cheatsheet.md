# Tailwind cheatsheet — FairplAI brand tokens

Quick reference for the utility classes that map to our brand design tokens. **All tokens live in `src/app/globals.css` inside the `@theme` block**, and switch automatically when the runtime palette (`<html data-theme="...">`) changes — so `bg-brand-sand` follows whichever of Touchline / Almanac / Cloudline / Twilight / Programme is active. No double-source-of-truth, no inline `style={{ background: var(...) }}` needed.

## Colour utilities

Every `--color-brand-*` token in the @theme block produces three utilities: `bg-*`, `text-*`, and `border-*`.

| Token | CSS variable | Typical use |
|---|---|---|
| `brand-sand` | page background — base surface for the current palette | `bg-brand-sand` on `<main>` / page roots |
| `brand-sand-deep` | one shade darker than sand | hover state for sand-coloured surfaces |
| `brand-sand-deeper` | two shades darker | footers, low-emphasis panels |
| `brand-paper` | raised card surface, slightly different from sand | `bg-brand-paper` on `<Card>` |
| `brand-paper-hi` | hover state for paper-coloured cards | `hover:bg-brand-paper-hi` |
| `brand-indigo` | primary text + structural strokes | `text-brand-indigo`, `border-brand-indigo` |
| `brand-indigo-mid` | secondary text, sub-headings | `text-brand-indigo-mid` |
| `brand-indigo-soft` | very transparent indigo overlay (10%) | dividers, faint backgrounds |
| `brand-indigo-mute` | muted indigo (55% alpha) | placeholder text, captions |
| `brand-yellow` | accent — CTAs, active state, primary highlight | `bg-brand-yellow`, `text-brand-yellow` |
| `brand-yellow-soft` | yellow with ~18% alpha | recap banners, success-soft backgrounds |
| `brand-coral` | warning / negative-action colour | `text-brand-coral` for kill chips, errors |
| `brand-ink` | absolute deepest text (rare; use indigo first) | logo, highest-emphasis text |
| `brand-line` | hairline borders matching the palette | `border-brand-line` |
| `brand-line-soft` | even fainter divider | very subtle separation |
| `brand-cloud` | tertiary surface for training/match filmstrips | distinct card surface in lists |
| `brand-cloud-deep` | darker cloud | borders / dividers on cloud-coloured cards |

Plus legacy colour tokens (`deep-indigo`, `electric-navy`, `ahoy-blue`, `active-blue`, `periwinkle`, `fp-white`, `cloud`, `phantom`, `arsenic`, `graphite`) kept for back-compat — prefer `brand-*` for new code.

## Font utilities

| Utility | Maps to | Typical use |
|---|---|---|
| `font-clash` | Clash Display | headlines (h1, h2 in hero areas) |
| `font-satoshi` | Satoshi | body text, UI labels (default) |
| `font-fragment` | Fragment Mono | eyebrows, kicker labels, all-caps tracking text |
| `font-inter` | Inter | legacy — avoid in new code |

## Spacing scale (Tailwind defaults)

| Class | Pixels | Class | Pixels |
|---|---|---|---|
| `p-0` | 0 | `p-6` | 24 |
| `p-1` | 4 | `p-8` | 32 |
| `p-2` | 8 | `p-10` | 40 |
| `p-3` | 12 | `p-12` | 48 |
| `p-3.5` | 14 | `p-16` | 64 |
| `p-4` | 16 | `p-20` | 80 |
| `p-5` | 20 | `p-24` | 96 |

Same scale applies to `m-*`, `px-*`, `py-*`, `gap-*`, `space-x-*`, etc.

## Pseudo-classes (the JS-as-hover replacement)

Stop using `onMouseEnter` + `useState(hovered)`. Use these instead:

| Prefix | Use case |
|---|---|
| `hover:` | mouse over — `hover:bg-brand-paper-hi` |
| `focus:` | focus (mouse + keyboard) — generally use `focus-visible:` |
| `focus-visible:` | keyboard-only focus — `focus-visible:ring-2 focus-visible:ring-brand-indigo` |
| `active:` | pressed state — `active:scale-[0.98]` |
| `disabled:` | disabled — `disabled:opacity-50 disabled:cursor-not-allowed` |
| `group-hover:` | child reacts to parent's hover (parent needs `group` class) |

## Common conversion patterns

| Inline | Tailwind |
|---|---|
| `style={{ display: 'flex' }}` | `flex` |
| `style={{ display: 'grid' }}` | `grid` |
| `style={{ gap: 12 }}` | `gap-3` |
| `style={{ padding: '14px 16px' }}` | `px-4 py-3.5` |
| `style={{ borderRadius: 8 }}` | `rounded-lg` (8px) |
| `style={{ borderRadius: 12 }}` | `rounded-xl` (12px) |
| `style={{ borderRadius: 999 }}` | `rounded-full` |
| `style={{ border: '1px solid var(--brand-line)' }}` | `border border-brand-line` |
| `style={{ background: 'var(--brand-sand)' }}` | `bg-brand-sand` |
| `style={{ color: 'var(--brand-indigo)' }}` | `text-brand-indigo` |
| `style={{ fontFamily: 'var(--font-clash)' }}` | `font-clash` |
| `style={{ fontSize: 14 }}` | `text-sm` |
| `style={{ fontWeight: 700 }}` | `font-bold` |
| `style={{ letterSpacing: '0.22em' }}` | `tracking-[0.22em]` (arbitrary value) |
| `style={{ minHeight: '100vh' }}` | `min-h-screen` |
| `style={{ maxWidth: 880 }}` | `max-w-[880px]` (arbitrary value) |
| `style={{ position: 'fixed', top: 0, left: 0 }}` | `fixed top-0 left-0` |
| `style={{ transition: 'all 160ms ease' }}` | `transition-all duration-150` |

## When inline `style={}` IS still correct

Don't fight Tailwind for these — keep them inline:

- **Computed gradients**: `background: linear-gradient(135deg, ${a}, ${b})` where the stops are dynamic.
- **Computed transforms**: `transform: \`translateX(${offsetPx}px)\`` where the px value comes from state.
- **Animation keyframe classes** in `globals.css` (`ken-burns`, `fade-up-*`, `tab-fade`) — use the class name directly as `className="ken-burns"`.

## Combining classes conditionally

Install once: `npm install clsx` (already in the codebase if not).

```tsx
import { clsx } from 'clsx'

<button
  className={clsx(
    'rounded-lg border px-4 py-2 font-satoshi',
    active && 'bg-brand-indigo text-brand-sand',
    !active && 'bg-brand-paper text-brand-indigo hover:bg-brand-paper-hi',
    disabled && 'opacity-50 cursor-not-allowed',
  )}
>
```

Prettier (configured in `.prettierrc.json`) auto-sorts these classes on save.
