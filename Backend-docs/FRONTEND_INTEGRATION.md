# Frontend Integration Guide

This guide is specifically for frontend developers integrating with the RAG-as-a-Service API. It covers the complete user journey, UI recommendations, and code examples.

---

## Table of Contents

1. [User Journey Overview](#user-journey-overview)
2. [Phase 1: Project Setup](#phase-1-project-setup)
3. [Phase 2: Document Management](#phase-2-document-management)
4. [Phase 3: Project Activation](#phase-3-project-activation)
5. [Phase 4: Chat Interface](#phase-4-chat-interface)
6. [Phase 5: Widget Embedding](#phase-5-widget-embedding)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [API Client Example](#api-client-example)

---

## User Journey Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         Complete User Journey                               │
└────────────────────────────────────────────────────────────────────────────┘

╔═══════════════╗      ╔═══════════════╗      ╔═══════════════╗      ╔═══════════════╗
║    CREATE     ║      ║    UPLOAD     ║      ║   ACTIVATE    ║      ║     USE       ║
║    PROJECT    ║  ──► ║   DOCUMENTS   ║  ──► ║    PROJECT    ║  ──► ║   CHAT API    ║
║               ║      ║               ║      ║               ║      ║               ║
║  Draft Mode   ║      ║  Processing   ║      ║  Active Mode  ║      ║  Production   ║
╚═══════════════╝      ╚═══════════════╝      ╚═══════════════╝      ╚═══════════════╝
      │                       │                       │                       │
      ▼                       ▼                       ▼                       ▼
┌─────────────┐        ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ Name        │        │ PDF/DOCX    │        │ Activate    │        │ Chat UI     │
│ Description │        │ Confluence  │        │ API Keys    │        │ Streaming   │
│ LLM Config  │        │ Custom Meta │        │ Status      │        │ Sources     │
│ Prompts     │        │ Processing  │        │             │        │ History     │
└─────────────┘        └─────────────┘        └─────────────┘        └─────────────┘
```

---

## Phase 1: Project Setup

### UI Components Needed

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Project                                    [X]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Project Name *                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ My Knowledge Base                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Description                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ AI assistant for company documentation                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ▼ Advanced Settings                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ LLM Model:     [azure-4.1        ▼]                    │  │
│  │ Temperature:   [0.7             ▼]                     │  │
│  │ Top K Results: [5               ▼]                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ Upload YAML     │  │     Create Project              │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Flow

```typescript
// Step 1: Create project
const response = await fetch('/api/v1/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': tenantId
  },
  body: JSON.stringify({
    name: 'My Knowledge Base',
    description: 'AI assistant for company docs',
    config: {
      llm_config: {
        config_name: 'azure-4.1',
        temperature: 0.7
      },
      retrieval_config: {
        top_k: 5
      }
    }
  })
});

const { project, api_key } = await response.json();

// ⚠️ IMPORTANT: Show API key to user and warn them to save it!
showApiKeyModal(api_key); // "rag_abc123xyz..."
```

### UI States

| State | Description | User Action |
|-------|-------------|-------------|
| Initial | Empty form | Fill form |
| Submitting | Loading spinner | Wait |
| Success | Show API key modal | Copy & save key |
| Error | Show error message | Fix & retry |

### API Key Modal (Critical!)

```
┌──────────────────────────────────────────────────────────────┐
│  🔑 Your API Key                                       [X]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ Save this key now! It won't be shown again.             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ rag_7b8f9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f │  │
│  └────────────────────────────────────────────────────────┘  │
│                                  [📋 Copy to Clipboard]      │
│                                                              │
│  ☑ I have saved my API key                                  │
│                                                              │
│              [Continue to Documents →]                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Document Management

### UI Components Needed

```
┌──────────────────────────────────────────────────────────────┐
│  Documents                              [+ Upload] [⟳ Sync]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Upload Zone ────────────────────────────────────────────┐│
│  │                                                          ││
│  │     📄                                                   ││
│  │     Drag & drop files here                               ││
│  │     or click to browse                                   ││
│  │                                                          ││
│  │     Supported: PDF, DOCX, TXT, MD                        ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─ Documents List ─────────────────────────────────────────┐│
│  │ ☑ contract.pdf         42 chunks    ✅ Completed    🗑   ││
│  │ ☑ policy.docx          28 chunks    ⏳ Processing   🗑   ││
│  │ ☑ manual.pdf           --           ❌ Failed       🔄   ││
│  │ ☐ guide.md             15 chunks    ✅ Completed    🗑   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Total: 4 documents | 85 chunks | Status: Processing        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Upload with Progress

```typescript
// File upload with processing options
const uploadDocument = async (file: File, projectId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('processing_config', JSON.stringify({
    chunking_strategy: 'document_aware',
    image_handling: 'llm_describe'
  }));

  const response = await fetch(
    `/api/v1/projects/${projectId}/documents/upload`,
    {
      method: 'POST',
      headers: { 'X-User-ID': tenantId },
      body: formData
    }
  );

  return await response.json();
  // Returns: { document_id, status, chunks_created, ... }
};
```

### Polling for Status

```typescript
// Poll document status until complete
const pollDocumentStatus = async (projectId: string, documentId: string) => {
  const poll = async (): Promise<Document> => {
    const response = await fetch(
      `/api/v1/projects/${projectId}/documents/${documentId}/status`,
      { headers: { 'X-User-ID': tenantId } }
    );
    const doc = await response.json();
    
    if (doc.processing_status === 'processing' || doc.processing_status === 'pending') {
      await sleep(2000); // Poll every 2 seconds
      return poll();
    }
    
    return doc;
  };
  
  return poll();
};
```

### Confluence Sync Modal

```
┌──────────────────────────────────────────────────────────────┐
│  Import from Confluence                                [X]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Confluence Page URL *                                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ https://yoursite.atlassian.net/wiki/spaces/DOC/pages/  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  API Token *                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ••••••••••••••••••••••••••••••••                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ☑ Include child pages                                       │
│  Max Depth: [3 ▼]                                            │
│                                                              │
│  Image Handling: [Analyze with AI ▼]                         │
│                                                              │
│              [Cancel]  [Import Pages]                        │
└──────────────────────────────────────────────────────────────┘
```

### Document Status Icons

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| `pending` | ⏳ | Gray | In queue |
| `processing` | 🔄 | Blue | Being processed |
| `completed` | ✅ | Green | Ready |
| `failed` | ❌ | Red | Error occurred |

---

## Phase 3: Project Activation

### Activation Flow UI

```
┌──────────────────────────────────────────────────────────────┐
│  Project: My Knowledge Base                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Status: Draft                                               │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ✅ Project created                                      │ │
│  │ ✅ 4 documents uploaded (85 chunks)                     │ │
│  │ ⬜ Project activated                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Ready to activate?                                          │
│  Your project has documents and is ready for chat.          │
│                                                              │
│                    [Activate Project]                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Call

```typescript
// Activate project
const activateProject = async (projectId: string) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/activate`,
    {
      method: 'POST',
      headers: { 'X-User-ID': tenantId }
    }
  );
  
  const project = await response.json();
  // project.status is now "active"
  return project;
};
```

### Generate Additional API Keys

```typescript
// Generate new API key (e.g., for production)
const generateApiKey = async (projectId: string, name: string) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/api-keys`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': tenantId
      },
      body: JSON.stringify({
        name: name,
        scopes: ['read', 'write']
      })
    }
  );
  
  return await response.json();
  // { key: "rag_...", key_id: "...", name: "...", scopes: [...] }
};
```

---

## Phase 4: Chat Interface

### Chat UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│  AI Assistant - My Knowledge Base                      [⚙️]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Chat Messages ──────────────────────────────────────────┐│
│  │                                                          ││
│  │  👤 What are the payment terms in the contract?          ││
│  │                                                          ││
│  │  🤖 Based on the contract document, the payment terms    ││
│  │     are as follows:                                      ││
│  │                                                          ││
│  │     1. **Net 30**: Payment due within 30 days            ││
│  │     2. **Late fees**: 1.5% per month after due date      ││
│  │     3. **Early payment**: 2% discount if paid in 10 days ││
│  │                                                          ││
│  │     📄 Sources:                                          ││
│  │     └─ contract.pdf (Page 3, Section 2.1) - 92%          ││
│  │                                                          ││
│  │  👤 What about refunds?                                  ││
│  │                                                          ││
│  │  🤖 According to the policy document...                  ││
│  │     ▌ (typing...)                                        ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Ask a question...                             [📎] [➤]│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Suggestions: [Payment schedule?] [Termination clause?]      │
└──────────────────────────────────────────────────────────────┘
```

### Non-Streaming Chat

```typescript
interface ChatRequest {
  query: string;
  session_id?: string;
  images?: Array<{
    data: string;  // base64
    mime_type: string;
  }>;
  files?: Array<{
    filename: string;
    data: string;  // base64
  }>;
}

const sendMessage = async (projectId: string, request: ChatRequest) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': tenantId
      },
      body: JSON.stringify(request)
    }
  );
  
  return await response.json();
  // { answer, sources, session_id, confidence_score, ... }
};
```

### Streaming Chat (Recommended)

```typescript
const streamMessage = async (
  projectId: string,
  query: string,
  sessionId: string | null,
  onChunk: (text: string) => void,
  onSource: (source: SourceReference) => void,
  onComplete: (metadata: any) => void
) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/chat/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': tenantId
      },
      body: JSON.stringify({ query, session_id: sessionId })
    }
  );

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') {
          return;
        }
        
        try {
          const chunk = JSON.parse(data);
          
          switch (chunk.type) {
            case 'content':
              onChunk(chunk.data);
              break;
            case 'source':
              onSource(chunk.metadata);
              break;
            case 'complete':
              onComplete(chunk.metadata);
              break;
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
};

// Usage in React component
const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  
  const handleSend = async (query: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setCurrentAnswer('');
    setSources([]);
    
    await streamMessage(
      projectId,
      query,
      sessionId,
      // On each text chunk
      (text) => setCurrentAnswer(prev => prev + text),
      // On source
      (source) => setSources(prev => [...prev, source]),
      // On complete
      (metadata) => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: currentAnswer, sources }
        ]);
        setCurrentAnswer('');
      }
    );
  };
};
```

### Source Citation Component

```tsx
interface SourceReference {
  document_id: string;
  document_name: string;
  chunk_id: string;
  page_number?: number;
  excerpt: string;
  relevance_score: number;
  position?: string;
}

const SourceCitation: React.FC<{ source: SourceReference }> = ({ source }) => (
  <div className="source-citation">
    <div className="source-header">
      <span className="source-icon">📄</span>
      <span className="source-name">{source.document_name}</span>
      <span className="source-position">{source.position}</span>
      <span className="source-score">{Math.round(source.relevance_score * 100)}%</span>
    </div>
    <div className="source-excerpt">
      "{source.excerpt}"
    </div>
  </div>
);
```

### Multimodal Input (Images)

```typescript
// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix: "data:image/png;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Send message with image
const sendWithImage = async (query: string, imageFile: File) => {
  const base64 = await fileToBase64(imageFile);
  
  const response = await fetch(`/api/v1/projects/${projectId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': tenantId
    },
    body: JSON.stringify({
      query,
      images: [{
        data: base64,
        mime_type: imageFile.type
      }]
    })
  });
  
  return await response.json();
};
```

---

## Phase 5: Widget Embedding

### Get Embed Code

```typescript
const getEmbedCode = async (projectId: string, baseUrl: string) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/widget/embed-code?base_url=${encodeURIComponent(baseUrl)}`,
    { headers: { 'X-User-ID': tenantId } }
  );
  
  return await response.json();
  // { iframe_url, iframe_html, script_html }
};
```

### Embed Options

**Option 1: Iframe Embed**
```html
<iframe
  src="https://your-ragaas-server.com/widget/{project_id}?tenant_id={tenant_id}"
  style="position: fixed; bottom: 0; right: 0; width: 420px; height: 650px; border: none; z-index: 9999;"
  allow="clipboard-write"
  title="Chat Widget"
></iframe>
```

**Option 2: Script Embed (Recommended)**
```html
<script
  src="https://your-ragaas-server.com/static/widget/loader.js"
  data-project-id="{project_id}"
  data-tenant-id="{tenant_id}"
></script>
```

### Widget Customization

```typescript
interface WidgetConfig {
  enabled: boolean;
  title: string;
  welcome_message: string;
  primary_color: string;  // e.g., "#6366f1"
  position: "right" | "left";
}

// Get widget config
const getWidgetConfig = async (projectId: string) => {
  const response = await fetch(
    `/api/v1/projects/${projectId}/widget/config`,
    { headers: { 'X-User-ID': tenantId } }
  );
  return await response.json();
};
```

---

## TypeScript Interfaces

```typescript
// ============ Projects ============

interface ProjectConfig {
  llm_config: {
    config_name: string;
    temperature?: number;
    max_tokens?: number;
  };
  retrieval_config: {
    retrieval_method: 'semantic' | 'hybrid' | 'bm25';
    top_k: number;
    similarity_threshold: number;
  };
  pipeline_config: {
    type: 'simple_rag' | 'agentic' | 'routing' | 'agent' | 'custom';
  };
  widget_config: {
    enabled: boolean;
    title?: string;
    welcome_message: string;
    primary_color: string;
    position: 'right' | 'left';
  };
  system_prompt: string;
  user_prompt_template: string;
}

interface Project {
  project_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  config: ProjectConfig;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  config?: Partial<ProjectConfig>;
}

interface CreateProjectResponse {
  project: Project;
  api_key: string;  // ⚠️ Only shown once!
}

// ============ Documents ============

interface Document {
  document_id: string;
  project_id: string;
  tenant_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  chunks_count: number;
  vector_count: number;
  upload_timestamp: string;
  last_updated: string;
}

interface DocumentProcessingResult {
  document_id: string;
  status: 'success' | 'partial' | 'failed';
  chunks_created: number;
  vectors_stored: number;
  processing_time_ms: number;
  errors: string[];
  warnings: string[];
}

interface ProcessingConfig {
  chunking_strategy: 'fixed_size' | 'semantic' | 'document_aware';
  chunk_size: number;
  chunk_overlap: number;
  image_handling: 'skip' | 'llm_describe' | 'embed_base64';
  image_prompt?: string;
}

// ============ Chat ============

interface ImageContent {
  data?: string;   // base64
  url?: string;    // or URL
  mime_type: string;
  detail: 'auto' | 'low' | 'high';
}

interface FileUpload {
  filename: string;
  data: string;  // base64
  mime_type?: string;
}

interface ChatRequest {
  query: string;
  session_id?: string;
  images?: ImageContent[];
  files?: FileUpload[];
  temperature?: number;
  top_k?: number;
}

interface SourceReference {
  document_id: string;
  document_name: string;
  chunk_id: string;
  page_number?: number;
  excerpt: string;
  relevance_score: number;
  position?: string;
}

interface ChatResponse {
  response_id: string;
  query: string;
  answer: string;
  sources: SourceReference[];
  confidence_score: number;
  tokens_used: number;
  processing_time_ms: number;
  model: string;
  session_id: string;
  next_suggestions?: string[];
}

interface StreamingChunk {
  chunk_id: string;
  type: 'content' | 'source' | 'metadata' | 'complete';
  data: string;
  metadata?: Record<string, any>;
}

// ============ Sessions ============

interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: ImageContent[];
  timestamp: string;
  tokens_used?: number;
}

interface ChatSession {
  session_id: string;
  project_id: string;
  tenant_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  messages: ChatMessage[];
}

// ============ Errors ============

interface ApiError {
  detail: string;
  error_type?: string;
}
```

---

## API Client Example

Complete TypeScript API client:

```typescript
class RAGaaSClient {
  private baseUrl: string;
  private tenantId: string;
  
  constructor(baseUrl: string, tenantId: string) {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': this.tenantId,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  
  // Projects
  async createProject(data: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.request('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async getProject(projectId: string): Promise<Project> {
    return this.request(`/api/v1/projects/${projectId}`);
  }
  
  async listProjects(page = 1, pageSize = 20): Promise<{ projects: Project[]; total: number }> {
    return this.request(`/api/v1/projects?page=${page}&page_size=${pageSize}`);
  }
  
  async activateProject(projectId: string): Promise<Project> {
    return this.request(`/api/v1/projects/${projectId}/activate`, { method: 'POST' });
  }
  
  // Documents
  async uploadDocument(
    projectId: string,
    file: File,
    config?: ProcessingConfig
  ): Promise<DocumentProcessingResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (config) {
      formData.append('processing_config', JSON.stringify(config));
    }
    
    const response = await fetch(
      `${this.baseUrl}/api/v1/projects/${projectId}/documents/upload`,
      {
        method: 'POST',
        headers: { 'X-User-ID': this.tenantId },
        body: formData
      }
    );
    
    return response.json();
  }
  
  async getDocument(projectId: string, documentId: string): Promise<Document> {
    return this.request(`/api/v1/projects/${projectId}/documents/${documentId}`);
  }
  
  // Chat
  async chat(projectId: string, request: ChatRequest): Promise<ChatResponse> {
    return this.request(`/api/v1/projects/${projectId}/chat`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  
  async *streamChat(
    projectId: string,
    request: ChatRequest
  ): AsyncGenerator<StreamingChunk> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/projects/${projectId}/chat/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': this.tenantId
        },
        body: JSON.stringify(request)
      }
    );
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value);
      for (const line of text.split('\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          yield JSON.parse(data);
        }
      }
    }
  }
  
  // Sessions
  async getSessions(projectId: string): Promise<{ sessions: ChatSession[]; total: number }> {
    return this.request(`/api/v1/projects/${projectId}/sessions`);
  }
  
  async getSessionMessages(projectId: string, sessionId: string): Promise<ChatMessage[]> {
    const result = await this.request<{ messages: ChatMessage[] }>(
      `/api/v1/projects/${projectId}/sessions/${sessionId}/messages`
    );
    return result.messages;
  }
}

// Usage
const client = new RAGaaSClient('http://localhost:8000', 'my-tenant');

// Create project
const { project, api_key } = await client.createProject({
  name: 'My RAG',
  description: 'Test project'
});

// Upload document
const result = await client.uploadDocument(project.project_id, pdfFile);

// Activate
await client.activateProject(project.project_id);

// Chat with streaming
for await (const chunk of client.streamChat(project.project_id, { query: 'Hello' })) {
  if (chunk.type === 'content') {
    console.log(chunk.data);
  }
}
```

---

## Common Patterns

### Loading States

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  state: LoadingState;
  data?: T;
  error?: string;
}
```

### Error Handling

```typescript
const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// In component
try {
  const project = await client.createProject(data);
} catch (error) {
  setError(handleApiError(error));
}
```

### Polling Pattern

```typescript
const useDocumentStatus = (projectId: string, documentId: string) => {
  const [document, setDocument] = useState<Document | null>(null);
  
  useEffect(() => {
    const poll = async () => {
      const doc = await client.getDocument(projectId, documentId);
      setDocument(doc);
      
      if (doc.processing_status === 'pending' || doc.processing_status === 'processing') {
        setTimeout(poll, 2000);
      }
    };
    
    poll();
  }, [projectId, documentId]);
  
  return document;
};
```

---

## Summary

| Phase | Key Endpoint | UI Component |
|-------|--------------|--------------|
| 1. Create | `POST /projects` | Project form + API key modal |
| 2. Upload | `POST /documents/upload` | File upload + status list |
| 3. Activate | `POST /projects/{id}/activate` | Activation button |
| 4. Chat | `POST /chat/stream` | Chat UI with streaming |
| 5. Deploy | `GET /widget/embed-code` | Embed code display |
