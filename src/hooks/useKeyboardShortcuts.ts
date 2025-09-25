import { useEffect, useCallback } from 'react'

interface KeyboardShortcutProps {
  onNewChat: () => void
  onToggleSearch: () => void
  onFocusInput: () => void
  onEscape: () => void
}

export function useKeyboardShortcuts({
  onNewChat,
  onToggleSearch,
  onFocusInput,
  onEscape
}: KeyboardShortcutProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { ctrlKey, metaKey, key, target } = event
    const isModifier = ctrlKey || metaKey
    const isInputElement = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement

    // Escape key - always works
    if (key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }

    // Skip shortcuts when typing in input elements (except for specific cases)
    if (isInputElement && key !== 'Escape') {
      return
    }

    // Ctrl/Cmd + N - New chat
    if (isModifier && key === 'n') {
      event.preventDefault()
      onNewChat()
      return
    }

    // Ctrl/Cmd + K - Focus input / Quick command
    if (isModifier && key === 'k') {
      event.preventDefault()
      onFocusInput()
      return
    }

    // Ctrl/Cmd + / - Toggle search panel
    if (isModifier && key === '/') {
      event.preventDefault()
      onToggleSearch()
      return
    }

    // Ctrl/Cmd + Shift + S - Toggle search panel (alternative)
    if (isModifier && event.shiftKey && key === 'S') {
      event.preventDefault()
      onToggleSearch()
      return
    }
  }, [onNewChat, onToggleSearch, onFocusInput, onEscape])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    shortcuts: [
      { key: 'Ctrl+N / Cmd+N', action: 'New Chat' },
      { key: 'Ctrl+K / Cmd+K', action: 'Focus Input' },
      { key: 'Ctrl+/ / Cmd+/', action: 'Toggle Search' },
      { key: 'Escape', action: 'Close/Cancel' }
    ]
  }
}