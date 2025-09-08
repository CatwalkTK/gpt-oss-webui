'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import VectorSearch from '@/components/VectorSearch'
import { useChatWithRAG } from '@/hooks/useChatWithRAG'
import { useSelectedGPT } from '@/hooks/useSelectedGPT'
import { SearchResult } from '@/hooks/useVectorSearch'
import MessageBubble from '@/components/MessageBubble'
import ChatInput from '@/components/ChatInput'
import LoadingMessage from '@/components/LoadingMessage'

export default function SearchPage() {
  const {
    chats,
    currentChat,
    currentChatId,
    isLoading,
    messagesEndRef,
    createNewChat,
    selectChat,
    deleteChat,
    sendChatMessageWithRAG
  } = useChatWithRAG()
  
  const { selectedGPT, selectGPT } = useSelectedGPT(createNewChat)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const handleSendMessage = async (content: string, attachments?: import('@/types/chat').FileAttachment[]) => {
    await sendChatMessageWithRAG(content, selectedGPT, searchResults, attachments)
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

      <div className="flex-1 flex">
        {/* Vector Search Panel */}
        <div className="w-1/3 min-w-96 border-r border-gpt-gray-700 overflow-hidden">
          <VectorSearch 
            onSearchResultsChange={setSearchResults}
            className="h-full rounded-none border-none"
          />
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {selectedGPT && (
                <div className="flex items-center gap-3 px-6 py-3 bg-gpt-gray-800 border-b border-gpt-gray-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">
                    {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{selectedGPT.name}</div>
                    <div className="text-xs text-gpt-gray-400">
                      {selectedGPT.description}
                      {searchResults.length > 0 && (
                        <span className="ml-2 text-green-400">
                          • {searchResults.length} relevant docs found
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => selectGPT(null)}
                    className="text-xs text-gpt-gray-400 hover:text-white px-3 py-1 border border-gpt-gray-600 hover:border-gpt-gray-500 rounded transition-colors"
                  >
                    Use default GPT
                  </button>
                </div>
              )}
              
              {!selectedGPT && searchResults.length > 0 && (
                <div className="px-6 py-2 bg-gpt-gray-800 border-b border-gpt-gray-700 text-sm text-green-400">
                  📚 {searchResults.length} relevant documents found - they will be included as context
                </div>
              )}

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
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Document Search</h1>
                <p className="text-gpt-gray-400 mb-8 max-w-md">
                  Index your local documents and search through them with AI-powered vector search. 
                  The search results will be used as context for your conversations.
                </p>
                <div className="space-y-4">
                  <div className="text-left text-sm text-gpt-gray-400 space-y-2">
                    <div>💡 <strong>How to use:</strong></div>
                    <div className="ml-6">1. Index documents using the search panel</div>
                    <div className="ml-6">2. Search for relevant information</div>
                    <div className="ml-6">3. Start a chat - search results will be included as context</div>
                  </div>
                  <button
                    onClick={createNewChat}
                    className="px-6 py-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 rounded-lg transition-colors"
                  >
                    Start a new chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}