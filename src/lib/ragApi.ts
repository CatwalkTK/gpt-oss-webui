import { ResponsesRequest } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { API_CONFIG, REGEX_PATTERNS } from './constants'
import { SearchResult } from '@/hooks/useVectorSearch'

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

function formatSearchContext(searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return ''
  }

  const contextSections = searchResults.map((result, index) => {
    return `## 参考文書 ${index + 1}: ${result.document.metadata.fileName}
関連度: ${(result.similarity * 100).toFixed(1)}%
ファイルパス: ${result.document.metadata.filePath}

内容:
${result.relevantChunk}

---`
  })

  return `以下は検索結果から得られた関連文書の情報です。これらの情報を参考に質問に答えてください：

${contextSections.join('\n\n')}

`
}

export async function sendMessageWithRAG(
  message: string, 
  searchResults: SearchResult[] = [],
  attachments?: import('@/types/chat').FileAttachment[]
): Promise<ReadableStream<Uint8Array>> {
  
  const hasSearchContext = searchResults.length > 0
  const contextPrefix = hasSearchContext ? formatSearchContext(searchResults) : ''
  
  let enhancedMessage = message
  if (hasSearchContext) {
    enhancedMessage = `${contextPrefix}

ユーザーの質問: ${message}

上記の参考文書の内容を踏まえて、適切に回答してください。参考文書に関連する情報がある場合は、どの文書から得た情報かを明示してください。`
  } else {
    enhancedMessage = message
  }

  // Handle attachments
  if (attachments && attachments.length > 0) {
    const hasJapanese = REGEX_PATTERNS.JAPANESE.test(enhancedMessage)
    const hasImages = attachments.some(att => att.type.startsWith('image/'))
    const hasOffice = attachments.some(att => REGEX_PATTERNS.OFFICE_FILES.test(att.name))
    
    if (hasOffice && hasJapanese) {
      enhancedMessage = `Officeドキュメントを分析して内容を抽出し、日本語で回答してください。ドキュメント内の日本語テキストに特に注意してください。

${enhancedMessage}`
    } else if (hasOffice) {
      enhancedMessage = `Please analyze the Office document(s) and extract their content. Pay attention to any text, tables, or structured data.

${enhancedMessage}`
    } else if (hasImages && hasJapanese) {
      enhancedMessage = `画像を分析して日本語で回答してください。特に画像内の日本語テキストに注意を払ってください。

${enhancedMessage}`
    } else if (hasImages) {
      enhancedMessage = `Please analyze the image(s) carefully, paying special attention to any text content.

${enhancedMessage}`
    }
  }

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

export async function sendMessageWithGPTAndRAG(
  message: string, 
  customGPT: CustomGPT, 
  chatHistory: import('@/types/chat').Message[] = [], 
  searchResults: SearchResult[] = [],
  attachments?: import('@/types/chat').FileAttachment[]
): Promise<ReadableStream<Uint8Array>> {
  
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(message)
  const hasSearchContext = searchResults.length > 0
  
  const systemMessage = {
    role: 'system',
    content: `You are ${customGPT.name}. ${customGPT.instructions}

${customGPT.capabilities.webBrowsing ? 'You have web browsing capabilities.' : ''}
${customGPT.capabilities.codeInterpreter ? 'You have code interpreter capabilities.' : ''}
${customGPT.capabilities.dalleImageGeneration ? 'You have image generation capabilities.' : ''}

You can analyze Microsoft Office documents (Word, Excel, PowerPoint) from base64 encoded data. Extract text content, tables, and structured information from these documents.

${hasSearchContext ? 'You have access to relevant documents found through vector search. Use this information to provide more accurate and contextual responses. Always cite which documents you are referencing.' : ''}

${hasJapanese ? 'The user is communicating in Japanese. Please respond in Japanese and pay special attention to Japanese text in images or documents. When analyzing Office documents, focus on extracting Japanese text content accurately.' : ''}`
  }

  const contextPrefix = hasSearchContext ? formatSearchContext(searchResults) : ''
  
  let enhancedMessage = message
  if (hasSearchContext) {
    enhancedMessage = `${contextPrefix}

ユーザーの質問: ${message}

上記の参考文書の内容を踏まえて、${customGPT.name}として適切に回答してください。参考文書に関連する情報がある場合は、どの文書から得た情報かを明示してください。`
  }

  // Handle attachments
  if (attachments && attachments.length > 0) {
    const hasImages = attachments.some(att => att.type.startsWith('image/'))
    const hasOffice = attachments.some(att => att.name.match(/\.(docx?|xlsx?|pptx?)$/i))
    
    if (hasOffice && hasJapanese) {
      enhancedMessage = `Officeドキュメントを分析して内容を抽出し、日本語で回答してください。ドキュメント内の日本語テキストに特に注意してください。

${enhancedMessage}`
    } else if (hasOffice) {
      enhancedMessage = `Please analyze the Office document(s) and extract their content. Pay attention to any text, tables, or structured data.

${enhancedMessage}`
    } else if (hasImages && hasJapanese) {
      enhancedMessage = `画像を分析して日本語で回答してください。特に画像内の日本語テキストに注意を払ってください。

${enhancedMessage}`
    } else if (hasImages) {
      enhancedMessage = `Please analyze the image(s) carefully, paying special attention to any text content.

${enhancedMessage}`
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