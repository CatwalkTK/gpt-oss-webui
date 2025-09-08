import { useState, useCallback } from 'react'
import { documentIndexer, IndexingProgress } from '@/lib/documentIndexer'
import { Document } from '@/lib/vectorStore'

export interface SearchResult {
  document: Document
  similarity: number
  relevantChunk: string
}

export function useVectorSearch() {
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexingProgress, setIndexingProgress] = useState<IndexingProgress | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [indexStats, setIndexStats] = useState({ documentCount: 0, embeddingCount: 0 })

  const updateIndexStats = useCallback(async () => {
    try {
      const stats = await documentIndexer.getIndexStats()
      setIndexStats(stats)
    } catch (error) {
      console.error('Failed to get index stats:', error)
    }
  }, [])

  const indexDirectory = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Directory picker is not supported in this browser. Please use "Add Files" button to select individual files or try using Chrome/Edge.')
      return
    }

    try {
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read'
      })

      setIsIndexing(true)
      setIndexingProgress({ total: 0, processed: 0, currentFile: '', status: 'indexing' })

      documentIndexer.setProgressCallback((progress) => {
        setIndexingProgress(progress)
      })

      await documentIndexer.indexDirectory(directoryHandle)
      await updateIndexStats()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled directory picker
        console.log('Directory selection cancelled')
      } else {
        console.error('Indexing failed:', error)
        setIndexingProgress(prev => prev ? { ...prev, status: 'error' } : null)
        alert('Indexing failed. Please try again or use "Add Files" instead.')
      }
    } finally {
      setIsIndexing(false)
    }
  }, [updateIndexStats])

  const indexFiles = useCallback(async (files: File[]) => {
    try {
      setIsIndexing(true)
      setIndexingProgress({
        total: files.length,
        processed: 0,
        currentFile: '',
        status: 'indexing'
      })

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setIndexingProgress(prev => prev ? {
          ...prev,
          processed: i,
          currentFile: file.name
        } : null)

        await documentIndexer.indexSingleFile(file)
      }

      setIndexingProgress(prev => prev ? {
        ...prev,
        processed: files.length,
        status: 'complete'
      } : null)

      await updateIndexStats()
    } catch (error) {
      console.error('File indexing failed:', error)
      setIndexingProgress(prev => prev ? { ...prev, status: 'error' } : null)
      throw error
    } finally {
      setIsIndexing(false)
    }
  }, [updateIndexStats])

  const searchDocuments = useCallback(async (query: string, topK: number = 5) => {
    if (!query.trim()) {
      setSearchResults([])
      return []
    }

    try {
      setIsSearching(true)
      const results = await documentIndexer.searchDocuments(query, topK)
      setSearchResults(results)
      return results
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
      return []
    } finally {
      setIsSearching(false)
    }
  }, [])

  const clearIndex = useCallback(async () => {
    try {
      await documentIndexer.clearIndex()
      setSearchResults([])
      await updateIndexStats()
    } catch (error) {
      console.error('Failed to clear index:', error)
      throw error
    }
  }, [updateIndexStats])

  return {
    // State
    isIndexing,
    indexingProgress,
    searchResults,
    isSearching,
    indexStats,
    
    // Actions
    indexDirectory,
    indexFiles,
    searchDocuments,
    clearIndex,
    updateIndexStats
  }
}