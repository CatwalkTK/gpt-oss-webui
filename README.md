# Clavi Local Mining with Vector Search RAG

Clavi Local Mining is a modern ChatGPT-style interface built with Next.js 15 and React 19, featuring advanced **Vector Search RAG (Retrieval-Augmented Generation)** capabilities for local document indexing and intelligent search.

## 🚀 Features

### Core Chat Functionality
- **Real-time AI Chat**: Interactive conversations with streaming responses
- **Multiple Chat Management**: Manage multiple simultaneous conversations
- **Custom GPTs**: Create and manage personalized AI assistants
- **Conversation Starters**: Pre-defined prompts for quick chat initiation
- **Multimodal Support**: Handle images, PDFs, and Office documents
- **Inline Document Search**: Toggle a vector-search panel inside the chat, feed results straight into responses, or disable indexed context entirely for pure chat
- **Customisable Language Mode**: Choose the assistant's reply language from the Settings panel
- **Flexible Preferences**: Adjust theme, sidebar position, and interface size directly from the sidebar

### 🔍 Advanced Vector Search & RAG
- **Local Document Indexing**: Index your files locally using vector embeddings
- **Intelligent Search**: AI-powered semantic search through your documents
- **Context-Aware Responses**: AI answers enriched with relevant document content
- **Real-time Document Processing**: Automatic text extraction and chunking
- **Browser-based Storage**: All data stored locally using IndexedDB

### 📁 Supported File Types
- **Text Files**: `.txt`, `.md`, `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`
- **Web Files**: `.html`, `.css`, `.json`, `.xml`, `.yml`, `.yaml`, `.sql`
- **Scripts**: `.sh`, `.bat`, `.php`, `.rb`, `.go`, `.rs`, `.swift`
- **Documents**: `.pdf`, `.docx`, `.doc`, `.xlsx`, `.xls`, `.pptx`, `.ppt`

### 🌏 Language Support
- **Japanese Language**: Full support for Japanese text processing and OCR
- **Multilingual**: Supports multiple languages with intelligent context switching
- **IME Integration**: Prevents accidental message sending during Japanese input

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 15**: React 19-based modern web framework
- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Custom styling system
- **KaTeX**: Beautiful mathematical notation rendering
- **Heroicons**: Comprehensive icon library

### AI & Search Stack
- **Ollama Integration**: Local AI model execution
- **Vector Embeddings**: `nomic-embed-text` for document embeddings
- **Cosine Similarity**: Semantic search algorithm
- **IndexedDB**: Browser-native vector storage
- **Streaming API**: Real-time response generation

### RAG Implementation
```
Document → Text Extraction → Chunking → Embedding → Vector Store
                                                          ↓
User Query → Embedding → Similarity Search → Context Injection → AI Response
```

## 📦 Installation

### Prerequisites
- **Node.js 18+**
- **Ollama** (for local AI execution)

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/CatwalkTK/gpt-oss-webui.git
   cd gpt-oss-webui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install AI models**
   ```bash
   # Chat model (choose one)
   ollama pull deepseek-r1:7b
   
   # Embedding model (required for vector search)
   ollama pull nomic-embed-text
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Main chat: http://localhost:3000
   - Vector search: http://localhost:3000/search
   - Custom GPTs: http://localhost:3000/mygpts

## 🎯 Usage Guide

### Basic Chat
1. Navigate to the main page
2. Click "Start a new chat"
3. Type your message and press Enter
4. Enjoy streaming AI responses

### Document Search & RAG
1. **Open the Document Search tools**:
   - From the main chat, use the **Show Document Search** toggle in the header, or
   - Visit the dedicated page at http://localhost:3000/search

2. **Index your documents**:
   - **Option A**: Click "Index Folder" (Chrome/Edge only)
   - **Option B**: Click "Add Files" for individual files
   - **Option C**: Drag & drop files directly

3. **Search documents**:
   - Use the search bar to find relevant content
   - View similarity scores and document previews

4. **Chat with context**:
   - Once documents are indexed, every chat message automatically runs a semantic lookup
   - Relevant passages are injected into the prompt, even when you stay on the main chat view
   - Responses include pointers to the matched documents whenever possible

### Settings
1. Expand **Preferences** in the sidebar footer
2. Choose your reply **language**, toggle the **theme** (dark/light), switch the sidebar **position**, adjust the interface **size**, or disable **indexed context** when you want pure conversations
3. Use the `/settings` page when you need to review storage usage or clear saved chats

### Custom GPTs
1. Navigate to "My GPTs"
2. Click "Create a GPT"
3. Configure name, description, instructions, and conversation starters
4. Use your custom GPT for specialized tasks

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:11434  # Ollama API endpoint
```

### Model Configuration
Update `src/lib/constants.ts`:
```typescript
export const API_CONFIG = {
  DEFAULT_MODEL: 'deepseek-r1:7b',  # Your preferred chat model
  EMBEDDING_MODEL: 'nomic-embed-text'  # Embedding model for vector search
}
```

## 🗂️ Project Structure

```
gpt-oss-webui/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main chat interface
│   │   ├── search/            # Vector search & RAG page
│   │   └── mygpts/           # Custom GPT management
│   ├── components/            # React components
│   │   ├── VectorSearch.tsx  # Document indexing & search UI
│   │   ├── MessageBubble.tsx # Chat message display
│   │   └── ChatInput.tsx     # Message input with file support
│   ├── hooks/                 # React hooks
│   │   ├── useVectorSearch.ts # Vector search functionality
│   │   ├── useChatWithRAG.ts # RAG-enhanced chat
│   │   └── useChat.ts        # Standard chat functionality
│   ├── lib/                   # Core services
│   │   ├── vectorStore.ts    # IndexedDB vector storage
│   │   ├── embeddingService.ts # AI embedding generation
│   │   ├── documentIndexer.ts # Document processing
│   │   └── ragApi.ts         # RAG API integration
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── package.json              # Dependencies and scripts
```

## 🌟 Key Components

### Vector Search System
- **VectorStore**: IndexedDB-based local vector database
- **EmbeddingService**: AI-powered text embedding generation
- **DocumentIndexer**: File processing and chunking system
- **RAG API**: Context-aware response generation

### Chat System
- **Message Streaming**: Real-time response display
- **File Attachments**: Multimodal conversation support
- **Context Management**: Intelligent conversation history
- **Custom GPTs**: Personalized AI assistant creation

## 🔍 Browser Compatibility

### Directory Picker (Full folder indexing)
- ✅ **Google Chrome 86+**
- ✅ **Microsoft Edge 86+**
- ❌ Firefox, Safari (use "Add Files" instead)

### File Upload & Core Features
- ✅ **All modern browsers**
- ✅ **Drag & drop support**
- ✅ **IndexedDB storage**

## 🚀 Performance

### Indexing Performance
- **Text files**: ~100-500 files/minute
- **Binary files**: Slower, depends on size
- **Chunk size**: 500 characters (configurable)
- **Embedding generation**: ~100ms per chunk

### Search Performance
- **Vector similarity**: Real-time (<100ms)
- **Result ranking**: Cosine similarity based
- **Context retrieval**: Top-K relevant chunks

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project uses a **Triple License** system for maximum protection:

### 🔓 **Open Source License: AGPL-3.0**
- ✅ **Personal, Educational & Research**: Free to use, modify, and distribute
- ✅ **Network Services**: Must provide source code to all users
- ✅ **Modifications**: Must be released under AGPL-3.0
- ❌ **Commercial Closed-Source**: Not permitted under this license

### 💼 **Commercial License: Available**
- ✅ **Proprietary Integration**: No source code disclosure required
- ✅ **Commercial Services**: SaaS, enterprise deployments allowed
- ✅ **Closed-Source Distribution**: Full commercial rights
- ✅ **Premium Support**: Technical support and warranties included

### 📚 **Documentation License: CC BY-NC-SA 4.0**
- ✅ **Share & Adapt**: For non-commercial purposes
- ✅ **Attribution Required**: Must credit the original author
- ❌ **Commercial Use**: Requires separate permission

---

### 🤝 **Choose Your License**

| Use Case | License Required | Contact |
|----------|------------------|---------|
| **Personal/Educational** | AGPL-3.0 (Free) | Use freely |
| **Open Source Project** | AGPL-3.0 (Free) | Must share improvements |
| **Commercial Product** | Commercial License | [Get Commercial License](mailto:tsuda@ryowa-inc.co.jp) |
| **Enterprise/SaaS** | Commercial License | [Enterprise Inquiry](mailto:tsuda@ryowa-inc.co.jp) |

### 💡 **Why This License Structure?**

This **Triple License** approach ensures:
- 🌟 **Innovation Protection**: Your advanced RAG technology remains protected
- 💰 **Revenue Opportunity**: Commercial users pay for the value they receive
- 🤝 **Community Growth**: Open source community can still benefit and contribute
- ⚖️ **Legal Clarity**: Clear terms prevent licensing confusion

**Questions about licensing?** Contact: [tsuda@ryowa-inc.co.jp](mailto:tsuda@ryowa-inc.co.jp)

See [LICENSE](./LICENSE) file for full terms and conditions.

## 🙏 Acknowledgments

- **Ollama** for local AI model execution
- **Next.js** team for the excellent framework
- **Nomic AI** for the embedding model
- **OpenAI** for API compatibility standards
