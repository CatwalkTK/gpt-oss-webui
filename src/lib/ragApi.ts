import { CustomGPT } from '@/types/mygpt'
import { SearchResult } from '@/hooks/useVectorSearch'
import { API_CONFIG } from './constants'
import { browserTool } from './browserTool'
import { pythonTool } from './pythonTool'
import { buildContentParts, resolveLanguagePreference } from './api'
import type { LanguageCode } from '@/types/settings'
import { LANGUAGE_METADATA } from '@/types/settings'

function formatSearchContext(searchResults: SearchResult[]): string | undefined {
  if (searchResults.length === 0) {
    return undefined
  }

  const contextSections = searchResults.map((result, index) => {
    return `## 参考文書 ${index + 1}: ${result.document.metadata.fileName}
関連度: ${(result.similarity * 100).toFixed(1)}%
ファイルパス: ${result.document.metadata.filePath}

本文抜粋:
${result.relevantChunk}

---`
  })

  return `以下はベクター検索で取得した関連文書の抜粋です。必ず内容を確認し、回答時には該当する文書番号を示してください。

${contextSections.join('\n\n')}`
}

export async function sendMessageWithRAG(
  message: string,
  searchResults: SearchResult[] = [],
  attachments: import('@/types/chat').FileAttachment[] = [],
  languageMode: LanguageCode = 'auto'
): Promise<ReadableStream<Uint8Array>> {
  const context = formatSearchContext(searchResults)
  const contentParts = await buildContentParts(
    message,
    attachments,
    context ? `${context}\n\n指示: 上記の参考文書をもとに回答し、可能であれば出典を示してください。` : undefined,
    languageMode
  )

  const request = {
    model: API_CONFIG.DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: contentParts
      }
    ],
    stream: true,
    temperature: API_CONFIG.DEFAULT_TEMPERATURE
  }

  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.body!
}

export async function sendMessageWithGPTAndRAG(
  message: string,
  customGPT: CustomGPT,
  chatHistory: import('@/types/chat').Message[] = [],
  searchResults: SearchResult[] = [],
  attachments: import('@/types/chat').FileAttachment[] = [],
  languageMode: LanguageCode = 'auto'
): Promise<ReadableStream<Uint8Array>> {
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)
  const context = formatSearchContext(searchResults)
  const targetLanguage = resolveLanguagePreference(languageMode, message)

  const languageInstruction = targetLanguage !== 'auto'
    ? LANGUAGE_METADATA[targetLanguage]?.systemInstruction ?? ''
    : hasJapanese
      ? 'The user is communicating in Japanese. Respond in natural Japanese, and pay extra attention to Japanese content found in attached files.'
      : ''

  const systemMessage = {
    role: 'system',
    content: `You are ${customGPT.name}. ${customGPT.instructions}

${customGPT.capabilities.webBrowsing ? 'You have web browsing capabilities.' : ''}
${customGPT.capabilities.codeInterpreter ? 'You have code interpreter capabilities.' : ''}
${customGPT.capabilities.dalleImageGeneration ? 'You have image generation capabilities.' : ''}

You can analyze Microsoft Office documents (Word, Excel, PowerPoint) and PDF files. For PDF files, analyze the extracted text and reasoning cues from the client. Extract structured data when possible and cite document references in your answer.

${context ? 'A knowledge base derived from user documents is provided in the prompt. Use it to ground your answer and reference the relevant document numbers.' : ''}

${browserTool.isEnabled() ? browserTool.getToolDescription() : ''}

${pythonTool.isEnabled() ? pythonTool.getToolDescription() : ''}

${languageInstruction}`
  }

  const contentParts = await buildContentParts(
    message,
    attachments,
    context ? `${context}\n\n指示: ${customGPT.name}として、参考文書の内容を根拠に回答し、引用元を明示してください。` : undefined,
    languageMode
  )

  const historyMessages = chatHistory.slice(-10).map(msg => ({
    role: msg.role,
    content: [{ type: 'text', text: msg.content }]
  }))

  const messages = [
    systemMessage,
    ...historyMessages,
    {
      role: 'user',
      content: contentParts
    }
  ]

  const request = {
    model: API_CONFIG.DEFAULT_MODEL,
    messages,
    stream: true,
    temperature: API_CONFIG.DEFAULT_TEMPERATURE
  }

  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.body!
}
