'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type CoachThemeMode = 'light' | 'dark'

export interface CoachThemeColors {
  // Page
  pageBg: string
  // Header / nav
  headerBg: string
  headerBorder: string
  tabBarBg: string
  tabBarBorder: string
  headerText: string
  headerTextMuted: string
  tabText: string
  tabTextActive: string
  tabIndicator: string
  // Cards
  cardBg: string
  cardBorder: string
  cardBgAlt: string
  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  textFaint: string
  // Controls
  controlBg: string
  controlBgActive: string
  controlBorder: string
  // Table
  tableHeaderBg: string
  tableRowEven: string
  tableRowOdd: string
  tableBorder: string
  // Hero
  heroBg: string
  heroBorder: string
  heroGlow: string
  // Overlays
  overlayBg: string
  overlayBorder: string
}

const lightColors: CoachThemeColors = {
  pageBg: '#F5F6FC',
  headerBg: '#FFFFFF',
  headerBorder: '#E8EAED',
  tabBarBg: '#F5F6FC',
  tabBarBorder: '#E8EAED',
  headerText: '#0F172A',
  headerTextMuted: '#64748B',
  tabText: '#64748B',
  tabTextActive: '#4A4AFF',
  tabIndicator: '#4A4AFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E8EAED',
  cardBgAlt: '#F8F9FC',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textFaint: '#94A3B8',
  controlBg: '#F1F5F9',
  controlBgActive: '#FFFFFF',
  controlBorder: '#E2E8F0',
  tableHeaderBg: '#F8FAFC',
  tableRowEven: '#FFFFFF',
  tableRowOdd: '#F8FAFC',
  tableBorder: '#E8EAED',
  heroBg: 'linear-gradient(135deg, #F8F9FC 0%, #EEF0FF 50%, #F5F0FF 100%)',
  heroBorder: '#E2E8F0',
  heroGlow: 'rgba(74,74,255,0.06)',
  overlayBg: '#FFFFFF',
  overlayBorder: '#E8EAED',
}

const darkColors: CoachThemeColors = {
  pageBg: '#0A0E1A',
  headerBg: '#0A0E1A',
  headerBorder: 'rgba(255,255,255,0.06)',
  tabBarBg: '#0F1629',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  headerText: '#F8FAFC',
  headerTextMuted: 'rgba(248,250,252,0.7)',
  tabText: 'rgba(248,250,252,0.5)',
  tabTextActive: '#FFFFFF',
  tabIndicator: '#4A4AFF',
  cardBg: '#0F1629',
  cardBorder: 'rgba(255,255,255,0.06)',
  cardBgAlt: 'rgba(255,255,255,0.02)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textFaint: '#475569',
  controlBg: 'rgba(255,255,255,0.04)',
  controlBgActive: 'rgba(255,255,255,0.1)',
  controlBorder: 'rgba(255,255,255,0.06)',
  tableHeaderBg: 'rgba(255,255,255,0.03)',
  tableRowEven: '#0F1629',
  tableRowOdd: 'rgba(255,255,255,0.015)',
  tableBorder: 'rgba(255,255,255,0.04)',
  heroBg: 'linear-gradient(135deg, #1a1f3a 0%, #0F1629 50%, #1a1230 100%)',
  heroBorder: 'rgba(255,255,255,0.06)',
  heroGlow: 'rgba(74,74,255,0.06)',
  overlayBg: '#0F1629',
  overlayBorder: 'rgba(255,255,255,0.06)',
}

interface CoachThemeContextValue {
  mode: CoachThemeMode
  colors: CoachThemeColors
  toggleTheme: () => void
  setTheme: (mode: CoachThemeMode) => void
}

const STORAGE_KEY = 'fairplai_coach_theme'

const CoachThemeContext = createContext<CoachThemeContextValue>({
  mode: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
})

export function useCoachTheme() {
  return useContext(CoachThemeContext)
}

export function CoachThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CoachThemeMode>('light')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CoachThemeMode | null
      if (saved === 'light' || saved === 'dark') setMode(saved)
    } catch { /* ignore */ }
  }, [])

  const setTheme = useCallback((newMode: CoachThemeMode) => {
    setMode(newMode)
    try { localStorage.setItem(STORAGE_KEY, newMode) } catch { /* ignore */ }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'light' ? 'dark' : 'light')
  }, [mode, setTheme])

  const colors = mode === 'light' ? lightColors : darkColors

  return (
    <CoachThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </CoachThemeContext.Provider>
  )
}
