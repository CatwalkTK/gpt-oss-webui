import { Chat } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'

export interface ExportData {
  version: string
  timestamp: string
  chats: Chat[]
  customGPTs: CustomGPT[]
  metadata: {
    totalChats: number
    totalMessages: number
    exportDate: string
    appVersion: string
  }
}

export function exportChatHistory(chats: Chat[], customGPTs: CustomGPT[] = []): string {
  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0)

  const exportData: ExportData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    chats: chats.map(chat => ({
      ...chat,
      // Convert Date objects to ISO strings for JSON serialization
      createdAt: new Date(chat.createdAt).toISOString() as any,
      updatedAt: new Date(chat.updatedAt).toISOString() as any,
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp).toISOString() as any
      }))
    })),
    customGPTs,
    metadata: {
      totalChats: chats.length,
      totalMessages,
      exportDate: new Date().toLocaleDateString(),
      appVersion: '1.0.0'
    }
  }

  return JSON.stringify(exportData, null, 2)
}

export function downloadExport(data: string, filename?: string): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const defaultFilename = `clavi-chat-export-${timestamp}.json`

  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename || defaultFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export async function importChatHistory(file: File): Promise<{ chats: Chat[]; customGPTs: CustomGPT[]; metadata: any }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string
        const exportData: ExportData = JSON.parse(jsonData)

        // Validate the export data structure
        if (!exportData.version || !exportData.chats || !Array.isArray(exportData.chats)) {
          throw new Error('Invalid export file format')
        }

        // Convert ISO strings back to Date objects
        const chats: Chat[] = exportData.chats.map(chat => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))

        const customGPTs: CustomGPT[] = exportData.customGPTs || []

        resolve({
          chats,
          customGPTs,
          metadata: exportData.metadata
        })
      } catch (error) {
        reject(new Error(`Failed to parse export file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

export function validateImportData(chats: Chat[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!Array.isArray(chats)) {
    errors.push('Chats data must be an array')
    return { valid: false, errors }
  }

  for (let i = 0; i < chats.length; i++) {
    const chat = chats[i]

    if (!chat.id || typeof chat.id !== 'string') {
      errors.push(`Chat ${i + 1}: Missing or invalid ID`)
    }

    if (!chat.title || typeof chat.title !== 'string') {
      errors.push(`Chat ${i + 1}: Missing or invalid title`)
    }

    if (!Array.isArray(chat.messages)) {
      errors.push(`Chat ${i + 1}: Messages must be an array`)
    }

    if (!(chat.createdAt instanceof Date) || isNaN(chat.createdAt.getTime())) {
      errors.push(`Chat ${i + 1}: Invalid createdAt date`)
    }

    if (!(chat.updatedAt instanceof Date) || isNaN(chat.updatedAt.getTime())) {
      errors.push(`Chat ${i + 1}: Invalid updatedAt date`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}