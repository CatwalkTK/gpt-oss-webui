import { Chat } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { STORAGE_KEYS } from './constants'
import { UserSettings, DEFAULT_SETTINGS } from '@/types/settings'

const MAX_CHATS = 50 // Limit number of stored chats
const MAX_MESSAGES_PER_CHAT = 100 // Limit messages per chat

function trimChatsForStorage(chats: Chat[]): Chat[] {
  // Sort chats by updatedAt descending (most recent first)
  const sortedChats = [...chats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  // Take only the most recent chats
  const recentChats = sortedChats.slice(0, MAX_CHATS)

  // Trim messages in each chat to prevent excessive storage usage
  return recentChats.map(chat => ({
    ...chat,
    messages: chat.messages.slice(-MAX_MESSAGES_PER_CHAT) // Keep last N messages
  }))
}

function getStorageSize(): number {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

export function saveChats(chats: Chat[]): void {
  if (chats.length === 0) return

  try {
    const trimmedChats = trimChatsForStorage(chats)
    const dataToStore = JSON.stringify(trimmedChats)

    // Check if storage is getting full (5MB = ~5,000,000 characters)
    if (getStorageSize() > 4000000) { // 4MB threshold
      console.warn('LocalStorage approaching limit, cleaning up old chats')
      // Keep only the most recent 25 chats when storage is full
      const reducedChats = trimmedChats.slice(0, 25)
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(reducedChats))
    } else {
      localStorage.setItem(STORAGE_KEYS.CHATS, dataToStore)
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, performing emergency cleanup')

      try {
        // First, clear all other potential storage items to free space
        const keysToKeep = ['chats', 'customGPTs', 'selectedGPT']
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key)) {
            localStorage.removeItem(key)
          }
        }

        // Try with just 5 most recent chats with minimal messages
        const emergencyChats = chats
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 5)
          .map(chat => ({
            ...chat,
            messages: chat.messages.slice(-10) // Keep only last 10 messages
          }))

        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(emergencyChats))
        console.log(`Emergency cleanup completed: saved ${emergencyChats.length} chats`)
      } catch (secondError) {
        console.warn('Even emergency cleanup failed, clearing all chat data')
        // Clear everything related to chats
        localStorage.removeItem(STORAGE_KEYS.CHATS)
        localStorage.removeItem(STORAGE_KEYS.START_NEW_CHAT)

        // Try to save just an empty array to reset state
        try {
          localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify([]))
        } catch {
          // If even empty array fails, storage is critically full
          console.error('Storage critically full, unable to save any data')
        }
      }
    } else {
      console.error('Failed to save chats:', error)
    }
  }
}

export function loadChats(): Chat[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CHATS)
    if (saved && saved.trim()) {
      try {
        const parsedChats = JSON.parse(saved)
        if (Array.isArray(parsedChats)) {
          return parsedChats.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt)
          }))
        } else {
          console.warn('Chats data is not an array, clearing corrupted data')
          localStorage.removeItem(STORAGE_KEYS.CHATS)
          return []
        }
      } catch (parseError) {
        console.error('Failed to parse chats data, clearing corrupted data:', parseError)
        localStorage.removeItem(STORAGE_KEYS.CHATS)
        return []
      }
    }
  } catch (e) {
    console.error('Failed to load chats:', e)
    // Clear potentially corrupted data
    try {
      localStorage.removeItem(STORAGE_KEYS.CHATS)
    } catch (removeError) {
      console.error('Failed to remove corrupted chats data:', removeError)
    }
  }
  return []
}

export function saveCustomGPTs(gpts: CustomGPT[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_GPTS, JSON.stringify(gpts))
}

export function loadCustomGPTs(): CustomGPT[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_GPTS)
    if (saved && saved.trim()) {
      try {
        const parsedGPTs = JSON.parse(saved)
        if (Array.isArray(parsedGPTs)) {
          return parsedGPTs.map((gpt: any) => ({
            ...gpt,
            createdAt: new Date(gpt.createdAt),
            updatedAt: new Date(gpt.updatedAt)
          }))
        } else {
          console.warn('Custom GPTs data is not an array, clearing corrupted data')
          localStorage.removeItem(STORAGE_KEYS.CUSTOM_GPTS)
          return []
        }
      } catch (parseError) {
        console.error('Failed to parse custom GPTs data, clearing corrupted data:', parseError)
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_GPTS)
        return []
      }
    }
  } catch (e) {
    console.error('Failed to load custom GPTs:', e)
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_GPTS)
    } catch (removeError) {
      console.error('Failed to remove corrupted custom GPTs data:', removeError)
    }
  }
  return []
}

export function saveSelectedGPT(gpt: CustomGPT): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_GPT, JSON.stringify(gpt))
}

export function loadSelectedGPT(): CustomGPT | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_GPT)
    if (saved) {
      const gpt = JSON.parse(saved)
      return {
        ...gpt,
        createdAt: new Date(gpt.createdAt),
        updatedAt: new Date(gpt.updatedAt)
      }
    }
  } catch (e) {
    console.error('Failed to load selected GPT:', e)
  }
  return null
}

export function clearSelectedGPT(): void {
  localStorage.removeItem(STORAGE_KEYS.SELECTED_GPT)
}

export function setStartNewChatFlag(value: boolean): void {
  if (value) {
    localStorage.setItem(STORAGE_KEYS.START_NEW_CHAT, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEYS.START_NEW_CHAT)
  }
}

export function getStartNewChatFlag(): boolean {
  return localStorage.getItem(STORAGE_KEYS.START_NEW_CHAT) === 'true'
}

export function clearStartNewChatFlag(): void {
  localStorage.removeItem(STORAGE_KEYS.START_NEW_CHAT)
}

// Storage management utilities
export function getStorageInfo(): { used: number; limit: number; percentage: number } {
  const used = getStorageSize()
  const limit = 5000000 // 5MB typical localStorage limit
  const percentage = (used / limit) * 100

  return { used, limit, percentage }
}

export function clearOldChats(): void {
  try {
    const chats = loadChats()
    if (chats.length > 10) {
      // Keep only the 10 most recent chats
      const recentChats = chats
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10)

      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(recentChats))
      console.log(`Cleared old chats, kept ${recentChats.length} most recent`)
    }
  } catch (error) {
    console.error('Failed to clear old chats:', error)
  }
}

export function clearAllChats(): void {
  localStorage.removeItem(STORAGE_KEYS.CHATS)
  console.log('All chats cleared')
}

export function clearAllStorageData(): void {
  try {
    localStorage.clear()
    console.log('All localStorage data cleared')
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

export function performStorageCleanup(): void {
  console.log('Performing comprehensive storage cleanup...')

  try {
    // Clear all non-essential localStorage items
    const essentialKeys = ['chats', 'customGPTs', 'selectedGPT', 'settings']

    const keysToRemove: string[] = []
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && !essentialKeys.includes(key)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`Removed: ${key}`)
    })

    // Cleanup chats to keep only recent ones
    const chats = loadChats()
    if (chats.length > 5) {
      const recentChats = chats
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)
        .map(chat => ({
          ...chat,
          messages: chat.messages.slice(-20) // Keep last 20 messages per chat
        }))

      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(recentChats))
      console.log(`Cleaned up chats: kept ${recentChats.length} recent chats`)
    }

    const { used, limit, percentage } = getStorageInfo()
    console.log(`Storage cleanup complete. Usage: ${(used/1024/1024).toFixed(2)}MB (${percentage.toFixed(1)}%)`)

  } catch (error) {
    console.error('Storage cleanup failed:', error)
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export function loadSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (saved) {
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(saved)
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return DEFAULT_SETTINGS
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
}
