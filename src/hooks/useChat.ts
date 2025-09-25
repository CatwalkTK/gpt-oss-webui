import { useState, useEffect, useRef } from 'react'
import { Chat, Message, FileAttachment } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { sendMessage, sendMessageWithGPT, parseSSEStream } from '@/lib/api'
import { sendMessageWithRAG, sendMessageWithGPTAndRAG } from '@/lib/ragApi'
import { documentIndexer } from '@/lib/documentIndexer'
import type { SearchResult } from '@/hooks/useVectorSearch'
import { saveChats, loadChats } from '@/lib/storage'
import { useSettings } from '@/context/SettingsContext'
import { showToast } from '@/components/ToastContainer'

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { settings } = useSettings()
  const languageMode = settings.language
  const useIndexedContext = settings.useIndexedContext

  const currentChat = chats.find(chat => chat.id === currentChatId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages, isLoading])

  useEffect(() => {
    const loadedChats = loadChats()
    setChats(loadedChats)
    if (loadedChats.length > 0) {
      setCurrentChatId(loadedChats[0].id)
    }
  }, [])

  useEffect(() => {
    saveChats(chats)
  }, [chats])

  const createNewChat = (): Chat => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    return newChat
  }

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId)
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null)
    }
  }

  const updateChats = (newChats: Chat[]) => {
    setChats(newChats)
  }

  const updateChatTitle = (chatId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '')
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ))
  }

  const sendChatMessage = async (content: string, selectedGPT: CustomGPT | null, attachments?: FileAttachment[]) => {
    let chatId = currentChatId
    if (!chatId) {
      const newChat = createNewChat()
      chatId = newChat.id
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      attachments,
      timestamp: new Date()
    }

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, userMessage], updatedAt: new Date() }
        : chat
    ))

    if (currentChat?.messages.length === 0) {
      updateChatTitle(chatId, content)
    }

    setIsLoading(true)

    try {
      let searchResults: SearchResult[] = []
      if (useIndexedContext) {
        try {
          searchResults = await documentIndexer.searchDocuments(content, 5)
        } catch (searchError) {
          console.warn('Vector search failed, falling back to direct chat:', searchError)
        }
      }

      const useRAG = useIndexedContext && searchResults.length > 0

      const stream = selectedGPT 
        ? useRAG
          ? await sendMessageWithGPTAndRAG(content, selectedGPT, currentChat?.messages || [], searchResults, attachments ?? [], languageMode)
          : await sendMessageWithGPT(content, selectedGPT, currentChat?.messages || [], attachments ?? [], languageMode)
        : useRAG
          ? await sendMessageWithRAG(content, searchResults, attachments ?? [], languageMode)
          : await sendMessage(content, attachments ?? [], languageMode)
      const sseStream = parseSSEStream(stream)
      const reader = sseStream.getReader()

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ))

      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (value.choices && value.choices[0] && value.choices[0].delta && value.choices[0].delta.content) {
          accumulatedContent += value.choices[0].delta.content
          
          setChats(prev => prev.map(chat => 
            chat.id === chatId 
              ? {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                }
              : chat
          ))
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)

      // Show toast notification
      let errorMsg = 'Failed to send message. Please try again.'
      if (languageMode === 'ja') {
        errorMsg = 'メッセージの送信に失敗しました。再試行してください。'
      }

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMsg = languageMode === 'ja'
            ? 'サーバーに接続できません。Ollamaが起動しているか確認してください。'
            : 'Cannot connect to server. Please check if Ollama is running.'
        } else if (error.message.includes('HTTP error')) {
          errorMsg = languageMode === 'ja'
            ? 'サーバーエラーが発生しました。しばらく待ってから再試行してください。'
            : 'Server error occurred. Please wait and try again.'
        }
      }

      showToast(errorMsg, 'error', 5000)

      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: languageMode === 'ja'
          ? 'エラーが発生しました。再試行してください。'
          : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }

      setChats(prev => prev.map(chat =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    messagesEndRef,
    createNewChat,
    selectChat,
    deleteChat,
    updateChats,
    sendChatMessage
  }
}
