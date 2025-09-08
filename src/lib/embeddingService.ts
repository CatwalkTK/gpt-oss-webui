import { API_CONFIG } from './constants'

export class EmbeddingService {
  private readonly EMBEDDING_MODEL = 'nomic-embed-text'

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // First try Ollama's embedding endpoint
      let response = await fetch(`${API_CONFIG.BASE_URL}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.EMBEDDING_MODEL,
          prompt: text,
        }),
      })

      // If 404, try the alternative endpoint format
      if (response.status === 404) {
        response = await fetch(`${API_CONFIG.BASE_URL}/api/embed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.EMBEDDING_MODEL,
            input: text,
          }),
        })
      }

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.embedding
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      throw error
    }
  }

  chunkText(text: string, maxChunkSize: number = 500): string[] {
    if (text.length <= maxChunkSize) {
      return [text]
    }

    const chunks: string[] = []
    const sentences = text.split(/[.!?。！？]\s+/)
    let currentChunk = ''

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      if ((currentChunk + ' ' + trimmedSentence).length <= maxChunkSize) {
        currentChunk = currentChunk ? currentChunk + ' ' + trimmedSentence : trimmedSentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk)
        }
        
        if (trimmedSentence.length > maxChunkSize) {
          // Split long sentences by character count
          for (let i = 0; i < trimmedSentence.length; i += maxChunkSize) {
            chunks.push(trimmedSentence.slice(i, i + maxChunkSize))
          }
          currentChunk = ''
        } else {
          currentChunk = trimmedSentence
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk)
    }

    return chunks.filter(chunk => chunk.trim().length > 0)
  }

  extractTextFromContent(content: string, fileType: string, fileName: string): string {
    // Handle different file types
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return content
    }

    if (fileType === 'application/pdf') {
      // For PDF files, content might be base64 encoded or already extracted
      try {
        // If it's base64, decode it (simplified approach)
        if (content.startsWith('data:application/pdf;base64,')) {
          return `[PDF Content: ${fileName}] Content extraction from PDF would require additional processing.`
        }
        return content
      } catch {
        return `[PDF: ${fileName}] Unable to extract text content.`
      }
    }

    if (fileName.match(/\.(docx?|xlsx?|pptx?)$/i)) {
      // Office documents
      return `[Office Document: ${fileName}] ${content}`
    }

    if (fileType.startsWith('image/')) {
      return `[Image: ${fileName}] Image content requires OCR processing.`
    }

    return content
  }

  async processFileForIndexing(
    content: string, 
    fileName: string, 
    filePath: string, 
    fileType: string
  ): Promise<Array<{ content: string; embedding: number[] }>> {
    const extractedText = this.extractTextFromContent(content, fileType, fileName)
    
    if (extractedText.length < 10) {
      // Skip very short content
      return []
    }

    const chunks = this.chunkText(extractedText)
    const results: Array<{ content: string; embedding: number[] }> = []

    for (const chunk of chunks) {
      try {
        const embedding = await this.generateEmbedding(chunk)
        results.push({ content: chunk, embedding })
        
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to process chunk for ${fileName}:`, error)
      }
    }

    return results
  }
}

export const embeddingService = new EmbeddingService()