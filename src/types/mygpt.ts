export interface CustomGPT {
  id: string
  name: string
  description: string
  instructions: string
  conversationStarters: string[]
  capabilities: {
    webBrowsing: boolean
    dalleImageGeneration: boolean
    codeInterpreter: boolean
  }
  knowledgeFiles: File[]
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  category: string
  avatar?: string
}

export interface GPTCategory {
  id: string
  name: string
  icon: string
  description: string
}

export const DEFAULT_CATEGORIES: GPTCategory[] = [
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'Help with writing tasks' },
  { id: 'productivity', name: 'Productivity', icon: '📈', description: 'Boost your productivity' },
  { id: 'research', name: 'Research', icon: '🔍', description: 'Research and analysis' },
  { id: 'programming', name: 'Programming', icon: '💻', description: 'Code and development' },
  { id: 'education', name: 'Education', icon: '🎓', description: 'Learning and teaching' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟', description: 'Personal and lifestyle' },
]