import { openDB, IDBPDatabase } from 'idb'
// Simple cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

export interface Document {
  id: string
  content: string
  metadata: {
    fileName: string
    filePath: string
    fileType: string
    chunkIndex: number
    totalChunks: number
    created: number
  }
}

export interface DocumentEmbedding {
  id: string
  documentId: string
  embedding: number[]
  content: string
  metadata: Document['metadata']
}

export interface SearchResult {
  document: Document
  similarity: number
  relevantChunk: string
}

class VectorStore {
  private db: IDBPDatabase | null = null
  private readonly DB_NAME = 'VectorStoreDB'
  private readonly DB_VERSION = 1

  async initialize(): Promise<void> {
    if (this.db) return

    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const documentStore = db.createObjectStore('documents', {
            keyPath: 'id'
          })
          documentStore.createIndex('filePath', 'metadata.filePath')
          documentStore.createIndex('fileName', 'metadata.fileName')
        }

        if (!db.objectStoreNames.contains('embeddings')) {
          const embeddingStore = db.createObjectStore('embeddings', {
            keyPath: 'id'
          })
          embeddingStore.createIndex('documentId', 'documentId')
        }
      }
    })
  }

  async addDocument(document: Document): Promise<void> {
    await this.initialize()
    await this.db!.put('documents', document)
  }

  async addEmbedding(embedding: DocumentEmbedding): Promise<void> {
    await this.initialize()
    await this.db!.put('embeddings', embedding)
  }

  async getDocumentsByPath(filePath: string): Promise<Document[]> {
    await this.initialize()
    return await this.db!.getAllFromIndex('documents', 'filePath', filePath)
  }

  async removeDocumentsByPath(filePath: string): Promise<void> {
    await this.initialize()
    const documents = await this.getDocumentsByPath(filePath)
    const tx = this.db!.transaction(['documents', 'embeddings'], 'readwrite')
    
    for (const doc of documents) {
      await tx.objectStore('documents').delete(doc.id)
      
      // Remove associated embeddings
      const embeddings = await this.db!.getAllFromIndex('embeddings', 'documentId', doc.id)
      for (const embedding of embeddings) {
        await tx.objectStore('embeddings').delete(embedding.id)
      }
    }
    
    await tx.done
  }

  async searchSimilar(queryEmbedding: number[], topK: number = 5): Promise<SearchResult[]> {
    await this.initialize()
    const embeddings = await this.db!.getAll('embeddings')
    
    const similarities = embeddings.map(embedding => ({
      embedding,
      similarity: cosineSimilarity(queryEmbedding, embedding.embedding)
    }))

    similarities.sort((a, b) => b.similarity - a.similarity)

    const results: SearchResult[] = []
    const seenDocuments = new Set<string>()

    for (const { embedding, similarity } of similarities.slice(0, topK)) {
      if (seenDocuments.has(embedding.documentId)) continue
      
      const document = await this.db!.get('documents', embedding.documentId)
      if (document) {
        results.push({
          document,
          similarity,
          relevantChunk: embedding.content
        })
        seenDocuments.add(embedding.documentId)
      }
    }

    return results
  }

  async getAllDocuments(): Promise<Document[]> {
    await this.initialize()
    return await this.db!.getAll('documents')
  }

  async clearAll(): Promise<void> {
    await this.initialize()
    const tx = this.db!.transaction(['documents', 'embeddings'], 'readwrite')
    await tx.objectStore('documents').clear()
    await tx.objectStore('embeddings').clear()
    await tx.done
  }

  async getStats(): Promise<{ documentCount: number; embeddingCount: number }> {
    await this.initialize()
    const documentCount = await this.db!.count('documents')
    const embeddingCount = await this.db!.count('embeddings')
    return { documentCount, embeddingCount }
  }
}

export const vectorStore = new VectorStore()