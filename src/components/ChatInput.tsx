'use client'

import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid'
import { FileAttachment } from '@/types/chat'
import { readFileAsDataURL, readFileAsText, isOfficeDocument, isTextFile } from '@/lib/fileUtils'
import FileAttachmentComponent from './FileAttachment'
import { useSettings } from '@/context/SettingsContext'
import { LANGUAGE_METADATA } from '@/types/settings'
import { useUIText } from '@/hooks/useUIText'
import { showToast } from './ToastContainer'

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(({ onSendMessage, disabled = false }, ref) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { settings } = useSettings()
  const t = useUIText()

  useImperativeHandle(ref, () => textareaRef.current!, [])

  const languageLabel = settings.language === 'auto' ? '' : LANGUAGE_METADATA[settings.language]?.label
  const appName = t('appName')
  const placeholder = settings.language === 'ja'
    ? `${appName} に日本語でメッセージ...`
    : settings.language === 'fr'
      ? `Envoyer un message à ${appName}...`
      : settings.language === 'it'
        ? `Scrivi a ${appName}...`
        : settings.language === 'pt'
          ? `Envie uma mensagem para ${appName}...`
          : settings.language === 'de'
            ? `Nachricht an ${appName}...`
            : settings.language === 'zh'
              ? `向 ${appName} 发送消息...`
              : settings.language === 'ko'
                ? `${appName}에게 메시지를 보내세요...`
                : settings.language === 'th'
                  ? `ส่งข้อความถึง ${appName}...`
                  : settings.language === 'vi'
                    ? `Gửi tin nhắn cho ${appName}...`
                    : settings.language === 'auto'
                      ? `Message ${appName}...`
                      : `Message ${appName} (${languageLabel ?? 'Preferred language'})...`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim() || "Analyze the attached files", attachments.length > 0 ? attachments : undefined)
      setMessage('')
      setAttachments([])
    }
  }

  const processFiles = async (files: File[]) => {
    setIsProcessing(true)
    let successCount = 0
    let errorCount = 0

    for (const file of files) {
      try {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast(
            settings.language === 'ja'
              ? `${file.name} はサイズが大きすぎます (最大10MB)`
              : `${file.name} is too large (max 10MB)`,
            'warning'
          )
          errorCount++
          continue
        }

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
        successCount++
      } catch (error) {
        console.error('Failed to process file:', error)
        errorCount++
        showToast(
          settings.language === 'ja'
            ? `${file.name} の処理中にエラーが発生しました`
            : `Failed to process ${file.name}`,
          'error'
        )
      }
    }

    setIsProcessing(false)

    // Show summary toast
    if (successCount > 0) {
      showToast(
        settings.language === 'ja'
          ? `${successCount}個のファイルを追加しました${errorCount > 0 ? ` (${errorCount}個のファイルでエラー)` : ''}`
          : `Added ${successCount} file${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        errorCount > 0 ? 'warning' : 'success'
      )
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await processFiles(files)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFiles(files)
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
    <div
      className={`border-t border-gpt-gray-800 bg-gpt-gray-900 relative transition-all duration-200 ${
        isDragOver ? 'bg-blue-900 bg-opacity-20 border-blue-500' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-10 z-10 pointer-events-none">
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-lg font-medium text-blue-400">
              {settings.language === 'ja' ? 'ファイルをドロップしてください' : 'Drop files here'}
            </div>
            <div className="text-sm text-blue-300">
              {settings.language === 'ja' ? 'PDF、画像、文書ファイル対応' : 'Supports PDF, images, and documents'}
            </div>
          </div>
        </div>
      )}

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
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
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
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isProcessing}
              className="p-2 text-gpt-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={isProcessing ? (settings.language === 'ja' ? 'ファイル処理中...' : 'Processing files...') : undefined}
            >
              {isProcessing ? (
                <div className="w-5 h-5 animate-spin">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : (
                <PaperClipIcon className="w-5 h-5" />
              )}
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
          {t('disclaimer')}
        </div>
      </div>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'

export default ChatInput
