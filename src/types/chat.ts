export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  base64?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: FileAttachment[]
  timestamp: Date
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  folderId?: string
  isFavorite?: boolean
  tags?: string[]
}

export interface ChatFolder {
  id: string
  name: string
  color?: string
  createdAt: Date
}

export interface APIMessage {
  type: 'message'
  role: 'user' | 'assistant'
  content: Array<{
    type: 'input_text' | 'output_text'
    text: string
  }>
}

export interface ResponsesRequest {
  input: string | APIMessage[]
  max_output_tokens: number
  temperature?: number
  stream?: boolean
  reasoning?: {
    effort: 'low' | 'medium' | 'high'
  }
  tools?: any[]
  instructions?: string
}