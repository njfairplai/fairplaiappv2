import type { Config } from 'tailwindcss'

/**
 * Tailwind v4 config — minimal stub.
 *
 * In v4, all real config (colour tokens, font tokens, spacing scale)
 * lives in `src/app/globals.css` via the @theme block. That's where
 * the brand-* utilities (bg-brand-sand, text-brand-indigo, etc.) and
 * the font-* utilities (font-clash, font-satoshi, font-fragment) are
 * generated from.
 *
 * This file exists so:
 *   1. The Tailwind VS Code IntelliSense extension can resolve and
 *      autocomplete utility names with their resolved colour values.
 *   2. eslint-plugin-tailwindcss can validate class names.
 *
 * Don't add `theme.extend` rules here — keep all design tokens in the
 * @theme block in globals.css as the single source of truth.
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
}

export default config
