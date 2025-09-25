'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { CustomGPT, DEFAULT_CATEGORIES } from '@/types/mygpt'
import { loadCustomGPTs, saveCustomGPTs, saveSelectedGPT, setStartNewChatFlag } from '@/lib/storage'
import GPTBuilder from '@/components/GPTBuilder'
import GPTCard from '@/components/GPTCard'

export default function MyGPTs() {
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingGPT, setEditingGPT] = useState<CustomGPT | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const loadedGPTs = loadCustomGPTs()
    setCustomGPTs(loadedGPTs)
  }, [])


  const handleSaveGPT = (gptData: Omit<CustomGPT, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    
    if (editingGPT) {
      const updatedGPTs = customGPTs.map(gpt => 
        gpt.id === editingGPT.id 
          ? { ...gptData, id: editingGPT.id, createdAt: editingGPT.createdAt, updatedAt: now }
          : gpt
      )
      setCustomGPTs(updatedGPTs)
      saveCustomGPTs(updatedGPTs)
    } else {
      const newGPT: CustomGPT = {
        ...gptData,
        id: `gpt-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      }
      const updatedGPTs = [newGPT, ...customGPTs]
      setCustomGPTs(updatedGPTs)
      saveCustomGPTs(updatedGPTs)
    }
    
    setShowBuilder(false)
    setEditingGPT(null)
  }

  const handleEditGPT = (gpt: CustomGPT) => {
    setEditingGPT(gpt)
    setShowBuilder(true)
  }

  const handleDeleteGPT = (gptId: string) => {
    if (confirm('Are you sure you want to delete this GPT?')) {
      const updatedGPTs = customGPTs.filter(gpt => gpt.id !== gptId)
      setCustomGPTs(updatedGPTs)
      saveCustomGPTs(updatedGPTs)
    }
  }

  const handleChatWithGPT = (gpt: CustomGPT) => {
    saveSelectedGPT(gpt)
    setStartNewChatFlag(true)
    window.location.href = '/'
  }

  const filteredGPTs = customGPTs.filter(gpt => {
    const matchesSearch = gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gpt.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || gpt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gpt-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My GPTs</h1>
            <p className="text-gpt-gray-400">Create and manage your custom GPTs</p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Create a GPT
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gpt-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GPTs..."
              className="w-full pl-10 pr-4 py-3 bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gpt-gray-800 border border-gpt-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {DEFAULT_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {filteredGPTs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gpt-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-12 h-12 text-gpt-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {customGPTs.length === 0 ? 'Create your first GPT' : 'No GPTs found'}
            </h3>
            <p className="text-gpt-gray-400 mb-6">
              {customGPTs.length === 0 
                ? 'Get started by creating a custom GPT tailored to your needs'
                : 'Try adjusting your search or category filter'
              }
            </p>
            {customGPTs.length === 0 && (
              <button
                onClick={() => setShowBuilder(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create a GPT
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGPTs.map((gpt) => (
              <GPTCard
                key={gpt.id}
                gpt={gpt}
                onChat={handleChatWithGPT}
                onEdit={handleEditGPT}
                onDelete={handleDeleteGPT}
              />
            ))}
          </div>
        )}

        {showBuilder && (
          <GPTBuilder
            gpt={editingGPT || undefined}
            onSave={handleSaveGPT}
            onCancel={() => {
              setShowBuilder(false)
              setEditingGPT(null)
            }}
          />
        )}
      </div>
    </div>
  )
}