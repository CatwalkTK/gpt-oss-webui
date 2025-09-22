import { CustomGPT } from '@/types/mygpt'
import { API_CONFIG, REGEX_PATTERNS } from './constants'
import { browserTool } from './browserTool'
import { pythonTool } from './pythonTool'
import { extractOfficeDocumentFromBase64 } from './officeExtractor'

export type MessageContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

const MAX_ATTACHMENT_TEXT_LENGTH = 8_000

async function extractPdfContent(att: import('@/types/chat').FileAttachment): Promise<string> {
  try {
    const response = await fetch('/api/pdf-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data: att.base64, fileName: att.name })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error')
      console.warn(`PDF extraction request failed (${response.status}):`, errorText)
      return `【PDF: ${att.name}】\nPDFのテキスト抽出中に問題が発生しました（ステータス: ${response.status}）。ファイル名と文脈から推測して回答してください。`
    }

    const { text, pages, wordCount } = await response.json()
    return `【PDF: ${att.name}】\nページ数: ${pages}\n語数: 約${wordCount}\n---\n${text}`
  } catch (error) {
    console.error('PDF processing error:', error)
    return `【PDF: ${att.name}】\nPDFのテキスト抽出中にエラーが発生しました。ファイル名と文脈から推測して回答してください。`
  }
}

function ensureBase64(att: import('@/types/chat').FileAttachment): string | null {
  if (att.base64) return att.base64
  if (att.url?.startsWith('data:')) {
    const commaIndex = att.url.indexOf(',')
    if (commaIndex !== -1) {
      return att.url.slice(commaIndex + 1)
    }
  }
  return null
}

function buildMessageIntro(message: string, attachments: import('@/types/chat').FileAttachment[] = []): string {
  if (attachments.length === 0) {
    return message
  }

  const hasJapanese = REGEX_PATTERNS.JAPANESE.test(message)
  const attachmentSummary = attachments
    .map(att => `- ${att.name} (${att.type || 'unknown'}, ${att.size} bytes)`)
    .join('\n')

  return hasJapanese
    ? `以下の添付ファイルを参考にして日本語で回答してください。添付ファイル一覧:\n${attachmentSummary}\n\nユーザーの質問: ${message}`
    : `Please reference the attached files when answering. Attachments:\n${attachmentSummary}\n\nUser message: ${message}`
}

function decodeTextBase64(data: string | undefined): string {
  if (!data) return ''
  try {
    // Many text attachments already store raw text in the base64 field; fallback to decoding if needed
    if (/^[\x00-\x7F\s]+$/.test(data)) {
      return data
    }
    return atob(data)
  } catch (error) {
    console.warn('Failed to decode text attachment base64:', error)
    return data
  }
}

async function buildAttachmentParts(
  attachments: import('@/types/chat').FileAttachment[] = []
): Promise<MessageContentPart[]> {
  const parts: MessageContentPart[] = []

  for (const attachment of attachments) {
    if (attachment.type.startsWith('image/')) {
      const base64 = ensureBase64(attachment)
      if (!base64) {
        console.warn(`Image attachment ${attachment.name} missing base64 data`)
        continue
      }
      const dataUrl = attachment.url?.startsWith('data:')
        ? attachment.url
        : `data:${attachment.type || 'image/png'};base64,${base64}`

      parts.push({
        type: 'image_url',
        image_url: { url: dataUrl }
      })
      parts.push({ type: 'text', text: `【画像: ${attachment.name}】上記の画像を詳細に分析してください。` })
      continue
    }

    if (attachment.type === 'application/pdf' || REGEX_PATTERNS.PDF_FILES.test(attachment.name)) {
      const text = await extractPdfContent(attachment)
      parts.push({ type: 'text', text: text.slice(0, MAX_ATTACHMENT_TEXT_LENGTH) })
      continue
    }

    if (REGEX_PATTERNS.OFFICE_FILES.test(attachment.name)) {
      const base64 = ensureBase64(attachment)
      const extraction = await extractOfficeDocumentFromBase64(base64, attachment.name, attachment.type)

      const intro = `【Office文書: ${attachment.name}】\nファイル種別: ${attachment.type || 'application/octet-stream'}\nサイズ: ${attachment.size} bytes`

      const metadataSummary: string[] = []
      if (extraction?.metadata?.sheetNames?.length) {
        metadataSummary.push(`シート: ${extraction.metadata.sheetNames.join(', ')}`)
      }
      if (typeof extraction?.metadata?.rowCount === 'number' && extraction.metadata.rowCount > 0) {
        metadataSummary.push(`行数: ${extraction.metadata.rowCount}`)
      }
      if (typeof extraction?.metadata?.paragraphCount === 'number' && extraction.metadata.paragraphCount > 0) {
        metadataSummary.push(`段落数: ${extraction.metadata.paragraphCount}`)
      }
      if (typeof extraction?.metadata?.slideCount === 'number' && extraction.metadata.slideCount > 0) {
        metadataSummary.push(`スライド数: ${extraction.metadata.slideCount}`)
      }
      if (extraction?.metadata?.summary) {
        metadataSummary.push(extraction.metadata.summary)
      }

      const detailLine = metadataSummary.length > 0 ? `\n概要: ${metadataSummary.join(' / ')}` : ''

      if (extraction?.text) {
        const trimmed = extraction.text.slice(0, MAX_ATTACHMENT_TEXT_LENGTH)
        const suffix = extraction.text.length > MAX_ATTACHMENT_TEXT_LENGTH ? '\n...（省略）' : ''
        parts.push({
          type: 'text',
          text: `${intro}${detailLine}\n---\n${trimmed}${suffix}`
        })
      } else {
        parts.push({
          type: 'text',
          text: `${intro}${detailLine}\n内容の抽出に失敗しました。ファイルの形式やエンコードを確認してください。`
        })
      }
      continue
    }

    if (attachment.type.startsWith('text/') || attachment.name.match(/\.(txt|md|json|sql|py|js|ts|jsx|tsx)$/i)) {
      const textContent = decodeTextBase64(attachment.base64)
      parts.push({
        type: 'text',
        text: `【テキストファイル: ${attachment.name}】\n${textContent.slice(0, MAX_ATTACHMENT_TEXT_LENGTH)}${textContent.length > MAX_ATTACHMENT_TEXT_LENGTH ? '\n...（省略）' : ''}`
      })
      continue
    }

    const fallbackBase64 = ensureBase64(attachment)
    parts.push({
      type: 'text',
      text: `【ファイル: ${attachment.name}】\n種別: ${attachment.type}\nサイズ: ${attachment.size} bytes${fallbackBase64 ? `\nBase64 データ冒頭: ${fallbackBase64.slice(0, 120)}...` : ''}`
    })
  }

  return parts
}

export async function buildContentParts(
  message: string,
  attachments: import('@/types/chat').FileAttachment[] = [],
  prependText?: string
): Promise<MessageContentPart[]> {
  const parts: MessageContentPart[] = []

  if (prependText) {
    parts.push({ type: 'text', text: prependText })
  }

  parts.push({ type: 'text', text: buildMessageIntro(message, attachments) })

  const attachmentParts = await buildAttachmentParts(attachments)
  parts.push(...attachmentParts)

  return parts
}

export async function sendMessage(message: string, attachments?: import('@/types/chat').FileAttachment[]): Promise<ReadableStream<Uint8Array>> {
  const contentParts = await buildContentParts(message, attachments)

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

export async function sendMessageWithGPT(message: string, customGPT: CustomGPT, chatHistory: import('@/types/chat').Message[] = [], attachments?: import('@/types/chat').FileAttachment[]): Promise<ReadableStream<Uint8Array>> {
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)

  const systemMessage = {
    role: 'system',
    content: `You are ${customGPT.name}. ${customGPT.instructions}

${customGPT.capabilities.webBrowsing ? 'You have web browsing capabilities.' : ''}
${customGPT.capabilities.codeInterpreter ? 'You have code interpreter capabilities.' : ''}
${customGPT.capabilities.dalleImageGeneration ? 'You have image generation capabilities.' : ''}

You can analyze Microsoft Office documents (Word, Excel, PowerPoint) and PDF files. For PDF files, text content is extracted automatically. Extract text content, tables, and structured information from these documents.

${browserTool.isEnabled() ? browserTool.getToolDescription() : ''}

${pythonTool.isEnabled() ? pythonTool.getToolDescription() : ''}

${hasJapanese ? 'The user is communicating in Japanese. Please respond in Japanese and pay special attention to Japanese text in images or documents. When analyzing Office documents, focus on extracting Japanese text content accurately.' : ''}`
  }

  const contentParts = await buildContentParts(message, attachments)

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

export function parseSSEStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    start(controller) {
      let buffer = ''

      function pump(): Promise<void> {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close()
            return
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim()
              if (dataStr === '[DONE]') {
                controller.close()
                return
              }
              try {
                const data = JSON.parse(dataStr)
                controller.enqueue(data)
              } catch (e) {
                console.error('Failed to parse SSE data:', e)
              }
            }
          }

          return pump()
        })
      }

      return pump()
    }
  })
}
