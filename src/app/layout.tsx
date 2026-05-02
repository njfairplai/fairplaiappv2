import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { FeedbackProvider } from '@/contexts/FeedbackContext'
import FloatingNav from '@/components/ui/FloatingNav'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FairPlai — Youth Football Analytics',
  description: 'AI-powered youth football analytics platform for the GCC market',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1B1650',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#1B1550" />
        {/*
          Type systems for the 5-palette user-testing flow. Each palette in
          [data-theme="..."] picks one of 3 systems via --font-display /
          --font-body / --font-mono CSS vars; the actual font files are
          loaded once below so any palette can use any of them without a
          flash.

          System 1 — Almanac, Cloudline:        Clash Display + Satoshi + Fragment Mono
          System 2 — Voltage:                   Boldonse + Switzer + JetBrains Mono
          System 3 — Stadia, Meadow:            Instrument Serif + Inter Tight + JetBrains Mono
        */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&f[]=clash-display@500,600,700&f[]=switzer@400,500,600,700&display=swap"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fragment+Mono&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif&family=Inter+Tight:wght@400;500;600;700&family=Boldonse&display=swap"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <AuthProvider><FeedbackProvider>{children}<FloatingNav /></FeedbackProvider></AuthProvider>
      </body>
    </html>
  )
}
