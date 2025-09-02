'use client'

import { useState, useRef } from 'react'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid'
import { FileAttachment } from '@/types/chat'
import { readFileAsDataURL, readFileAsText, isOfficeDocument, isTextFile } from '@/lib/fileUtils'
import FileAttachmentComponent from './FileAttachment'

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim() || "Analyze the attached files", attachments.length > 0 ? attachments : undefined)
      setMessage('')
      setAttachments([])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    for (const file of files) {
      try {
        const dataUrl = await readFileAsDataURL(file)
        let textContent = ''
        
        if (isTextFile(file.type, file.name)) {
          textContent = await readFileAsText(file)
        } else if (isOfficeDocument(file.name)) {
          textContent = dataUrl.split(',')[1] // Base64 content
        }
        
        const attachment: FileAttachment = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: dataUrl,
          base64: textContent || dataUrl.split(',')[1]
        }
        
        setAttachments(prev => [...prev, attachment])
      } catch (error) {
        console.error('Failed to process file:', error)
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-gpt-gray-800 bg-gpt-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment) => (
              <FileAttachmentComponent
                key={attachment.id}
                file={attachment}
                onRemove={() => removeAttachment(attachment.id)}
                showPreview={true}
              />
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message GPT-OSS..."
            disabled={disabled}
            className="w-full px-4 py-3 pr-24 bg-gpt-gray-800 border border-gpt-gray-700 rounded-xl 
                     text-white placeholder-gpt-gray-400 resize-none focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{
              minHeight: '52px',
              maxHeight: '200px',
              resize: 'none'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 200) + 'px'
            }}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,.doc,.docx,.xlsx,.xls,.pptx,.ppt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 text-gpt-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={(!message.trim() && attachments.length === 0) || disabled}
              className="p-2 text-gpt-gray-400 hover:text-white 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <div className="text-xs text-gpt-gray-500 text-center mt-3">
          GPT-OSS can make mistakes. Check important info.
        </div>
      </div>
    </div>
  )
}