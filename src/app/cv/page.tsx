'use client'

import Link from 'next/link'
import { User, Search } from 'lucide-react'

/* /cv — Digital CV demo portal
 *
 * Single landing page for the DOFA partnership demo. Two cards: one
 * to a sample player CV, one to the scout discovery view. Lets us
 * share a single URL (demo.fairpl.ai/cv) instead of asking people
 * to remember /p/saeed-khalifa and /scout separately.
 *
 * Read-only marketing surface. No state, no auth. Inherits the
 * Cloudline palette from :root.
 */

export default function CVPortalPage() {
  return (
    <div className="min-h-[100dvh] bg-brand-paper text-brand-indigo">
      <header className="flex items-center justify-center border-b border-brand-line px-4 py-3">
        <span className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.32em] text-brand-indigo">
          fairplai
        </span>
      </header>

      <main className="mx-auto max-w-[760px] px-5 pb-12 pt-10 md:pt-16">
        <section className="text-center">
          <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.28em] text-brand-indigo-mute">
            Digital CV · demo
          </div>
          <h1 className="m-0 mt-3 font-clash text-[40px] leading-[1.05] tracking-[-0.025em] text-brand-indigo md:text-[56px]">
            Pick a side.
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] font-satoshi text-[14px] leading-[1.55] text-brand-indigo-mid md:text-[15.5px]">
            Real player profiles. Real scout discovery. AI-verified data from
            match footage. Tap a card to walk through.
          </p>
        </section>

        <section className="mt-9 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
          {/* Card 1 — Player CV */}
          <Link
            href="/p/saeed-khalifa"
            className="group flex flex-col rounded-2xl border border-brand-line bg-brand-sand p-5 no-underline transition-colors hover:bg-brand-paper-hi md:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-indigo text-brand-sand">
                <User size={20} />
              </span>
              <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-indigo-mute">
                Player Digital CV
              </div>
            </div>
            <h2 className="m-0 mt-4 font-clash text-[24px] leading-[1.1] tracking-[-0.02em] text-brand-indigo md:text-[28px]">
              View Saeed&apos;s profile.
            </h2>
            <p className="m-0 mt-2.5 font-satoshi text-[13.5px] leading-[1.55] text-brand-indigo-mid">
              AI-verified composite score. Jersey-bib hero card. Season
              highlights. Shareable to scouts, clubs, and family.
            </p>
            <div className="mt-5 flex items-center gap-1.5 font-fragment text-[10.5px] font-bold uppercase tracking-[0.2em] text-brand-indigo">
              Open the CV
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>

          {/* Card 2 — Scout */}
          <Link
            href="/scout"
            className="group flex flex-col rounded-2xl border border-brand-line bg-brand-indigo p-5 text-brand-sand no-underline transition-colors hover:bg-brand-ink md:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-yellow text-brand-indigo">
                <Search size={20} />
              </span>
              <div className="font-fragment text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-sand/70">
                Scout discovery
              </div>
            </div>
            <h2 className="m-0 mt-4 font-clash text-[24px] leading-[1.1] tracking-[-0.02em] text-brand-sand md:text-[28px]">
              Discover talent.
            </h2>
            <p className="m-0 mt-2.5 font-satoshi text-[13.5px] leading-[1.55] text-brand-sand/75">
              Filter by position, age, score. Shortlist players you like.
              Express interest via the player&apos;s guardian. Free for
              verified scouts.
            </p>
            <div className="mt-5 flex items-center gap-1.5 font-fragment text-[10.5px] font-bold uppercase tracking-[0.2em] text-brand-yellow">
              Try the scout view
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </section>

        <footer className="mt-12 text-center font-fragment text-[9.5px] font-bold uppercase tracking-[0.22em] text-brand-indigo-mute md:mt-16">
          Built for DOFA partnership conversations · May 2026
        </footer>
      </main>
    </div>
  )
}
