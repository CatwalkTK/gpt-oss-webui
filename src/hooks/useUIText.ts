'use client'

import { useSettings } from '@/context/SettingsContext'
import { getUIText } from '@/lib/uiStrings'
import type { LanguageCode } from '@/types/settings'

type Params = Record<string, string | number>

type UIKey = Parameters<typeof getUIText>[1]

type UITextHook = (key: UIKey, params?: Params) => string

export function useUIText(): UITextHook {
  const { settings } = useSettings()
  const language: LanguageCode = settings.language

  return (key, params) => getUIText(language, key, params)
}
