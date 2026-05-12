'use client'

import { useEffect, useState } from 'react'
import { Heart, Trophy, Zap } from 'lucide-react'
import { THEMES, applyTheme, readStoredTheme } from '@/lib/themes'
import { cn } from '@/lib/cn'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'
import Toggle from '@/components/ui/Toggle'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import Modal from '@/components/ui/Modal'
import { Eyebrow, Headline, Label } from '@/components/ui/typography'

/**
 * Dev-only UI gallery. Lists every primitive in every variant with a
 * palette switcher at the top so we can eyeball brand-token resolution
 * across all five palettes (touchline / almanac / cloudline / twilight /
 * programme) in one view.
 */
export default function UiDemoPage() {
  const [activePalette, setActivePalette] = useState<string>('touchline')
  const [toggleOn, setToggleOn] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [pill, setPill] = useState<string | null>('match')

  useEffect(() => {
    const stored = readStoredTheme()
    setActivePalette(stored)
    applyTheme(stored)
  }, [])

  function pick(id: string) {
    setActivePalette(id)
    applyTheme(id)
  }

  return (
    <main className="min-h-screen bg-brand-sand px-6 py-10 font-satoshi text-brand-indigo">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <header className="space-y-3">
          <Eyebrow>FAIRPLAI · UI GALLERY</Eyebrow>
          <Headline size="lg">Brand primitives</Headline>
          <p className="max-w-2xl text-base text-brand-indigo-mute">
            Every component in <code className="font-fragment text-sm">src/components/ui/</code> rendered against the active palette. Use the switcher below to cycle through palettes and confirm tokens resolve cleanly.
          </p>
        </header>

        {/* Palette switcher */}
        <section className="space-y-3">
          <Eyebrow>PALETTE</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <Pill
                key={t.id}
                variant={t.id === activePalette ? 'active' : 'default'}
                onClick={() => pick(t.id)}
              >
                {t.name}
              </Pill>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <Section title="Button" subtitle="variant × size">
          <div className="space-y-4">
            {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
              <div key={variant} className="flex items-center gap-3">
                <Eyebrow className="w-24 text-left">{variant.toUpperCase()}</Eyebrow>
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant} size="md">
                  Medium
                </Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <Eyebrow className="w-24 text-left">FULL WIDTH</Eyebrow>
              <Button variant="primary" fullWidth>
                Submit feedback
              </Button>
            </div>
          </div>
        </Section>

        {/* Pills */}
        <Section title="Pill" subtitle="chip / tag / multi-select">
          <div className="flex flex-wrap gap-2">
            {(['default', 'active', 'kill', 'subtle'] as const).map((v) => (
              <Pill key={v} variant={v}>
                {v}
              </Pill>
            ))}
            <Pill variant="default" size="sm">
              small
            </Pill>
            <Pill as="span" variant="subtle">
              static label
            </Pill>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['match', 'timeline', 'clip', 'squad'].map((id) => (
              <Pill
                key={id}
                variant={pill === id ? 'active' : 'default'}
                onClick={() => setPill(pill === id ? null : id)}
              >
                {id}
              </Pill>
            ))}
            <span className="self-center font-fragment text-xs text-brand-indigo-mute">
              ↑ live: {pill ?? 'none'}
            </span>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card" subtitle="paper / dark / gradient · padding scale">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card padding="md">
              <Eyebrow>DEFAULT</Eyebrow>
              <Headline size="sm" className="mt-2">
                Paper card
              </Headline>
              <p className="mt-2 text-sm text-brand-indigo-mute">
                Follows the active palette via <code className="font-fragment text-xs">bg-brand-paper</code>.
              </p>
            </Card>
            <Card variant="dark" padding="md">
              <Eyebrow className="text-white/60">DARK</Eyebrow>
              <Headline size="sm" className="mt-2 text-white">
                Gradient card
              </Headline>
              <p className="mt-2 text-sm text-white/70">
                Fixed indigo gradient (legacy, palette-independent).
              </p>
            </Card>
            <Card variant="gradient" padding="md">
              <Eyebrow className="text-white/60">GRADIENT</Eyebrow>
              <Headline size="sm" className="mt-2 text-white">
                Deeper gradient
              </Headline>
              <p className="mt-2 text-sm text-white/70">For hero panels.</p>
            </Card>
          </div>
        </Section>

        {/* Form */}
        <Section title="Form inputs" subtitle="Input · Textarea · Label · Toggle">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="demo-email">EMAIL</Label>
              <Input id="demo-email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="demo-invalid">PASSWORD (invalid)</Label>
              <Input id="demo-invalid" type="password" invalid defaultValue="too short" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="demo-missing">WHAT&apos;S MISSING?</Label>
              <Textarea id="demo-missing" placeholder="Features, info, interactions..." />
            </div>
            <div className="flex items-center gap-3">
              <Toggle value={toggleOn} onChange={setToggleOn} aria-label="Demo toggle" />
              <span className="font-satoshi text-sm">
                Toggle is <strong>{toggleOn ? 'on' : 'off'}</strong>
              </span>
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badge" subtitle="status badges (semantic colours)">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </Section>

        {/* Avatars */}
        <Section title="Avatar" subtitle="initials fallback · size scale">
          <div className="flex flex-wrap items-end gap-4">
            <Avatar firstName="Nahel" lastName="Jarmakani" size={32} />
            <Avatar firstName="Nahel" lastName="Jarmakani" size={48} />
            <Avatar firstName="Nahel" lastName="Jarmakani" size={64} />
            <Avatar firstName="Nahel" lastName="Jarmakani" size={96} />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" subtitle="Eyebrow · Headline · body · code">
          <div className="space-y-3">
            <Eyebrow>SECTION EYEBROW · TRACKING-WIDE</Eyebrow>
            <Headline size="lg" as="h1">
              Headline lg (h1)
            </Headline>
            <Headline size="md" as="h2">
              Headline md (h2)
            </Headline>
            <Headline size="sm" as="h3">
              Headline sm (h3)
            </Headline>
            <p className="text-base text-brand-indigo">
              Body text (Satoshi). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="text-sm text-brand-indigo-mute">Mute / caption (Satoshi smaller).</p>
            <code className="font-fragment text-sm text-brand-indigo">
              const inline_mono = "var(--font-fragment)"
            </code>
          </div>
        </Section>

        {/* Empty state + skeletons */}
        <Section title="EmptyState · SkeletonLoader" subtitle="placeholders">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card padding="md">
              <EmptyState
                title="No responses yet"
                description="Submit one through the user testing flow and reload."
                action={
                  <Button variant="primary" size="sm">
                    Open form
                  </Button>
                }
              />
            </Card>
            <Card padding="md" className="space-y-3">
              <Eyebrow>LOADING</Eyebrow>
              <SkeletonLoader height={20} />
              <SkeletonLoader height={20} width="80%" />
              <SkeletonLoader height={20} width="60%" />
              <SkeletonLoader height={80} borderRadius={10} />
            </Card>
          </div>
        </Section>

        {/* Modal */}
        <Section title="Modal" subtitle="backdrop blur · brand-paper body">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Modal title">
            <p className="text-sm text-brand-indigo-mute">
              Modal body. The backdrop blurs everything behind, and click-out closes.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </Modal>
        </Section>

        <footer className="border-t border-brand-line pt-6 text-sm text-brand-indigo-mute">
          Reference: <code className="font-fragment">docs/tailwind-cheatsheet.md</code> for utility class names. Primitives live in <code className="font-fragment">src/components/ui/</code>.
        </footer>
      </div>
    </main>
  )
}

interface SectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

function Section({ title, subtitle, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <Headline size="sm" as="h2">
          {title}
        </Headline>
        {subtitle && (
          <p className="font-fragment text-xs uppercase tracking-[0.18em] text-brand-indigo-mute">
            {subtitle}
          </p>
        )}
      </div>
      <div className={cn('rounded-xl border border-brand-line bg-brand-paper p-5')}>
        {children}
      </div>
    </section>
  )
}
