'use client'

import { Message } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { UserIcon } from '@heroicons/react/24/solid'
import FileAttachmentComponent from './FileAttachment'
import MarkdownRenderer from './MarkdownRenderer'

interface MessageBubbleProps {
  message: Message
  selectedGPT?: CustomGPT | null
}

export default function MessageBubble({ message, selectedGPT }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`
      flex gap-4 p-6 
      ${isUser ? 'bg-gpt-gray-900' : 'bg-gpt-gray-800'}
    `}>
      <div className="w-8 h-8 flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-gpt-gray-600 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5" />
          </div>
        ) : selectedGPT ? (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
            {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">G</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.attachments.map((attachment) => (
              <FileAttachmentComponent 
                key={attachment.id} 
                file={attachment}
                showPreview={true}
              />
            ))}
          </div>
        )}
        
        {message.role === 'assistant' ? (
          <>
            <MarkdownRenderer content={message.content} />
          </>
        ) : (
          <>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-white">{message.content}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  )
}