import { vectorStore, Document, DocumentEmbedding } from './vectorStore'
import { embeddingService } from './embeddingService'
import { isTextFile as isTextMimeType, isPDFFile, isOfficeDocument, readFileAsDataURL } from './fileUtils'

export interface IndexingProgress {
  total: number
  processed: number
  currentFile: string
  status: 'indexing' | 'complete' | 'error'
}

export class DocumentIndexer {
  private onProgressCallback?: (progress: IndexingProgress) => void

  setProgressCallback(callback: (progress: IndexingProgress) => void) {
    this.onProgressCallback = callback
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  async indexDirectory(directoryHandle: FileSystemDirectoryHandle): Promise<void> {
    const files = await this.getAllFiles(directoryHandle)
    let processed = 0

    for (const { file, path } of files) {
      this.onProgressCallback?.({
        total: files.length,
        processed,
        currentFile: file.name,
        status: 'indexing'
      })

      try {
        await this.indexFile(file, path)
        processed++
      } catch (error) {
        console.error(`Failed to index ${file.name}:`, error)
      }
    }

    this.onProgressCallback?.({
      total: files.length,
      processed,
      currentFile: '',
      status: 'complete'
    })
  }

  private async getAllFiles(
    directoryHandle: FileSystemDirectoryHandle,
    path: string = '',
    files: Array<{ file: File; path: string }> = []
  ): Promise<Array<{ file: File; path: string }>> {
    for await (const [name, handle] of directoryHandle.entries()) {
      const currentPath = path ? `${path}/${name}` : name

      if (handle.kind === 'file') {
        if (this.shouldIndexFile(name)) {
          const file = await handle.getFile()
          files.push({ file, path: currentPath })
        }
      } else if (handle.kind === 'directory') {
        await this.getAllFiles(handle, currentPath, files)
      }
    }

    return files
  }

  private shouldIndexFile(fileName: string): boolean {
    const extensions = [
      '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c',
      '.html', '.css', '.json', '.xml', '.yml', '.yaml', '.sql', '.sh', '.bat',
      '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt'
    ]

    const excludePatterns = [
      'node_modules', '.git', '.next', 'build', 'dist', '.cache',
      'coverage', '.nyc_output', 'logs', '*.log', '*.tmp', '*.temp'
    ]

    // Check if file should be excluded
    for (const pattern of excludePatterns) {
      if (fileName.includes(pattern) || fileName.match(new RegExp(pattern.replace('*', '.*')))) {
        return false
      }
    }

    // Check if file has supported extension
    return extensions.some(ext => fileName.toLowerCase().endsWith(ext.toLowerCase()))
  }

  private async readFileAsBase64(file: File): Promise<string> {
    const dataUrl = await readFileAsDataURL(file)
    const commaIndex = dataUrl.indexOf(',')
    return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl
  }

  async indexFile(file: File, filePath: string): Promise<void> {
    try {
      // Remove existing documents for this file path
      await vectorStore.removeDocumentsByPath(filePath)

      // Read file content
      let content: string
      const isText = file.type.startsWith('text/') || this.isTextFile(file.name) || isTextMimeType(file.type, file.name)

      if (isText) {
        content = await this.readTextFile(file)
      } else if (isPDFFile(file.type) || file.name.toLowerCase().endsWith('.pdf')) {
        content = await this.readFileAsBase64(file)
      } else if (isOfficeDocument(file.name)) {
        content = await this.readFileAsBase64(file)
      } else {
        // For binary files, use file name and type as content
        content = `File: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes`
      }

      // Process file for indexing
      const processedChunks = await embeddingService.processFileForIndexing(
        content,
        file.name,
        filePath,
        file.type
      )

      // Create documents and embeddings
      for (let i = 0; i < processedChunks.length; i++) {
        const chunk = processedChunks[i]
        const documentId = this.generateId()
        const embeddingId = this.generateId()

        const document: Document = {
          id: documentId,
          content: chunk.content,
          metadata: {
            fileName: file.name,
            filePath,
            fileType: file.type,
            chunkIndex: i,
            totalChunks: processedChunks.length,
            created: Date.now()
          }
        }

        const embedding: DocumentEmbedding = {
          id: embeddingId,
          documentId,
          embedding: chunk.embedding,
          content: chunk.content,
          metadata: document.metadata
        }

        await vectorStore.addDocument(document)
        await vectorStore.addEmbedding(embedding)
      }
    } catch (error) {
      console.error(`Error indexing file ${filePath}:`, error)
      throw error
    }
  }

  private isTextFile(fileName: string): boolean {
    const textExtensions = [
      '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c',
      '.html', '.css', '.json', '.xml', '.yml', '.yaml', '.sql', '.sh', '.bat',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs'
    ]

    return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  async indexSingleFile(file: File, filePath?: string): Promise<void> {
    const path = filePath || file.name
    await this.indexFile(file, path)
  }

  async searchDocuments(query: string, topK: number = 5): Promise<Array<{
    document: Document
    similarity: number
    relevantChunk: string
  }>> {
    if (!query.trim()) {
      return []
    }

    try {
      const stats = await vectorStore.getStats()
      if (stats.embeddingCount === 0) {
        return []
      }

      const queryEmbedding = await embeddingService.generateEmbedding(query)
      return await vectorStore.searchSimilar(queryEmbedding, topK)
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  async getIndexStats(): Promise<{ documentCount: number; embeddingCount: number }> {
    return await vectorStore.getStats()
  }

  async clearIndex(): Promise<void> {
    await vectorStore.clearAll()
  }
}

export const documentIndexer = new DocumentIndexer()
