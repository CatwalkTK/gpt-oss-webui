'use client'

import { useState } from 'react'
import { PlusIcon, ChatBubbleLeftIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Chat } from '@/types/chat'
import { CustomGPT } from '@/types/mygpt'
import { useUIText } from '@/hooks/useUIText'
import { useSettings } from '@/context/SettingsContext'
import { LANGUAGE_OPTIONS, LanguageCode, ThemeMode, SidebarPosition, TextSize } from '@/types/settings'

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  selectedGPT: CustomGPT | null
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export default function Sidebar({ chats, currentChatId, selectedGPT, onNewChat, onSelectChat, onDeleteChat }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const t = useUIText()
  const { settings, setLanguage, updateSettings, isLoaded } = useSettings()

  const isJapanese = settings.language === 'ja'
  const isRight = settings.sidebarPosition === 'right'

  const toggleButtonPosition = isRight ? 'right-4' : 'left-4'
  const panelPositionClass = isRight ? 'right-0' : 'left-0'
  const borderClass = isRight ? 'border-l border-gpt-gray-800' : 'border-r border-gpt-gray-800'
  const hiddenTransform = isRight ? 'translate-x-full' : '-translate-x-full'

  const languageAutoMap: Record<LanguageCode, string> = {
    auto: 'Auto (Detect)',
    en: 'Auto (Detect)',
    ja: '自動（判定）',
    fr: 'Auto (Détection)',
    it: 'Auto (Rilevamento)',
    pt: 'Automático (Detecção)',
    de: 'Auto (Erkennung)',
    zh: '自动（识别）',
    ko: '자동 (감지)',
    th: 'อัตโนมัติ (ตรวจจับ)',
    vi: 'Tự động (Nhận biết)'
  }

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: isJapanese ? 'ダーク' : 'Dark' },
    { value: 'light', label: isJapanese ? 'ライト' : 'Light' }
  ]

  const positionOptions: { value: SidebarPosition; label: string }[] = [
    { value: 'left', label: isJapanese ? '左側に表示' : 'Left side' },
    { value: 'right', label: isJapanese ? '右側に表示' : 'Right side' }
  ]

  const sizeOptions: { value: TextSize; label: string }[] = [
    { value: 'compact', label: isJapanese ? 'コンパクト' : 'Compact' },
    { value: 'normal', label: isJapanese ? '標準' : 'Normal' },
    { value: 'large', label: isJapanese ? '大きい' : 'Large' }
  ]

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as LanguageCode)
  }

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ theme: event.target.value as ThemeMode })
  }

  const handlePositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ sidebarPosition: event.target.value as SidebarPosition })
  }

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ textSize: event.target.value as TextSize })
  }

  const getLanguageLabel = (code: LanguageCode, fallback: string) => {
    if (code === 'auto') {
      const localized = languageAutoMap[settings.language as LanguageCode]
      return localized ?? languageAutoMap.en
    }
    return fallback
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-4 ${toggleButtonPosition} z-50 p-2 bg-gpt-gray-800 rounded-lg`}
      >
        {isOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      <div className={`
        fixed inset-y-0 ${panelPositionClass} z-40 w-64 bg-gpt-gray-900 ${borderClass}
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : hiddenTransform}
        md:translate-x-0 md:static md:inset-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gpt-gray-800 hover:bg-gpt-gray-700 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">{t('newChat')}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer
                  transition-colors group
                  ${currentChatId === chat.id 
                    ? 'bg-gpt-gray-800 text-white' 
                    : 'hover:bg-gpt-gray-800 text-gpt-gray-300'
                  }
                `}
                onClick={() => onSelectChat(chat.id)}
              >
                <ChatBubbleLeftIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-auto p-1 hover:bg-gpt-gray-700 rounded"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gpt-gray-800 space-y-2">
            {selectedGPT && (
              <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs font-bold">
                  {selectedGPT.avatar || selectedGPT.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{selectedGPT.name}</div>
                  <div className="text-xs text-white text-opacity-70">{t('activeMyGPT')}</div>
                </div>
              </div>
            )}
            <a 
              href="/mygpts"
              className="flex items-center gap-3 px-3 py-2 text-gpt-gray-300 hover:bg-gpt-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-lg">⚡</span>
              <span className="text-sm">{t('myGPTs')}</span>
            </a>
            <a 
              href="/search"
              className="flex items-center gap-3 px-3 py-2 text-gpt-gray-300 hover:bg-gpt-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-lg">🔍</span>
              <span className="text-sm">{t('documentSearch')}</span>
            </a>
            <button
              type="button"
              onClick={() => setShowPreferences(prev => !prev)}
              className="w-full flex items-center gap-3 px-3 py-2 text-gpt-gray-300 hover:bg-gpt-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span className="text-sm flex-1 text-left">{t('preferences')}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showPreferences ? 'rotate-180' : ''}`} />
            </button>
            {showPreferences && (
              <div className="px-3 pt-2 pb-4 space-y-4 text-xs text-gpt-gray-300">
                <div className="space-y-2">
                  <label htmlFor="sidebar-language" className="text-[11px] uppercase tracking-wide text-gpt-gray-500">
                    {t('languageLabel')}
                  </label>
                  <select
                    id="sidebar-language"
                    value={settings.language}
                    onChange={handleLanguageChange}
                    disabled={!isLoaded}
                    className="w-full bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGE_OPTIONS.map(option => (
                      <option key={option.code} value={option.code}>
                        {getLanguageLabel(option.code, option.label)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gpt-gray-500">
                    {t('languageHelperShort')}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sidebar-theme" className="text-[11px] uppercase tracking-wide text-gpt-gray-500">
                    {isJapanese ? 'テーマ' : 'Theme'}
                  </label>
                  <select
                    id="sidebar-theme"
                    value={settings.theme}
                    onChange={handleThemeChange}
                    className="w-full bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {themeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sidebar-position" className="text-[11px] uppercase tracking-wide text-gpt-gray-500">
                    {isJapanese ? 'サイドバー位置' : 'Sidebar position'}
                  </label>
                  <select
                    id="sidebar-position"
                    value={settings.sidebarPosition}
                    onChange={handlePositionChange}
                    className="w-full bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {positionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sidebar-text-size" className="text-[11px] uppercase tracking-wide text-gpt-gray-500">
                    {isJapanese ? '表示サイズ' : 'Interface size'}
                  </label>
                  <select
                    id="sidebar-text-size"
                    value={settings.textSize}
                    onChange={handleSizeChange}
                    className="w-full bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="text-xs text-gpt-gray-500 px-3">
              {t('appName')}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
