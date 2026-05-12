# FairplAI — project conventions for Claude

## Styling: Tailwind CSS, not inline styles

**All new components use Tailwind utility classes via `className`.** Do NOT add new `style={{ ... }}` blocks for static styling.

The codebase has Tailwind 4 configured. Brand design tokens (`--brand-sand`, `--brand-indigo`, etc.) are exposed as utility classes (`bg-brand-sand`, `text-brand-indigo`) via the `@theme` block in `src/app/globals.css`. Runtime palette switching via `<html data-theme="...">` works identically for Tailwind utilities and inline styles, because both resolve through the same CSS variables.

Reference: `docs/tailwind-cheatsheet.md` — every brand token, font, spacing rule, and common conversion pattern.

### When inline `style={}` IS still correct

Three cases only:

1. **Computed gradients** — `background: linear-gradient(135deg, ${color1}, ${color2})` where stops depend on runtime props.
2. **Computed transforms** — `transform: \`translateX(${offsetPx}px)\`` where the px value comes from state.
3. **CSS variables for nested theming** — when a component needs to set a `--my-var: value` for descendants to consume.

Everything else: Tailwind.

### The hover pattern

Stop using `onMouseEnter` + `onMouseLeave` + `useState(hovered)` + conditional `style`. Replace with the `hover:` Tailwind prefix:

```tsx
// ❌ old pattern
const [hover, setHover] = useState(false)
<div
  onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
  style={{ background: hover ? 'var(--brand-paper-hi)' : 'var(--brand-paper)' }}
>

// ✅ new pattern
<div className="bg-brand-paper hover:bg-brand-paper-hi transition-colors">
```

The state hook and the JS handlers get deleted entirely.

## Legacy code

Most of the codebase (~246 files, 6,700+ inline-style instances) was built before this convention. **Don't speculatively migrate.** The active migration scope is the redesigned surfaces only:

- `src/app/coach/web/**`
- `src/app/parent/**`
- `src/app/demo-admin/**`
- `src/components/coach/**`, `src/components/parent/**`, `src/components/shared/**` — but only files imported by the above.

For everything else (`src/app/admin/**`, legacy `src/app/coach/*` non-`web` routes, `src/app/facility/**`, auth flows, `src/components/user-testing/**`):

- **Migrate on touch**: if a PR opens one of those files for an unrelated reason, convert that file's inline styles in the same commit.
- Otherwise, leave alone.

Full plan: `/Users/naheljarmakani/.claude/plans/okay-let-s-continue-on-lexical-spindle.md`.

## Shared UI primitives

After Phase 1 ships, prefer the primitives in `src/components/ui/` (Button, Card, Pill, Input, etc.) over raw HTML elements with manual styling. This is how design-system enforcement actually works in practice — the component owns the styling tokens, not each consumer.

## Conditional classes

Use `clsx` for any conditional class composition:

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

Prettier (`.prettierrc.json`) auto-sorts these classes on save via the `prettier-plugin-tailwindcss` plugin.

## Runtime palette switching

Every brand-* utility automatically follows the active palette. Five palettes are live (set via `<html data-theme="...">`): `touchline` (default), `almanac`, `cloudline`, `twilight`, `programme`. When you build a new component, walk through all five palettes during review — the visual should hold up in each.
