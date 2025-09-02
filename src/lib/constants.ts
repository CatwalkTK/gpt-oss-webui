export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:11434',
  ENDPOINTS: {
    CHAT_COMPLETIONS: '/v1/chat/completions'
  },
  DEFAULT_MODEL: 'gpt-oss:20b',
  DEFAULT_TEMPERATURE: 0.7
} as const

export const REGEX_PATTERNS = {
  JAPANESE: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
  OFFICE_FILES: /\.(docx?|xlsx?|pptx?)$/i
} as const

export const FILE_TYPES = {
  IMAGE: 'image/',
  PDF: 'application/pdf',
  TEXT: 'text/'
} as const

export const STORAGE_KEYS = {
  CHATS: 'chats',
  CUSTOM_GPTS: 'customGPTs',
  SELECTED_GPT: 'selectedGPT',
  START_NEW_CHAT: 'startNewChat'
} as const