'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { clearAllChats, getStorageInfo, performStorageCleanup } from '@/lib/storage'
import { useUIText } from '@/hooks/useUIText'

interface StorageInfoState {
  used: number
  limit: number
  percentage: number
}

const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export default function SettingsPage() {
  const { settings } = useSettings()
  const [storageInfo, setStorageInfo] = useState<StorageInfoState>({ used: 0, limit: 5_000_000, percentage: 0 })
  const [statusMessage, setStatusMessage] = useState<string>('')
  const t = useUIText()
  const isJapanese = settings.language === 'ja'

  useEffect(() => {
    try {
      setStorageInfo(getStorageInfo())
    } catch (error) {
      console.error('Failed to read storage info:', error)
    }
  }, [])

  const handleClearChats = () => {
    const confirmation = isJapanese
      ? 'このデバイスに保存されているチャット履歴をすべて削除します。続行しますか？'
      : 'This will remove all stored chats on this device. Continue?'
    if (confirm(confirmation)) {
      clearAllChats()
      setStatusMessage(isJapanese ? 'チャット履歴を削除しました。ページを再読み込みします。' : 'Chat history cleared. The page will refresh to apply changes.')
      setTimeout(() => {
        window.location.reload()
      }, 600)
    }
  }

  const handleCleanup = () => {
    performStorageCleanup()
    setStorageInfo(getStorageInfo())
    setStatusMessage(isJapanese ? 'ストレージのクリーンアップが完了しました。' : 'Storage cleanup complete.')
  }

  return (
    <div className="min-h-screen bg-gpt-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">{isJapanese ? '設定' : t('settings')}</h1>
          <p className="text-gpt-gray-400">
            {isJapanese
              ? 'ローカル環境でのデータ管理やメンテナンスを行えます。応答言語はサイドバーの環境設定から変更してください。'
              : 'Manage local data and maintenance tools here. Response language can be changed from the sidebar preferences.'}
          </p>
        </div>

        <section className="bg-gpt-gray-800 border border-gpt-gray-700 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{isJapanese ? 'データ & ストレージ' : 'Data & Storage'}</h2>
            <p className="text-sm text-gpt-gray-400">
              {isJapanese
                ? 'ローカルストレージの利用状況を確認し、必要に応じて整理します。'
                : 'Monitor local storage usage and perform maintenance.'}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-gpt-gray-800 rounded-lg p-4">
              <div className="text-gpt-gray-400">{isJapanese ? '使用量' : 'Used'}</div>
              <div className="text-lg font-semibold">{formatBytes(storageInfo.used)}</div>
            </div>
            <div className="bg-gpt-gray-800 rounded-lg p-4">
              <div className="text-gpt-gray-400">{isJapanese ? '上限' : 'Limit'}</div>
              <div className="text-lg font-semibold">{formatBytes(storageInfo.limit)}</div>
            </div>
            <div className="bg-gpt-gray-800 rounded-lg p-4">
              <div className="text-gpt-gray-400">{isJapanese ? '使用率' : 'Utilisation'}</div>
              <div className="text-lg font-semibold">{storageInfo.percentage.toFixed(1)}%</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCleanup}
              className="px-4 py-2 bg-gpt-gray-800 hover:bg-gpt-gray-700 border border-gpt-gray-700 rounded-lg transition-colors"
            >
              {isJapanese ? 'ストレージをクリーンアップ' : 'Run storage cleanup'}
            </button>
            <button
              onClick={handleClearChats}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
            >
              {isJapanese ? 'チャット履歴をすべて削除' : 'Clear all chats'}
            </button>
          </div>
        </section>

        {statusMessage && (
          <div className="bg-gpt-gray-800 border border-gpt-gray-700 text-sm px-4 py-3 rounded-lg text-gpt-gray-200">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}
