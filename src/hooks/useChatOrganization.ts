'use client'

import { useState, useEffect } from 'react'
import { Chat, ChatFolder } from '@/types/chat'

const FOLDERS_STORAGE_KEY = 'clavi-chat-folders'
const FOLDER_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899']

export function useChatOrganization() {
  const [folders, setFolders] = useState<ChatFolder[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = () => {
    try {
      const stored = localStorage.getItem(FOLDERS_STORAGE_KEY)
      if (stored && stored.trim()) {
        try {
          const parsedFolders = JSON.parse(stored)
          if (Array.isArray(parsedFolders)) {
            setFolders(parsedFolders.map((folder: any) => ({
              ...folder,
              createdAt: new Date(folder.createdAt)
            })))
          } else {
            console.warn('Invalid folders data format, resetting to empty array')
            localStorage.removeItem(FOLDERS_STORAGE_KEY)
            setFolders([])
          }
        } catch (parseError) {
          console.error('Failed to parse folders data, clearing corrupted data:', parseError)
          localStorage.removeItem(FOLDERS_STORAGE_KEY)
          setFolders([])
        }
      }
    } catch (error) {
      console.error('Failed to load folders:', error)
      setFolders([])
    }
  }

  const saveFolders = (newFolders: ChatFolder[]) => {
    try {
      const jsonString = JSON.stringify(newFolders)
      localStorage.setItem(FOLDERS_STORAGE_KEY, jsonString)
      setFolders(newFolders)
    } catch (error) {
      console.error('Failed to save folders:', error)
      // If saving fails, at least update the state
      setFolders(newFolders)
    }
  }

  const createFolder = (name: string) => {
    const newFolder: ChatFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
      createdAt: new Date()
    }
    saveFolders([...folders, newFolder])
    return newFolder
  }

  const updateFolder = (folderId: string, updates: Partial<ChatFolder>) => {
    const updatedFolders = folders.map(folder =>
      folder.id === folderId ? { ...folder, ...updates } : folder
    )
    saveFolders(updatedFolders)
  }

  const deleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== folderId)
    saveFolders(updatedFolders)
  }

  const filterChats = (chats: Chat[]) => {
    if (!searchQuery) return chats

    const query = searchQuery.toLowerCase()
    return chats.filter(chat =>
      chat.title.toLowerCase().includes(query) ||
      chat.messages.some(msg =>
        msg.content.toLowerCase().includes(query)
      ) ||
      chat.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  const organizeChats = (chats: Chat[]) => {
    const filteredChats = filterChats(chats)
    const favorites = filteredChats.filter(chat => chat.isFavorite)
    const uncategorized = filteredChats.filter(chat => !chat.folderId && !chat.isFavorite)

    const folderGroups = folders.map(folder => ({
      folder,
      chats: filteredChats.filter(chat => chat.folderId === folder.id)
    })).filter(group => group.chats.length > 0)

    return {
      favorites,
      folderGroups,
      uncategorized
    }
  }

  const toggleFavorite = (chatId: string, chats: Chat[], updateChats: (chats: Chat[]) => void) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, isFavorite: !chat.isFavorite } : chat
    )
    updateChats(updatedChats)
  }

  const moveChatToFolder = (chatId: string, folderId: string | undefined, chats: Chat[], updateChats: (chats: Chat[]) => void) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, folderId } : chat
    )
    updateChats(updatedChats)
  }

  const addTagToChat = (chatId: string, tag: string, chats: Chat[], updateChats: (chats: Chat[]) => void) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId
        ? { ...chat, tags: [...(chat.tags || []), tag.trim()] }
        : chat
    )
    updateChats(updatedChats)
  }

  const removeTagFromChat = (chatId: string, tag: string, chats: Chat[], updateChats: (chats: Chat[]) => void) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId
        ? { ...chat, tags: chat.tags?.filter(t => t !== tag) }
        : chat
    )
    updateChats(updatedChats)
  }

  return {
    folders,
    searchQuery,
    setSearchQuery,
    createFolder,
    updateFolder,
    deleteFolder,
    organizeChats,
    toggleFavorite,
    moveChatToFolder,
    addTagToChat,
    removeTagFromChat,
    FOLDER_COLORS
  }
}