'use client'

import { useState } from 'react'
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSettings } from '@/context/SettingsContext'

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings } = useSettings()
  const isJapanese = settings.language === 'ja'
  const isSidebarRight = settings.sidebarPosition === 'right'

  const shortcuts = [
    {
      key: 'Ctrl+N / ⌘N',
      action: isJapanese ? '新しいチャット' : 'New Chat',
      description: isJapanese ? '新しい会話を開始します' : 'Start a new conversation'
    },
    {
      key: 'Ctrl+K / ⌘K',
      action: isJapanese ? '入力フィールドにフォーカス' : 'Focus Input',
      description: isJapanese ? 'メッセージ入力欄にカーソルを移動' : 'Move cursor to message input'
    },
    {
      key: 'Ctrl+/ / ⌘/',
      action: isJapanese ? '文書検索パネル切り替え' : 'Toggle Search Panel',
      description: isJapanese ? 'ベクトル検索パネルの表示/非表示' : 'Show/hide vector search panel'
    },
    {
      key: 'Escape',
      action: isJapanese ? '閉じる/キャンセル' : 'Close/Cancel',
      description: isJapanese ? 'モーダルを閉じるかフォーカスを外す' : 'Close modals or blur focus'
    },
    {
      key: 'Enter',
      action: isJapanese ? 'メッセージ送信' : 'Send Message',
      description: isJapanese ? 'メッセージを送信 (Shift+Enterで改行)' : 'Send message (Shift+Enter for new line)'
    }
  ]

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 border border-gpt-gray-600 rounded-full transition-colors shadow-lg hover:shadow-xl"
        title={isJapanese ? 'キーボードショートカット (?)' : 'Keyboard Shortcuts (?)'}
      >
        <QuestionMarkCircleIcon className="w-5 h-5 text-gpt-gray-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gpt-gray-900 border border-gpt-gray-700 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gpt-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {isJapanese ? 'キーボードショートカット' : 'Keyboard Shortcuts'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gpt-gray-800 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gpt-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <kbd className="px-2 py-1 bg-gpt-gray-800 border border-gpt-gray-600 rounded text-xs font-mono text-gpt-gray-300">
                      {isMac ? shortcut.key.replace('Ctrl', '⌘') : shortcut.key.split(' / ')[0]}
                    </kbd>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{shortcut.action}</div>
                    <div className="text-xs text-gpt-gray-400 mt-1">{shortcut.description}</div>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-4 border-t border-gpt-gray-700">
                <div className="text-xs text-gpt-gray-500">
                  {isJapanese
                    ? 'これらのショートカットは大部分のページで利用できます。'
                    : 'These shortcuts work on most pages throughout the application.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}