'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS, LanguageCode, UserSettings } from '@/types/settings'
import { loadSettings, saveSettings } from '@/lib/storage'

interface SettingsContextValue {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  setLanguage: (language: LanguageCode) => void
  isLoaded: boolean
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const loaded = loadSettings()
      setSettings(loaded)
    } catch (error) {
      console.error('Failed to initialize settings:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.dataset.theme = settings.theme
    root.dataset.textSize = settings.textSize
    root.style.setProperty('color-scheme', settings.theme === 'light' ? 'light' : 'dark')
  }, [settings.theme, settings.textSize])

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      saveSettings(next)
      return next
    })
  }

  const setLanguage = (language: LanguageCode) => {
    updateSettings({ language })
  }

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    updateSettings,
    setLanguage,
    isLoaded
  }), [settings, isLoaded])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
