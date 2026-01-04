# Chat Session API - Frontend Integration Guide

This guide explains how to integrate the Chat Session API into your frontend application.

## Base URL

```
/api/v1/projects/{project_id}
```

**Required Header**: `X-Tenant-ID: your_tenant_id` (or `X-User-ID`)

---

## Quick Start

### 1. Create a Session

Before starting a chat, create a session to track the conversation:

```javascript
const response = await fetch(`${API_BASE}/projects/${projectId}/sessions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': tenantId
  },
  body: JSON.stringify({
    user_id: 'user_123',        // Optional: track user
    title: 'Support Chat',       // Optional: session title
    custom_fields: {}            // Optional: any custom metadata
  })
});

const session = await response.json();
// session.session_id -> Use this for subsequent chat requests
```

### 2. Send Chat Messages

Use the session ID when sending chat queries:

```javascript
const chatResponse = await fetch(`${API_BASE}/projects/${projectId}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': tenantId
  },
  body: JSON.stringify({
    query: 'What are the payment terms?',
    session_id: session.session_id  // Links message to session
  })
});
```

### 3. Load Session History

Retrieve previous messages when user returns:

```javascript
const messages = await fetch(
  `${API_BASE}/projects/${projectId}/sessions/${sessionId}/messages?limit=50`,
  { headers: { 'X-Tenant-ID': tenantId } }
);

const { messages, session_id } = await messages.json();
// Render messages in chat UI
```

---

## API Reference

### Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sessions` | Create new session |
| `GET` | `/sessions` | List all sessions |
| `GET` | `/sessions/search?q=query` | Search sessions by title or content |
| `GET` | `/sessions/{id}` | Get session details |
| `PATCH` | `/sessions/{id}` | Update session |
| `DELETE` | `/sessions/{id}` | Delete session |

### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sessions/{id}/messages` | Get messages |
| `POST` | `/sessions/{id}/messages` | Add message manually |
| `DELETE` | `/sessions/{id}/messages` | Clear all messages |
| `DELETE` | `/sessions/{id}/messages/{mid}` | Delete one message |

### Export Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sessions/{id}/export` | Export full history |

---

## Common Use Cases

### List User's Sessions (Chat History)

```javascript
async function getUserSessions(projectId, userId) {
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/sessions?user_id=${userId}&page=1&page_size=20`,
    { headers: { 'X-Tenant-ID': tenantId } }
  );
  
  const { sessions, total } = await response.json();
  return sessions; // Array of session objects with title, created_at, etc.
}
```

### Search Sessions

Search sessions by title or message content:

```javascript
async function searchSessions(projectId, query) {
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/sessions/search?q=${encodeURIComponent(query)}`,
    { headers: { 'X-Tenant-ID': tenantId } }
  );
  
  const { sessions, total } = await response.json();
  return sessions;
}
```

### Update Session Title

Auto-generate or let user rename:

```javascript
async function updateSessionTitle(projectId, sessionId, title) {
  await fetch(`${API_BASE}/projects/${projectId}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({ title })
  });
}
```

### Clear Chat History

```javascript
async function clearChat(projectId, sessionId) {
  await fetch(
    `${API_BASE}/projects/${projectId}/sessions/${sessionId}/messages`,
    { 
      method: 'DELETE',
      headers: { 'X-Tenant-ID': tenantId } 
    }
  );
}
```

### Export for Download

```javascript
async function exportChat(projectId, sessionId) {
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/sessions/${sessionId}/export`,
    { headers: { 'X-Tenant-ID': tenantId } }
  );
  
  const exportData = await response.json();
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export-${sessionId}.json`;
  a.click();
}
```

---

## Data Models

### Session Object

```typescript
interface ChatSession {
  session_id: string;
  project_id: string;
  tenant_id: string;
  user_id?: string;
  title?: string;
  created_at: string;  // ISO 8601
  updated_at: string;
  messages: ChatMessage[];
  custom_fields: Record<string, any>;
}
```

### Message Object

```typescript
interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens_used?: number;
  cost?: number;
  metadata?: Record<string, any>;
}
```

---

## Best Practices

1. **Store session_id** in localStorage/sessionStorage when user starts a new chat
2. **Check for existing session** on page load to resume conversations
3. **Create new session** when user clicks "New Chat" button
4. **Session title is auto-set** from the first user query (up to 100 characters)
5. **Paginate sessions list** for users with many conversations
6. **Sources in metadata** - Assistant messages include `metadata.sources` with reference documents

### Auto-Generated Title

When a new session receives its first message, the session title is automatically set to the user's first query (truncated to 100 characters). You can still manually update the title using the PATCH endpoint.

### Message Metadata

Assistant messages include source references in their metadata:

```typescript
interface MessageMetadata {
  sources?: Array<{
    document_id: string;
    document_name: string;
    chunk_id: string;
    excerpt: string;
    score: number;
    page_number?: number;
    source_url?: string;
  }>;
}
```
