'use client'

import { CustomGPT } from '@/types/mygpt'
import { ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface GPTCardProps {
  gpt: CustomGPT
  onChat: (gpt: CustomGPT) => void
  onEdit: (gpt: CustomGPT) => void
  onDelete: (gptId: string) => void
}

export default function GPTCard({ gpt, onChat, onEdit, onDelete }: GPTCardProps) {
  return (
    <div className="bg-gpt-gray-800 rounded-xl p-6 hover:bg-gpt-gray-700 transition-colors group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
          {gpt.avatar || gpt.name[0].toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate">{gpt.name}</h3>
          <p className="text-gpt-gray-400 text-sm mb-3 line-clamp-2">{gpt.description}</p>
          
          {gpt.conversationStarters.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gpt-gray-500 mb-2">Try:</div>
              <div className="text-sm text-gpt-gray-300 italic">
                "{gpt.conversationStarters[0]}"
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {gpt.capabilities.webBrowsing && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Web</span>
              )}
              {gpt.capabilities.codeInterpreter && (
                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Code</span>
              )}
              {gpt.capabilities.dalleImageGeneration && (
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Image</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(gpt)}
                className="p-2 text-gpt-gray-400 hover:text-white transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(gpt.id)}
                className="p-2 text-gpt-gray-400 hover:text-red-400 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onChat(gpt)}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-gpt-gray-600 hover:bg-gpt-gray-500 rounded-lg transition-colors"
      >
        <ChatBubbleLeftIcon className="w-4 h-4" />
        <span>Start chat</span>
      </button>
    </div>
  )
}