'use client'

import { FileAttachment } from '@/types/chat'
import { DocumentIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FileAttachmentProps {
  file: FileAttachment
  onRemove?: () => void
  showPreview?: boolean
}

export default function FileAttachmentComponent({ file, onRemove, showPreview = true }: FileAttachmentProps) {
  const isImage = file.type.startsWith('image/')
  const isPDF = file.type === 'application/pdf'
  const isText = file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')
  const isWord = file.name.match(/\.docx?$/i)
  const isExcel = file.name.match(/\.xlsx?$/i)
  const isPowerPoint = file.name.match(/\.pptx?$/i)
  const isOffice = isWord || isExcel || isPowerPoint

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="relative inline-flex items-center gap-2 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg p-3 max-w-xs">
      {showPreview && isImage && file.url && (
        <div className="w-16 h-16 flex-shrink-0">
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-full object-cover rounded"
          />
        </div>
      )}
      
      {!isImage && (
        <div className="w-8 h-8 flex-shrink-0">
          {isPDF ? (
            <DocumentIcon className="w-8 h-8 text-red-400" />
          ) : isWord ? (
            <DocumentIcon className="w-8 h-8 text-blue-600" />
          ) : isExcel ? (
            <DocumentIcon className="w-8 h-8 text-green-600" />
          ) : isPowerPoint ? (
            <DocumentIcon className="w-8 h-8 text-orange-500" />
          ) : isText ? (
            <DocumentIcon className="w-8 h-8 text-blue-400" />
          ) : (
            <DocumentIcon className="w-8 h-8 text-gpt-gray-400" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{file.name}</div>
        <div className="text-xs text-gpt-gray-400">{formatFileSize(file.size)}</div>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gpt-gray-600 hover:bg-gpt-gray-500 rounded-full flex items-center justify-center transition-colors"
        >
          <XMarkIcon className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  )
}