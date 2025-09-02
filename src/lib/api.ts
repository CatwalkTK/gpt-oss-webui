import { ResponsesRequest } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { API_CONFIG, REGEX_PATTERNS } from './constants'

function createAttachmentContent(att: import('@/types/chat').FileAttachment) {
  if (att.type.startsWith('image/')) {
    return {
      type: 'image_url',
      image_url: { url: att.url }
    }
  } else if (REGEX_PATTERNS.OFFICE_FILES.test(att.name)) {
    return {
      type: 'text',
      text: `[Microsoft Office Document: ${att.name}]\nThis is a ${att.name.split('.').pop()?.toUpperCase()} file. Please extract and analyze the text content from this document. Focus on any Japanese text if present. The document content should be interpreted from the following base64 data: ${att.base64}`
    }
  } else {
    return {
      type: 'text',
      text: `[File: ${att.name}]\n${att.base64 ? atob(att.base64) : 'File content not available'}`
    }
  }
}

function enhanceMessageForAttachments(message: string, attachments: import('@/types/chat').FileAttachment[]): string {
  if (!attachments || attachments.length === 0) return message
  
  const hasJapanese = REGEX_PATTERNS.JAPANESE.test(message)
  const hasImages = attachments.some(att => att.type.startsWith('image/'))
  const hasOffice = attachments.some(att => REGEX_PATTERNS.OFFICE_FILES.test(att.name))
  
  if (hasOffice && hasJapanese) {
    return `Officeドキュメントを分析して内容を抽出し、日本語で回答してください。ドキュメント内の日本語テキストに特に注意してください。ユーザーメッセージ: ${message}`
  } else if (hasOffice) {
    return `Please analyze the Office document(s) and extract their content. Pay attention to any text, tables, or structured data. User message: ${message}`
  } else if (hasImages && hasJapanese) {
    return `Please analyze the image(s) and respond in Japanese. User message: ${message}`
  } else if (hasImages) {
    return `Please analyze the image(s). User message: ${message}`
  }
  
  return message
}

export async function sendMessage(message: string, attachments?: import('@/types/chat').FileAttachment[]): Promise<ReadableStream<Uint8Array>> {
  const enhancedMessage = enhanceMessageForAttachments(message, attachments || [])

  const content = attachments && attachments.length > 0 
    ? [
        { type: 'text', text: enhancedMessage },
        ...attachments.map(att => createAttachmentContent(att))
      ]
    : enhancedMessage

  const request = {
    model: API_CONFIG.DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content
      }
    ],
    stream: true,
    temperature: API_CONFIG.DEFAULT_TEMPERATURE
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS}`, {
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

You can analyze Microsoft Office documents (Word, Excel, PowerPoint) from base64 encoded data. Extract text content, tables, and structured information from these documents.

${hasJapanese ? 'The user is communicating in Japanese. Please respond in Japanese and pay special attention to Japanese text in images or documents. When analyzing Office documents, focus on extracting Japanese text content accurately.' : ''}`
  }

  let enhancedMessage = message
  if (attachments && attachments.length > 0) {
    const hasImages = attachments.some(att => att.type.startsWith('image/'))
    const hasOffice = attachments.some(att => att.name.match(/\.(docx?|xlsx?|pptx?)$/i))
    
    if (hasOffice && hasJapanese) {
      enhancedMessage = `Officeドキュメントを分析して内容を抽出し、日本語で回答してください。ドキュメント内の日本語テキストに特に注意してください。ユーザーメッセージ: ${message}`
    } else if (hasOffice) {
      enhancedMessage = `Please analyze the Office document(s) and extract their content. Pay attention to any text, tables, or structured data. User message: ${message}`
    } else if (hasImages && hasJapanese) {
      enhancedMessage = `画像を分析して日本語で回答してください。特に画像内の日本語テキストに注意を払ってください。ユーザーメッセージ: ${message}`
    } else if (hasImages) {
      enhancedMessage = `Please analyze the image(s) carefully, paying special attention to any text content. User message: ${message}`
    }
  }

  const userContent = attachments && attachments.length > 0 
    ? [
        { type: 'text', text: enhancedMessage },
        ...attachments.map(att => {
          if (att.type.startsWith('image/')) {
            return {
              type: 'image_url',
              image_url: { url: att.url }
            }
          } else if (att.name.match(/\.(docx?|xlsx?|pptx?)$/i)) {
            return {
              type: 'text',
              text: `[Microsoft Office文書: ${att.name}]\nこの${att.name.split('.').pop()?.toUpperCase()}ファイルからテキスト内容を抽出して分析してください。日本語テキストがある場合は特に注意してください。以下のbase64データから文書内容を解釈してください: ${att.base64}`
            }
          } else {
            return {
              type: 'text',
              text: `[ファイル: ${att.name}]\n${att.base64 ? atob(att.base64) : 'ファイル内容が利用できません'}`
            }
          }
        })
      ]
    : enhancedMessage

  const messages = [
    systemMessage,
    ...chatHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: userContent
    }
  ]

  const request = {
    model: API_CONFIG.DEFAULT_MODEL,
    messages,
    stream: true,
    temperature: API_CONFIG.DEFAULT_TEMPERATURE
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS}`, {
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