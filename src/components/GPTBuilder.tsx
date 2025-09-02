'use client'

import { useState } from 'react'
import { CustomGPT, DEFAULT_CATEGORIES } from '@/types/mygpt'
import { XMarkIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface GPTBuilderProps {
  gpt?: CustomGPT
  onSave: (gpt: Omit<CustomGPT, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function GPTBuilder({ gpt, onSave, onCancel }: GPTBuilderProps) {
  const [formData, setFormData] = useState({
    name: gpt?.name || '',
    description: gpt?.description || '',
    instructions: gpt?.instructions || '',
    conversationStarters: gpt?.conversationStarters || [''],
    capabilities: gpt?.capabilities || {
      webBrowsing: false,
      dalleImageGeneration: false,
      codeInterpreter: false
    },
    isPublic: gpt?.isPublic || false,
    category: gpt?.category || 'writing',
    avatar: gpt?.avatar || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      knowledgeFiles: [],
      conversationStarters: formData.conversationStarters.filter(s => s.trim())
    })
  }

  const addConversationStarter = () => {
    setFormData(prev => ({
      ...prev,
      conversationStarters: [...prev.conversationStarters, '']
    }))
  }

  const removeConversationStarter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conversationStarters: prev.conversationStarters.filter((_, i) => i !== index)
    }))
  }

  const updateConversationStarter = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      conversationStarters: prev.conversationStarters.map((starter, i) => 
        i === index ? value : starter
      )
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gpt-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {gpt ? 'Edit GPT' : 'Create a GPT'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-gpt-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Give your GPT a name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What does your GPT do?"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full px-4 py-3 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What does this GPT do? How does it behave? What should it avoid doing?"
                  rows={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Conversation starters</label>
                <div className="space-y-3">
                  {formData.conversationStarters.map((starter, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={starter}
                        onChange={(e) => updateConversationStarter(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-gpt-gray-700 border border-gpt-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What can users ask this GPT?"
                      />
                      {formData.conversationStarters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeConversationStarter(index)}
                          className="p-2 text-gpt-gray-400 hover:text-white transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.conversationStarters.length < 4 && (
                    <button
                      type="button"
                      onClick={addConversationStarter}
                      className="w-full py-2 border-2 border-dashed border-gpt-gray-600 rounded-lg text-gpt-gray-400 hover:border-gpt-gray-500 hover:text-gpt-gray-300 transition-colors"
                    >
                      + Add starter
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Capabilities</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.webBrowsing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        capabilities: { ...prev.capabilities, webBrowsing: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gpt-gray-700 border-gpt-gray-600 rounded focus:ring-blue-500"
                    />
                    <span>Web Browsing</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.dalleImageGeneration}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        capabilities: { ...prev.capabilities, dalleImageGeneration: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gpt-gray-700 border-gpt-gray-600 rounded focus:ring-blue-500"
                    />
                    <span>DALL·E Image Generation</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.codeInterpreter}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        capabilities: { ...prev.capabilities, codeInterpreter: e.target.checked }
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gpt-gray-700 border-gpt-gray-600 rounded focus:ring-blue-500"
                    />
                    <span>Code Interpreter</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Knowledge</label>
                <div className="border-2 border-dashed border-gpt-gray-600 rounded-lg p-6 text-center">
                  <DocumentIcon className="w-12 h-12 text-gpt-gray-400 mx-auto mb-3" />
                  <p className="text-gpt-gray-400 mb-2">Upload files</p>
                  <p className="text-xs text-gpt-gray-500">
                    Upload documents that your GPT can reference
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.pdf,.docx"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block mt-3 px-4 py-2 bg-gpt-gray-700 hover:bg-gpt-gray-600 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose files
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gpt-gray-700 border-gpt-gray-600 rounded focus:ring-blue-500"
                  />
                  <span>Make this GPT public</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gpt-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gpt-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {gpt ? 'Update GPT' : 'Create GPT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}