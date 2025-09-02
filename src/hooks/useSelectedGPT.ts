import { useState, useEffect } from 'react'
import { CustomGPT } from '@/types/mygpt'
import { loadSelectedGPT, clearSelectedGPT, getStartNewChatFlag, clearStartNewChatFlag } from '@/lib/storage'

export function useSelectedGPT(onNewChat: () => void) {
  const [selectedGPT, setSelectedGPT] = useState<CustomGPT | null>(null)

  useEffect(() => {
    const loadedGPT = loadSelectedGPT()
    const shouldStartNewChat = getStartNewChatFlag()
    
    if (loadedGPT) {
      setSelectedGPT(loadedGPT)
      clearSelectedGPT()
      
      if (shouldStartNewChat) {
        clearStartNewChatFlag()
        setTimeout(() => {
          onNewChat()
        }, 100)
      }
    }
  }, [onNewChat])

  const selectGPT = (gpt: CustomGPT | null) => {
    setSelectedGPT(gpt)
  }

  return {
    selectedGPT,
    selectGPT
  }
}