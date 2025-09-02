'use client'

import { useState } from 'react'
import { PlusIcon, ChatBubbleLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Chat } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  selectedGPT: CustomGPT | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export default function Sidebar({ chats, currentChatId, selectedGPT, onNewChat, onSelectChat, onDeleteChat }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gpt-gray-800 rounded-lg"
      >
        {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gpt-gray-900 border-r border-gpt-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer
                  transition-colors group
                  ${currentChatId === chat.id 
                    ? 'bg-gpt-gray-800 text-white' 
                    : 'hover:bg-gpt-gray-800 text-gpt-gray-300'
                  }
                `}
                onClick={() => onSelectChat(chat.id)}
              >
                <ChatBubbleLeftIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-auto p-1 hover:bg-gpt-gray-700 rounded"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gpt-gray-800 space-y-2">
            {selectedGPT && (
              <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{selectedGPT.name}</div>
                  <div className="text-xs text-white text-opacity-70">Active MyGPT</div>
                </div>
              </div>
            )}
            <a 
              href="/mygpts"
              className="flex items-center gap-3 px-3 py-2 text-gpt-gray-300 hover:bg-gpt-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-lg">⚡</span>
              <span className="text-sm">My GPTs</span>
            </a>
            <div className="text-xs text-gpt-gray-500 px-3">
              GPT-OSS Frontend
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}