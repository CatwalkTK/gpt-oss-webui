'use client'

import { useState, useRef } from 'react'
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useSettings } from '@/context/SettingsContext'
import { showToast } from './ToastContainer'
import { exportChatHistory, downloadExport, importChatHistory, validateImportData } from '@/lib/chatExportImport'
import { Chat } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'

interface ChatExportImportProps {
  chats: Chat[]
  customGPTs: CustomGPT[]
  onImport: (chats: Chat[], customGPTs: CustomGPT[]) => void
}

export default function ChatExportImport({ chats, customGPTs, onImport }: ChatExportImportProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { settings } = useSettings()
  const isJapanese = settings.language === 'ja'

  const handleExport = () => {
    try {
      const exportData = exportChatHistory(chats, customGPTs)
      downloadExport(exportData)

      showToast(
        isJapanese
          ? `${chats.length}件のチャット履歴をエクスポートしました`
          : `Exported ${chats.length} chat histories`,
        'success'
      )
    } catch (error) {
      console.error('Export failed:', error)
      showToast(
        isJapanese
          ? 'エクスポートに失敗しました'
          : 'Export failed',
        'error'
      )
    }
  }

  const handleImport = async (file: File) => {
    setIsProcessing(true)

    try {
      const { chats: importedChats, customGPTs: importedGPTs, metadata } = await importChatHistory(file)

      // Validate imported data
      const validation = validateImportData(importedChats)
      if (!validation.valid) {
        throw new Error(`Invalid data: ${validation.errors.join(', ')}`)
      }

      // Generate new IDs to avoid conflicts
      const processedChats = importedChats.map(chat => ({
        ...chat,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `[Imported] ${chat.title}`,
        messages: chat.messages.map(msg => ({
          ...msg,
          id: `imported-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }))

      const processedGPTs = importedGPTs.map(gpt => ({
        ...gpt,
        id: `imported-gpt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))

      onImport(processedChats, processedGPTs)

      showToast(
        isJapanese
          ? `${importedChats.length}件のチャット履歴をインポートしました`
          : `Imported ${importedChats.length} chat histories`,
        'success'
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Import failed:', error)
      showToast(
        isJapanese
          ? `インポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
          : `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.json')) {
        showToast(
          isJapanese
            ? 'JSONファイルを選択してください'
            : 'Please select a JSON file',
          'warning'
        )
        return
      }

      handleImport(file)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          {isJapanese ? 'データの管理' : 'Data Management'}
        </h3>
        <p className="text-sm text-gpt-gray-400 mb-6">
          {isJapanese
            ? 'チャット履歴とカスタムGPTをJSONファイルとしてエクスポート・インポートできます。'
            : 'Export and import your chat histories and custom GPTs as JSON files.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleExport}
          disabled={chats.length === 0}
          className="flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gpt-gray-700 disabled:text-gpt-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">
              {isJapanese ? 'エクスポート' : 'Export'}
            </div>
            <div className="text-xs opacity-80">
              {isJapanese ? `${chats.length}件のチャット` : `${chats.length} chats`}
            </div>
          </div>
        </button>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gpt-gray-700 disabled:text-gpt-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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
              <ArrowUpTrayIcon className="w-5 h-5" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {isJapanese ? 'インポート' : 'Import'}
              </div>
              <div className="text-xs opacity-80">
                {isProcessing
                  ? (isJapanese ? '処理中...' : 'Processing...')
                  : (isJapanese ? 'JSONファイル' : 'JSON file')
                }
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="text-xs text-gpt-gray-500 mt-4 p-3 bg-gpt-gray-800 rounded-lg">
        <p className="mb-2">
          <strong>{isJapanese ? '注意事項:' : 'Important:'}</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>• {isJapanese
            ? 'インポートしたデータは "[Imported]" の接頭辞が付きます'
            : 'Imported data will be prefixed with "[Imported]"'
          }</li>
          <li>• {isJapanese
            ? 'インポート時に新しいIDが生成されるため、既存データと重複しません'
            : 'New IDs are generated during import to avoid conflicts'
          }</li>
          <li>• {isJapanese
            ? 'エクスポートファイルには個人情報が含まれる場合があります'
            : 'Export files may contain personal information'
          }</li>
        </ul>
      </div>
    </div>
  )
}