'use client'

import { useState, useEffect } from 'react'
import { useVectorSearch, SearchResult } from '@/hooks/useVectorSearch'
import { 
  MagnifyingGlassIcon, 
  DocumentIcon, 
  FolderOpenIcon, 
  TrashIcon,
  DocumentPlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface VectorSearchProps {
  onSearchResultsChange?: (results: SearchResult[]) => void
  className?: string
}

export default function VectorSearch({ onSearchResultsChange, className = '' }: VectorSearchProps) {
  const {
    isIndexing,
    indexingProgress,
    searchResults,
    isSearching,
    indexStats,
    indexDirectory,
    indexFiles,
    searchDocuments,
    clearIndex,
    updateIndexStats
  } = useVectorSearch()

  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    updateIndexStats()
  }, [updateIndexStats])

  useEffect(() => {
    onSearchResultsChange?.(searchResults)
  }, [searchResults, onSearchResultsChange])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setShowResults(false)
      return
    }

    await searchDocuments(searchQuery)
    setShowResults(true)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      try {
        await indexFiles(files)
      } catch (error) {
        console.error('Failed to index files:', error)
      }
    }
    event.target.value = ''
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      try {
        await indexFiles(files)
      } catch (error) {
        console.error('Failed to index dropped files:', error)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const formatSimilarity = (similarity: number) => {
    return (similarity * 100).toFixed(1) + '%'
  }

  const truncateText = (text: string, maxLength: number = 200) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className={`bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gpt-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5" />
            Document Search
          </h3>
          <div className="text-sm text-gpt-gray-400">
            {indexStats.documentCount} docs, {indexStats.embeddingCount} chunks
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Search your documents..."
            className="w-full px-4 py-2 pr-10 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg text-white placeholder-gpt-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSearching}
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gpt-gray-400 hover:text-white disabled:opacity-50"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={indexDirectory}
            disabled={isIndexing}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            <FolderOpenIcon className="w-4 h-4" />
            Index Folder
          </button>

          <label className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors cursor-pointer">
            <DocumentPlusIcon className="w-4 h-4" />
            Add Files
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.yml,.yaml,.sql,.sh,.bat,.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
            />
          </label>

          <button
            onClick={clearIndex}
            disabled={isIndexing}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Indexing Progress */}
      {isIndexing && indexingProgress && (
        <div className="p-4 border-b border-gpt-gray-700">
          <div className="text-sm text-white mb-2">
            Indexing: {indexingProgress.currentFile}
          </div>
          <div className="w-full bg-gpt-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${indexingProgress.total > 0 ? (indexingProgress.processed / indexingProgress.total) * 100 : 0}%`
              }}
            />
          </div>
          <div className="text-xs text-gpt-gray-400 mt-1">
            {indexingProgress.processed} / {indexingProgress.total}
          </div>
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        className={`p-4 border-2 border-dashed transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gpt-gray-600 hover:border-gpt-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center text-gpt-gray-400">
          <DocumentIcon className="w-8 h-8 mx-auto mb-2" />
          <p>Drag and drop files here or use the buttons above</p>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">
                  Found {searchResults.length} relevant documents
                </h4>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gpt-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="bg-gpt-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="font-medium text-white text-sm">
                          {result.document.metadata.fileName}
                        </span>
                      </div>
                      <span className="text-xs text-green-400">
                        {formatSimilarity(result.similarity)}
                      </span>
                    </div>
                    <div className="text-sm text-gpt-gray-300 mb-1">
                      {result.document.metadata.filePath}
                    </div>
                    <div className="text-sm text-gpt-gray-400">
                      {truncateText(result.relevantChunk)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gpt-gray-400">
              {isSearching ? 'Searching...' : 'No documents found'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}