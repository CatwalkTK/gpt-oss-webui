export type LanguageCode =
  | 'auto'
  | 'ja'
  | 'fr'
  | 'it'
  | 'pt'
  | 'de'
  | 'en'
  | 'zh'
  | 'ko'
  | 'th'
  | 'vi'

export type ThemeMode = 'dark' | 'light'
export type SidebarPosition = 'left' | 'right'
export type TextSize = 'compact' | 'normal' | 'large'

export interface LanguageOption {
  code: LanguageCode
  label: string
  description?: string
}

export interface LanguageMetadata {
  label: string
  userInstruction?: string
  systemInstruction?: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'auto', label: 'Auto (Detect)' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' }
]

export const LANGUAGE_METADATA: Record<LanguageCode, LanguageMetadata> = {
  auto: {
    label: 'Auto (Detect)'
  },
  ja: {
    label: 'Japanese',
    userInstruction: '日本語で自然な表現を用いて回答してください。',
    systemInstruction: 'The user prefers responses in Japanese. Always reply in Japanese unless explicitly instructed otherwise.'
  },
  fr: {
    label: 'French',
    userInstruction: 'Please respond in French.',
    systemInstruction: 'Provide responses in French unless the user explicitly asks for another language.'
  },
  it: {
    label: 'Italian',
    userInstruction: 'Please respond in Italian.',
    systemInstruction: 'Provide responses in Italian unless the user explicitly asks for another language.'
  },
  pt: {
    label: 'Portuguese',
    userInstruction: 'Please respond in Portuguese.',
    systemInstruction: 'Provide responses in Portuguese unless the user explicitly asks for another language.'
  },
  de: {
    label: 'German',
    userInstruction: 'Please respond in German.',
    systemInstruction: 'Provide responses in German unless the user explicitly asks for another language.'
  },
  en: {
    label: 'English',
    userInstruction: 'Please respond in English.',
    systemInstruction: 'Provide responses in English unless the user explicitly asks for another language.'
  },
  zh: {
    label: 'Chinese',
    userInstruction: 'Please respond in Chinese.',
    systemInstruction: 'Provide responses in Chinese unless the user explicitly asks for another language.'
  },
  ko: {
    label: 'Korean',
    userInstruction: 'Please respond in Korean.',
    systemInstruction: 'Provide responses in Korean unless the user explicitly asks for another language.'
  },
  th: {
    label: 'Thai',
    userInstruction: 'Please respond in Thai.',
    systemInstruction: 'Provide responses in Thai unless the user explicitly asks for another language.'
  },
  vi: {
    label: 'Vietnamese',
    userInstruction: 'Please respond in Vietnamese.',
    systemInstruction: 'Provide responses in Vietnamese unless the user explicitly asks for another language.'
  }
}

export interface UserSettings {
  language: LanguageCode
  theme: ThemeMode
  sidebarPosition: SidebarPosition
  textSize: TextSize
}

export const DEFAULT_SETTINGS: UserSettings = {
  language: 'auto',
  theme: 'dark',
  sidebarPosition: 'left',
  textSize: 'normal'
}
