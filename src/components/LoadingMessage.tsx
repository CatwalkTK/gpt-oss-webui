'use client'

import { CustomGPT } from '@/types/mygpt'
import { useState, useEffect } from 'react'

interface LoadingMessageProps {
  selectedGPT?: CustomGPT | null
}

export default function LoadingMessage({ selectedGPT }: LoadingMessageProps) {
  const [dots, setDots] = useState('')
  const [thinkingText, setThinkingText] = useState('Thinking')

  useEffect(() => {
    const thinkingMessages = [
      'Thinking', 
      'Analyzing', 
      'Processing', 
      'Understanding',
      selectedGPT ? `${selectedGPT.name} is thinking` : 'Thinking'
    ]

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
      if (Math.random() > 0.7) {
        setThinkingText(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)])
      }
    }, 500)

    return () => clearInterval(interval)
  }, [selectedGPT])

  return (
    <div className="flex gap-4 p-6 bg-gpt-gray-800">
      <div className="w-8 h-8 flex-shrink-0">
        {selectedGPT ? (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold animate-pulse">
            {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-sm font-bold">G</span>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gpt-gray-300">{thinkingText}{dots}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        {selectedGPT && (
          <div className="text-xs text-gpt-gray-400 mt-2">
            Using {selectedGPT.name}
          </div>
        )}
      </div>
    </div>
  )
}