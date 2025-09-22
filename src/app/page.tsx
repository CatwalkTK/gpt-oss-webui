'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MessageBubble from '@/components/MessageBubble'
import ChatInput from '@/components/ChatInput'
import LoadingMessage from '@/components/LoadingMessage'
import VectorSearch from '@/components/VectorSearch'
import { useChat } from '@/hooks/useChat'
import { useSelectedGPT } from '@/hooks/useSelectedGPT'
import type { SearchResult } from '@/hooks/useVectorSearch'

export default function Home() {
  const {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    messagesEndRef,
    createNewChat,
    selectChat,
    deleteChat,
    sendChatMessage
  } = useChat()
  
  const { selectedGPT, selectGPT } = useSelectedGPT(createNewChat)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchPanel, setShowSearchPanel] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      setShowSearchPanel(true)
    }
  }, [])

  const handleSendMessage = async (content: string, attachments?: import('@/types/chat').FileAttachment[]) => {
    await sendChatMessage(content, selectedGPT, attachments)
  }

  return (
    <div className="flex h-screen bg-gpt-gray-900">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        selectedGPT={selectedGPT}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col md:ml-0">
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gpt-gray-800 bg-gpt-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {selectedGPT ? (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
                  {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{selectedGPT.name}</div>
                  <div className="text-xs text-gpt-gray-400">{selectedGPT.description}</div>
                </div>
                <button
                  onClick={() => selectGPT(null)}
                  className="text-xs text-gpt-gray-400 hover:text-white px-3 py-1 border border-gpt-gray-600 hover:border-gpt-gray-500 rounded transition-colors"
                >
                  Use default GPT
                </button>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">G</span>
                </div>
                <div>
                  <div className="font-medium text-white">GPT-OSS</div>
                  <div className="text-xs text-gpt-gray-400">Default assistant</div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            {searchResults.length > 0 && (
              <span className="text-xs text-green-400">
                {searchResults.length} relevant document{searchResults.length === 1 ? '' : 's'}
              </span>
            )}
            <button
              onClick={() => setShowSearchPanel(prev => !prev)}
              className="px-3 py-1 text-xs border border-gpt-gray-600 text-gpt-gray-300 hover:text-white hover:border-gpt-gray-500 rounded transition-colors"
            >
              {showSearchPanel ? 'Hide Document Search' : 'Show Document Search'}
            </button>
          </div>
        </div>

        {showSearchPanel && (
          <div className="border-b border-gpt-gray-800 bg-gpt-gray-900">
            <VectorSearch
              onSearchResultsChange={setSearchResults}
              className="rounded-none border-0 bg-gpt-gray-900 h-[420px] overflow-y-auto"
            />
          </div>
        )}

        {!showSearchPanel && searchResults.length > 0 && (
          <div className="px-6 py-2 bg-gpt-gray-900 border-b border-gpt-gray-800 text-xs text-green-400">
            📚 Document context will be included automatically.
          </div>
        )}

        {currentChat ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {currentChat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} selectedGPT={selectedGPT} />
              ))}
              {isLoading && <LoadingMessage selectedGPT={selectedGPT} />}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              {selectedGPT && selectedGPT.name ? (
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
                  </div>
                  <h1 className="text-4xl font-bold mb-2">{selectedGPT.name}</h1>
                  <p className="text-gpt-gray-400 mb-8">{selectedGPT.description}</p>
                  {selectedGPT.conversationStarters.length > 0 && (
                    <div className="space-y-2 mb-8">
                      {selectedGPT.conversationStarters.slice(0, 3).map((starter, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(starter)}
                          className="block w-full max-w-md mx-auto px-4 py-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 rounded-lg text-left transition-colors"
                        >
                          {starter}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={createNewChat}
                      className="px-6 py-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 rounded-lg transition-colors"
                    >
                      Start a new chat
                    </button>
                    <button
                      onClick={() => selectGPT(null)}
                      className="px-6 py-3 text-gpt-gray-400 hover:text-white transition-colors"
                    >
                      Use default GPT
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-bold mb-4">GPT-OSS</h1>
                  <p className="text-gpt-gray-400 mb-8">How can I help you today?</p>
                  <button
                    onClick={createNewChat}
                    className="px-6 py-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 rounded-lg transition-colors"
                  >
                    Start a new chat
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
