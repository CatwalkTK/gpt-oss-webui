'use client'

import { useState } from 'react'
import { Chat, ChatFolder } from '@/types/chat'
import {
  ChatBubbleLeftIcon,
  StarIcon,
  FolderIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { useUIText } from '@/hooks/useUIText'

interface ChatOrganizerProps {
  favorites: Chat[]
  folderGroups: Array<{ folder: ChatFolder; chats: Chat[] }>
  uncategorized: Chat[]
  folders: ChatFolder[]
  currentChatId: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onToggleFavorite: (chatId: string) => void
  onMoveChatToFolder: (chatId: string, folderId: string | undefined) => void
  onCreateFolder: (name: string) => ChatFolder
  onUpdateFolder: (folderId: string, updates: Partial<ChatFolder>) => void
  onDeleteFolder: (folderId: string) => void
  FOLDER_COLORS: string[]
}

export default function ChatOrganizer({
  favorites,
  folderGroups,
  uncategorized,
  folders,
  currentChatId,
  searchQuery,
  onSearchChange,
  onSelectChat,
  onDeleteChat,
  onToggleFavorite,
  onMoveChatToFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  FOLDER_COLORS
}: ChatOrganizerProps) {
  const [showNewFolderForm, setShowNewFolderForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ chatId: string; x: number; y: number } | null>(null)
  const t = useUIText()

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolderForm(false)
    }
  }

  const handleUpdateFolder = (folderId: string) => {
    if (editFolderName.trim()) {
      onUpdateFolder(folderId, { name: editFolderName.trim() })
      setEditingFolder(null)
      setEditFolderName('')
    }
  }

  const startEditingFolder = (folder: ChatFolder) => {
    setEditingFolder(folder.id)
    setEditFolderName(folder.name)
  }

  const handleRightClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault()
    setContextMenu({
      chatId,
      x: e.clientX,
      y: e.clientY
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const ChatItem = ({ chat, showFolder = false }: { chat: Chat; showFolder?: boolean }) => {
    const folder = showFolder && chat.folderId ? folders.find(f => f.id === chat.folderId) : null

    return (
      <div
        className={`
          flex items-center gap-3 px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer
          transition-colors group md:px-2 lg:px-3
          ${currentChatId === chat.id
            ? 'bg-gpt-gray-800 text-white'
            : 'hover:bg-gpt-gray-800 text-gpt-gray-300'
          }
        `}
        onClick={() => onSelectChat(chat.id)}
        onContextMenu={(e) => handleRightClick(e, chat.id)}
        title={chat.title}
      >
        <ChatBubbleLeftIcon className="w-4 h-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm md:hidden lg:inline">{chat.title}</div>
          {showFolder && folder && (
            <div className="text-xs text-gpt-gray-500 md:hidden lg:inline">{folder.name}</div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(chat.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gpt-gray-700 rounded md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          title={chat.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {chat.isFavorite ? (
            <StarSolidIcon className="w-3 h-3 text-yellow-400" />
          ) : (
            <StarIcon className="w-3 h-3" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeleteChat(chat.id)
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gpt-gray-700 rounded md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          title="Delete chat"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2">
      {/* Search */}
      <div className="mx-2 mb-3 relative">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gpt-gray-500" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <XMarkIcon className="w-4 h-4 text-gpt-gray-500 hover:text-white" />
          </button>
        )}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gpt-gray-400 uppercase tracking-wide">
            <StarSolidIcon className="w-4 h-4 text-yellow-400" />
            <span className="md:hidden lg:inline">Favorites</span>
          </div>
          {favorites.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      )}

      {/* Folders */}
      {folderGroups.map(({ folder, chats }) => (
        <div key={folder.id} className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2 group">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            {editingFolder === folder.id ? (
              <input
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateFolder(folder.id)
                  if (e.key === 'Escape') setEditingFolder(null)
                }}
                onBlur={() => handleUpdateFolder(folder.id)}
                className="flex-1 bg-gpt-gray-800 border border-gpt-gray-700 rounded px-2 py-1 text-xs"
                autoFocus
              />
            ) : (
              <span className="flex-1 text-xs font-semibold text-gpt-gray-400 uppercase tracking-wide md:hidden lg:inline">
                {folder.name}
              </span>
            )}
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 md:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
              <button
                onClick={() => startEditingFolder(folder)}
                className="p-1 hover:bg-gpt-gray-700 rounded"
                title="Edit folder"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDeleteFolder(folder.id)}
                className="p-1 hover:bg-gpt-gray-700 rounded"
                title="Delete folder"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      ))}

      {/* New Folder Button */}
      <div className="mx-2 mb-4">
        {showNewFolderForm ? (
          <div className="flex items-center gap-2 p-2 bg-gpt-gray-800 rounded-lg">
            <FolderIcon className="w-4 h-4 text-gpt-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
                if (e.key === 'Escape') {
                  setShowNewFolderForm(false)
                  setNewFolderName('')
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              Create
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewFolderForm(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-gpt-gray-400 hover:bg-gpt-gray-800 hover:text-white rounded-lg transition-colors text-sm"
          >
            <FolderPlusIcon className="w-4 h-4" />
            <span className="md:hidden lg:inline">New Folder</span>
          </button>
        )}
      </div>

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gpt-gray-400 uppercase tracking-wide">
            <FolderIcon className="w-4 h-4" />
            <span className="md:hidden lg:inline">Uncategorized</span>
          </div>
          {uncategorized.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg shadow-lg py-1"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="px-3 py-2 text-xs text-gpt-gray-400 border-b border-gpt-gray-700">
              Move to folder:
            </div>
            <button
              onClick={() => {
                onMoveChatToFolder(contextMenu.chatId, undefined)
                closeContextMenu()
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gpt-gray-700 transition-colors"
            >
              <FolderIcon className="w-4 h-4 inline mr-2" />
              Uncategorized
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  onMoveChatToFolder(contextMenu.chatId, folder.id)
                  closeContextMenu()
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gpt-gray-700 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full inline mr-2"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}