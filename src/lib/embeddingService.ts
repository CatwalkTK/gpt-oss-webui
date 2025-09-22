import { extractOfficeDocumentFromBase64 } from './officeExtractor'

export class EmbeddingService {
  private readonly EMBEDDING_MODEL = 'nomic-embed-text'

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use Next.js API route to proxy to Ollama
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.EMBEDDING_MODEL,
          prompt: text,
        }),
      })

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

  async extractTextFromContent(content: string, fileType: string, fileName: string): Promise<string> {
    // Handle different file types
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return content
    }

    if (fileType === 'application/pdf') {
      try {
        // Use server-side PDF extraction API
        const response = await fetch('/api/pdf-extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Data: content,
            fileName: fileName
          }),
        })

        if (!response.ok) {
          throw new Error(`PDF extraction failed: ${response.status}`)
        }

        const { text, pages, metadata, requiresClientSideProcessing } = await response.json()

        if (requiresClientSideProcessing) {
          return `[PDF: ${fileName}] This PDF requires client-side processing for text extraction. The vector search system will show this as a placeholder until proper PDF processing is implemented.`
        }

        return text

      } catch (error) {
        console.error('PDF text extraction failed:', error)
        return `[PDF: ${fileName}] Failed to extract text content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    if (fileName.match(/\.(docx?|xlsx?|pptx?)$/i)) {
      const extraction = await extractOfficeDocumentFromBase64(content, fileName, fileType)

      if (extraction?.text) {
        const metaSummary: string[] = []
        if (extraction.metadata?.sheetNames?.length) {
          metaSummary.push(`シート: ${extraction.metadata.sheetNames.join(', ')}`)
        }
        if (typeof extraction.metadata?.rowCount === 'number' && extraction.metadata.rowCount > 0) {
          metaSummary.push(`行数: ${extraction.metadata.rowCount}`)
        }
        if (typeof extraction.metadata?.paragraphCount === 'number' && extraction.metadata.paragraphCount > 0) {
          metaSummary.push(`段落数: ${extraction.metadata.paragraphCount}`)
        }
        if (typeof extraction.metadata?.slideCount === 'number' && extraction.metadata.slideCount > 0) {
          metaSummary.push(`スライド数: ${extraction.metadata.slideCount}`)
        }

        const header = metaSummary.length > 0
          ? `【Office Document: ${fileName}】\n${metaSummary.join(' / ')}`
          : `【Office Document: ${fileName}】`

        return `${header}\n---\n${extraction.text}`
      }

      return `[Office Document: ${fileName}] 添付ファイルからテキストを抽出できませんでした。`
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
    const extractedText = await this.extractTextFromContent(content, fileType, fileName)
    
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
