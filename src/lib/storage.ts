import { Chat } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { STORAGE_KEYS } from './constants'

export function saveChats(chats: Chat[]): void {
  if (chats.length > 0) {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats))
  }
}

export function loadChats(): Chat[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CHATS)
    if (saved) {
      return JSON.parse(saved).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt)
      }))
    }
  } catch (e) {
    console.error('Failed to load chats:', e)
  }
  return []
}

export function saveCustomGPTs(gpts: CustomGPT[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_GPTS, JSON.stringify(gpts))
}

export function loadCustomGPTs(): CustomGPT[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_GPTS)
    if (saved) {
      return JSON.parse(saved).map((gpt: any) => ({
        ...gpt,
        createdAt: new Date(gpt.createdAt),
        updatedAt: new Date(gpt.updatedAt)
      }))
    }
  } catch (e) {
    console.error('Failed to load custom GPTs:', e)
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