# RAG-as-a-Service API Documentation

This document provides comprehensive API documentation for the RAG-as-a-Service platform, including endpoint references, request/response schemas, authentication, and business flow from project creation to deployment.

> **Base URL**: `http://localhost:8000` (development) or your production URL
>
> **API Version**: v1 - All endpoints are prefixed with `/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Business Flow Overview](#business-flow-overview)
3. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Projects](#projects-api)
   - [Documents](#documents-api)
   - [Chat](#chat-api)
   - [Sessions](#sessions-api)
   - [Widget](#widget-api)
   - [Visual Grounding](#visual-grounding-api)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Quick Start Guide](#quick-start-guide)

---

## Authentication

The API uses header-based authentication. All requests (except public endpoints) require identification.

### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `X-User-ID` | Tenant/User identifier | `tenant_123` |
| `X-API-Key` | Project API key (optional) | `rag_abc123...` |
| `Authorization` | Bearer token (alternative) | `Bearer rag_abc123...` |

### Public Endpoints (No Auth Required)

- `GET /` - Root status
- `GET /health` - Health check
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc documentation

### Example Request

```bash
curl -X GET "http://localhost:8000/api/v1/projects" \
  -H "X-User-ID: tenant_123" \
  -H "Content-Type: application/json"
```

---

## Business Flow Overview

This section describes the complete workflow from creating a project to deploying a production-ready RAG chat system.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RAG-as-a-Service Business Flow                        │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │   Phase 1   │───▶│   Phase 2   │───▶│   Phase 3   │───▶│   Phase 4   │
  │   Create    │    │   Upload    │    │  Activate   │    │    Chat     │
  │   Project   │    │  Documents  │    │   Project   │    │   Deploy    │
  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
  • Create project   • Upload files      • Activate         • Chat API
  • Configure LLM    • Confluence sync   • Generate         • Streaming
  • Set prompts      • Processing        • API keys         • Widget embed
```

### Phase 1: Create Project

**Objective**: Set up a new RAG project with configuration.

**API Calls**:
1. `POST /api/v1/projects` - Create project with basic config
2. OR `POST /api/v1/projects/from-config` - Create from YAML file

**What Happens**:
- Project is created in "draft" status
- Initial API key is generated (save it - shown only once!)
- Vector collection is prepared for the project

### Phase 2: Upload Documents

**Objective**: Ingest documents into the vector database.

**API Calls**:
1. `POST /api/v1/projects/{project_id}/documents/upload` - Upload files (supports multiple files)
2. `GET /api/v1/projects/{project_id}/documents/tasks/{task_id}` - Check upload progress
3. OR `POST /api/v1/projects/{project_id}/documents/confluence` - Sync from Confluence

**What Happens**:
1. Files are received and task is created (returns immediately with task ID)
2. **Background Processing**:
   - Text extraction via Docling (PDF, DOCX, XLSX, etc.)
   - Images analyzed with GPT-4 Vision (if configured)
   - Text chunked according to strategy
   - Embeddings generated for each chunk
   - Vectors stored in database
3. Memory cleanup after processing

**Processing Status**:
- Task: `pending` → `processing` → `completed` or `failed`
- Documents: `pending` → `processing` → `completed` or `failed`

### Phase 3: Activate Project

**Objective**: Make the project live for chat queries.

**API Calls**:
1. `POST /api/v1/projects/{project_id}/activate` - Activate project
2. `POST /api/v1/projects/{project_id}/api-keys` - Generate additional API keys

**What Happens**:
- Project status changes from "draft" to "active"
- Chat endpoints become available
- Widget can be embedded

### Phase 4: Chat & Deploy

**Objective**: Use the RAG system for Q&A.

**API Calls**:
1. `POST /api/v1/projects/{project_id}/chat` - Single query
2. `POST /api/v1/projects/{project_id}/chat/stream` - Streaming response
3. `GET /api/v1/projects/{project_id}/widget/embed-code` - Get embed code

**What Happens**:
1. Query is embedded
2. Similar documents retrieved from vector store
3. Context sent to LLM
4. Response generated with source citations

---

## API Endpoints

### Health Check

#### GET `/`

Root status endpoint.

**Response** `200 OK`:
```json
{
  "name": "RAG-as-a-Service",
  "version": "1.0.0",
  "status": "running"
}
```

#### GET `/health`

Health check with component status.

**Response** `200 OK`:
```json
{
  "status": "healthy",
  "components": {
    "database": "connected",
    "api": "running"
  }
}
```

---

### Projects API

Base path: `/api/v1/projects`

#### POST `/api/v1/projects`

Create a new RAG project.

**Request Body**:
```json
{
  "name": "My RAG Project",
  "description": "A document Q&A system",
  "config": {
    "llm_config": {
      "config_name": "azure-4.1",
      "temperature": 0.7
    },
    "retrieval_config": {
      "top_k": 5,
      "similarity_threshold": 0.7
    },
    "system_prompt": "You are a helpful assistant...",
    "user_prompt_template": "Context:\n{context}\n\nQuestion: {query}"
  }
}
```

**Response** `201 Created`:
```json
{
  "project": {
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "tenant_123",
    "name": "My RAG Project",
    "description": "A document Q&A system",
    "status": "draft",
    "created_at": "2025-12-25T02:00:00Z",
    "config": { ... }
  },
  "api_key": "rag_abc123xyz..."  // ⚠️ Save this! Shown only once!
}
```

---

#### POST `/api/v1/projects/from-config`

Create project from YAML configuration file.

**Request**: `multipart/form-data`
- `config_file`: YAML file upload

**Example YAML**:
```yaml
name: Legal Document Assistant
description: Contract analysis RAG

llm:
  config_name: azure-4.1
  temperature: 0.5

retrieval:
  top_k: 10
  similarity_threshold: 0.6

pipeline:
  type: simple_rag

system_prompt: |
  You are a legal expert assistant.
  Answer based on the documents provided.
  Always cite sources.
```

**Response** `201 Created`: Same as POST `/projects`

---

#### POST `/api/v1/projects/validate-config`

Validate a YAML configuration without creating a project.

**Request**: `multipart/form-data`
- `config_file`: YAML file to validate

**Response** `200 OK`:
```json
{
  "valid": true,
  "error": null,
  "config": { ... }
}
```

**Response (Invalid)** `200 OK`:
```json
{
  "valid": false,
  "error": "Missing required field: 'name'",
  "config": null
}
```

---

#### GET `/api/v1/projects/config-template`

Get a YAML configuration template.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | string | `mongodb_atlas` | Vector DB provider |

**Response** `200 OK`:
```json
{
  "provider": "mongodb_atlas",
  "template": "name: My RAG Project\ndescription: ...\n..."
}
```

---

#### GET `/api/v1/projects`

List all projects for the tenant.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter: `draft`, `active`, `archived` |
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page (max 100) |

**Response** `200 OK`:
```json
{
  "projects": [
    {
      "project_id": "...",
      "name": "My RAG Project",
      "status": "active",
      ...
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 20
}
```

---

#### GET `/api/v1/projects/{project_id}`

Get a specific project.

**Response** `200 OK`:
```json
{
  "project_id": "1deff4f3-3d85-4a34-a89f-696d92257981",
  "tenant_id": "TQU3HC",
  "name": "Advanced dynamic top-k Retrieval Test",
  "description": "Test project for score filtering and dynamic top-k",
  "created_at": "2025-12-27T21:24:24.019000",
  "updated_at": "2025-12-27T21:24:24.019000",
  "config": {
    "llm_config": {
      "config_name": "gpt-5.1",
      "weak_llm_config_name": "default",
      "temperature": 0.5,
      "max_tokens": null
    },
    "retrieval_config": {
      "retrieval_method": "semantic",
      "top_k": 20,
      "metadata_filters": null,
      "min_score": 0,
      "dynamic_top_k": false,
      "dynamic_top_k_config": {
        "simple": 5,
        "medium": 10,
        "complex": 20
      },
      "iterative_retrieval": false,
      "max_retrieval_passes": 3,
      "quality_threshold": 0.75,
      "multi_query_retrieval": false,
      "num_query_variations": 3
    },
    "chunking_config": {
      "strategy": "docling",
      "chunk_size": 1024,
      "chunk_overlap": 128,
      "min_chunk_size": 100,
      "respect_sentence_boundaries": true
    },
    "vector_db_config": {
      "provider": "mongodb_atlas",
      "config": {
        "database": "ragaas",
        "index_name": "vector_index"
      },
      "embedding_model": "text-embedding-3-large",
      "embedding_dimension": 3072,
      "index_name_pattern": "{tenant_id}_{project_id}",
      "metadata": {}
    },
    "pipeline_config": {
      "type": "simple_rag",
      "steps": [
        {
          "name": "retrieve",
          "type": "retrieve",
          "config": {}
        },
        {
          "name": "generate",
          "type": "generate",
          "config": {}
        }
      ],
      "conditional_logic": null,
      "agent_config": null,
      "chat_history_config": {
        "include_history": true,
        "max_history_turns": 5
      }
    },
    "widget_config": {
      "enabled": true,
      "title": null,
      "welcome_message": "👋 Hello! How can I help you today?",
      "primary_color": "#6366f1",
      "position": "right",
      "allowed_origins": []
    },
    "system_prompt": "You are a assistant. Answer based on the provided context.\nAlways cite sources when possible. Be concise and accurate.\n",
    "user_prompt_template": "Context:\n{context}\n\nQuestion: {query}\n\nAnswer:",
    "max_context_tokens": 4000,
    "temperature": 0.7,
    "top_p": 0.95,
    "stream_response": true
  },
  "status": "draft",
  "version": 1,
  "endpoints": [
    {
      "endpoint_id": "70c7c7e7-3345-4b26-b8c6-72dabc4fbf7f",
      "name": "Default Chat",
      "path": "/chat",
      "enabled": true,
      "rate_limit": null,
      "created_at": "2025-12-27T21:24:24.019000"
    }
  ],
  "api_keys": [
    {
      "key_id": "20eca290-ce2b-40ce-967b-8d69ff1d5d83",
      "key_hash": "da1ce4bf0fb875fb47e68dbbf1b5f664ac15871532827b8c209f4de8cb006ab4",
      "name": "Default API Key",
      "scopes": [
        "read",
        "write",
        "chat"
      ],
      "created_at": "2025-12-27T21:24:24.019000",
      "expires_at": null,
      "last_used_at": null,
      "is_active": true
    }
  ]
}
```

**Error** `404 Not Found`:
```json
{
  "detail": "Project not found: {project_id}"
}
```

---

#### PUT `/api/v1/projects/{project_id}`

Update a project.

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "config": {
    "llm_config": {
      "temperature": 0.5
    }
  }
}
```

**Response** `200 OK`: Updated project object

---

#### DELETE `/api/v1/projects/{project_id}`

Delete a project.

**Response** `204 No Content`

---

#### POST `/api/v1/projects/{project_id}/activate`

Activate a project (makes it ready for chat).

**Response** `200 OK`: Project with `status: "active"`

---

#### POST `/api/v1/projects/{project_id}/archive`

Archive a project (disables chat).

**Response** `200 OK`: Project with `status: "archived"`

---

#### POST `/api/v1/projects/{project_id}/api-keys`

Generate a new API key for the project.

**Request Body**:
```json
{
  "name": "Production Key",
  "scopes": ["read", "write"]
}
```

**Response** `200 OK`:
```json
{
  "key": "rag_xyz789...",  // ⚠️ Save this! Shown only once!
  "key_id": "key_123",
  "name": "Production Key",
  "scopes": ["read", "write"]
}
```

---

### Documents API

Base path: `/api/v1`

#### POST `/api/v1/projects/{project_id}/documents/upload`

Upload and process one or more documents in the background.

**⚡ Background Processing**: This endpoint returns immediately with a task ID. The actual document processing happens asynchronously. Use the task status endpoint to monitor progress.

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `files` | file[] | ✅ | One or more document files (PDF, DOCX, XLSX, TXT, MD, etc.) |
| `custom_metadata` | string (JSON) | ❌ | Custom metadata (applied to all files) |
| `processing_config` | string (JSON) | ❌ | Processing options |

**Processing Config Options**:
```json
{
  "chunking_strategy": "document_aware",  // fixed_size, semantic, document_aware
  "chunk_size": 1024,
  "chunk_overlap": 128,
  "image_handling": "llm_describe",  // skip, llm_describe, embed_base64
  "image_prompt": "Describe this image..."
}
```

**Example cURL (Single File)**:
```bash
curl -X POST "http://localhost:8000/api/v1/projects/{project_id}/documents/upload" \
  -H "X-User-ID: tenant_123" \
  -F "files=@document.pdf" \
  -F 'processing_config={"image_handling": "llm_describe"}'
```

**Example cURL (Multiple Files)**:
```bash
curl -X POST "http://localhost:8000/api/v1/projects/{project_id}/documents/upload" \
  -H "X-User-ID: tenant_123" \
  -F "files=@document1.pdf" \
  -F "files=@document2.docx" \
  -F "files=@spreadsheet.xlsx"
```

**Response** `202 Accepted`:
```json
{
  "task_id": "task_abc123def456",
  "message": "Ingestion started for 3 file(s)",
  "status_url": "/api/v1/projects/{project_id}/documents/tasks/task_abc123def456",
  "total_files": 3
}
```

---

#### GET `/api/v1/projects/{project_id}/documents/tasks/{task_id}`

Get the status of a background ingestion task.

**Response** `200 OK` (Processing):
```json
{
  "task_id": "task_abc123def456",
  "status": "processing",
  "total_files": 3,
  "processed_files": 1,
  "results": [
    {
      "document_id": "doc_xyz789",
      "status": "success",
      "chunks_created": 42,
      "vectors_stored": 42,
      "processing_time_ms": 5432.5,
      "errors": [],
      "warnings": []
    }
  ],
  "created_at": "2025-12-27T00:00:00Z",
  "completed_at": null,
  "errors": []
}
```

**Response** `200 OK` (Completed):
```json
{
  "task_id": "task_abc123def456",
  "status": "completed",
  "total_files": 3,
  "processed_files": 3,
  "results": [
    { "document_id": "doc_1", "status": "success", "chunks_created": 42, ... },
    { "document_id": "doc_2", "status": "success", "chunks_created": 28, ... },
    { "document_id": "doc_3", "status": "success", "chunks_created": 15, ... }
  ],
  "created_at": "2025-12-27T00:00:00Z",
  "completed_at": "2025-12-27T00:02:30Z",
  "errors": []
}
```

**Task Status Values**:
| Status | Description |
|--------|-------------|
| `pending` | Task created, not yet started |
| `processing` | Files are being processed |
| `completed` | All files processed successfully |
| `completed_with_errors` | Completed but some files failed |
| `failed` | Task failed completely |

**Error** `404 Not Found`:
```json
{
  "detail": "Task not found: {task_id}"
}
```

---

#### POST `/api/v1/projects/{project_id}/documents/confluence`

Ingest a Confluence/Docupedia page.

**Request Body**:
```json
{
  "url": "https://your-confluence.atlassian.net/wiki/spaces/DOC/pages/123456",
  "token": "your-confluence-api-token",
  "include_children": true,
  "max_depth": 3,
  "image_handling": "llm_describe",
  "image_prompt": "Describe this diagram..."
}
```

**Response** `201 Created`:
```json
{
  "pages_ingested": 5,
  "documents": [
    {
      "document_id": "doc_1",
      "status": "success",
      "chunks_created": 15,
      ...
    },
    ...
  ]
}
```

---

#### GET `/api/v1/projects/{project_id}/documents`

List documents in a project.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter: `pending`, `processing`, `completed`, `failed` |
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page |

**Response** `200 OK`:
```json
{
  "documents": [
    {
      "document_id": "doc_abc123",
      "filename": "contract.pdf",
      "file_type": "application/pdf",
      "file_size": 1024000,
      "processing_status": "completed",
      "chunks_count": 42,
      "upload_timestamp": "2025-12-25T02:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 20
}
```

---

#### GET `/api/v1/projects/{project_id}/documents/{document_id}`

Get a specific document.

**Response** `200 OK`:
```json
{
  "document_id": "doc_abc123",
  "project_id": "proj_456",
  "tenant_id": "tenant_123",
  "filename": "contract.pdf",
  "file_type": "application/pdf",
  "file_size": 1024000,
  "processing_status": "completed",
  "chunks_count": 42,
  "vector_count": 42,
  "embedding_model": "text-embedding-3-large",
  "custom_metadata": {},
  "upload_timestamp": "2025-12-25T02:00:00Z",
  "last_updated": "2025-12-25T02:05:00Z"
}
```

---

#### GET `/api/v1/projects/{project_id}/documents/{document_id}/status`

Get document processing status (same as GET document, semantic alias).

---

#### GET `/api/v1/projects/{project_id}/documents/{document_id}/chunks`

Get chunks for a document.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Offset |
| `limit` | int | 50 | Limit (max 100) |

**Response** `200 OK`:
```json
{
  "chunks": [
    {
      "chunk_id": "chunk_001",
      "document_id": "doc_abc123",
      "content": "This is the chunk content...",
      "chunk_index": 0,
      "page_number": 1,
      "section": "Introduction",
      "source_doc_name": "contract.pdf",
      "source_position": "Page 1, Section 1"
    }
  ],
  "total": 42
}
```

---

#### DELETE `/api/v1/projects/{project_id}/documents/{document_id}`

Delete a document and its vectors.

**Response** `204 No Content`

---

### Chat API

Base path: `/api/v1`

#### POST `/api/v1/projects/{project_id}/chat`

Process a chat query using RAG.

**Request Body**:
```json
{
  "query": "What are the key terms in the contract?",
  "session_id": null,  // Optional: continue conversation
  "images": [  // Optional: multimodal input
    {
      "data": "<base64_encoded_image>",
      "mime_type": "image/png",
      "detail": "auto"
    }
  ],
  "files": [  // Optional: files to process
    {
      "filename": "additional.pdf",
      "data": "<base64_encoded_file>"
    }
  ],
  "temperature": 0.7,  // Optional override
  "top_k": 5,  // Optional override
  "conversation_history": []  // Optional: provide history
}
```

**Response** `200 OK`:
```json
{
  "response_id": "resp_123",
  "query": "What are the key terms in the contract?",
  "answer": "The key terms in the contract include:\n\n1. **Payment Terms**: ...\n2. **Duration**: ...\n3. **Termination Clause**: ...",
  "sources": [
    {
      "document_id": "doc_abc123",
      "document_name": "contract.pdf",
      "chunk_id": "chunk_001",
      "excerpt": "The payment terms state that...",
      "relevance_score": 0.92,
      "source_type": "pdf",
      "source_url": null,
      "position": "Page 3, Section 2.1",
      "page_number": 3,
      "bounding_box": {
        "l": 0.1,
        "t": 0.25,
        "r": 0.9,
        "b": 0.4
      },
      "page_image_url": "/api/v1/visual/page-highlight/abc123def?page_no=3&bbox_l=0.1&bbox_t=0.25&bbox_r=0.9&bbox_b=0.4"
    },
    {
      "document_id": "doc_xyz789",
      "document_name": "Policy Guidelines.md",
      "chunk_id": "chunk_045",
      "excerpt": "According to company policy...",
      "relevance_score": 0.85,
      "source_type": "confluence",
      "source_url": "https://docupedia.company.com/pages/viewpage.action?pageId=12345",
      "page_number": null,
      "bounding_box": null,
      "page_image_url": null
    }
  ],
  "confidence_score": 0.85,
  "tokens_used": 1250,
  "processing_time_ms": 2345.6,
  "model": "gpt-4.1",
  "session_id": "sess_456",
  "next_suggestions": [
    "What is the payment schedule?",
    "How can the contract be terminated?"
  ]
}
```

> **Note**: PDF sources include `page_image_url` for visual grounding. Confluence/Docupedia sources include `source_url` for direct linking.

**Error** `400 Bad Request`:
```json
{
  "detail": "Project is not active. Current status: draft"
}
```

---

#### POST `/api/v1/projects/{project_id}/chat/stream`

Stream a chat response using Server-Sent Events.

**Request Body**: Same as `/chat`

**Response**: `text/event-stream`

**Content Event** - Text chunks of the answer:
```json
{"chunk_id": "c1", "type": "content", "data": "The key terms are:", "metadata": null}
```

**Source Event** - Source reference with visual grounding metadata:
```json
{
  "chunk_id": "c3",
  "type": "source",
  "data": "{...SourceReference JSON...}",
  "metadata": {
    "document_id": "doc_abc123",
    "document_name": "contract.pdf",
    "chunk_id": "chunk_001",
    "excerpt": "The payment terms state that...",
    "relevance_score": 0.92,
    "source_type": "pdf",
    "source_url": null,
    "page_number": 3,
    "bounding_box": {"l": 0.1, "t": 0.25, "r": 0.9, "b": 0.4},
    "page_image_url": "/api/v1/visual/page-highlight/abc123?page_no=3&bbox_l=0.1&bbox_t=0.25&bbox_r=0.9&bbox_b=0.4",
    "section": null,
    "sheet_name": null
  }
}
```

**Complete Event** - Final stats:
```json
{"chunk_id": "c4", "type": "complete", "data": "", "metadata": {"session_id": "sess_456", "total_sources": 2, "tokens_used": 250}}
```

**Stream Terminator**:
```
data: [DONE]
```

**Stream Event Types**:
| Type | Description |
|------|-------------|
| `content` | Text chunk of the answer |
| `source` | Source document reference with visual grounding metadata |
| `metadata` | Processing metadata |
| `complete` | Final event with session info and stats |

**JavaScript Client Example**:
```javascript
async function streamChat(projectId, query, tenantId) {
  const response = await fetch(`/api/v1/projects/${projectId}/chat/stream`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'X-User-ID': tenantId 
    },
    body: JSON.stringify({ query })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const sources = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      
      if (data === '[DONE]') return { sources };
      
      const chunk = JSON.parse(data);
      
      if (chunk.type === 'content') {
        // Append text to answer
        appendToAnswer(chunk.data);
      } else if (chunk.type === 'source') {
        // Store source with visual grounding info
        sources.push(chunk.metadata);
        
        // For PDFs, you can fetch the highlighted page image
        if (chunk.metadata.page_image_url) {
          displayPageHighlight(chunk.metadata.page_image_url);
        }
        // For Confluence, link to source
        if (chunk.metadata.source_url) {
          displaySourceLink(chunk.metadata.source_url);
        }
      }
    }
  }
}
```

---

### Sessions API

Base path: `/api/v1`

#### GET `/api/v1/projects/{project_id}/sessions`

List chat sessions for a project.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user_id` | string | - | Filter by user |
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page |

**Response** `200 OK`:
```json
{
  "sessions": [
    {
      "session_id": "sess_456",
      "project_id": "proj_123",
      "user_id": "user_789",
      "created_at": "2025-12-25T02:00:00Z",
      "updated_at": "2025-12-25T02:30:00Z",
      "title": "Contract Questions",
      "messages": []
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

#### GET `/api/v1/projects/{project_id}/sessions/{session_id}`

Get a specific session.

**Response** `200 OK`:
```json
{
  "session_id": "sess_456",
  "project_id": "proj_123",
  "tenant_id": "tenant_123",
  "user_id": "user_789",
  "created_at": "2025-12-25T02:00:00Z",
  "updated_at": "2025-12-25T02:30:00Z",
  "title": "Contract Questions",
  "messages": [
    {
      "message_id": "msg_001",
      "role": "user",
      "content": "What are the payment terms?",
      "timestamp": "2025-12-25T02:00:00Z"
    },
    {
      "message_id": "msg_002",
      "role": "assistant",
      "content": "The payment terms state that...",
      "timestamp": "2025-12-25T02:00:05Z",
      "tokens_used": 150
    }
  ]
}
```

---

#### GET `/api/v1/projects/{project_id}/sessions/{session_id}/messages`

Get messages from a session.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 50 | Max messages (max 200) |

**Response** `200 OK`:
```json
{
  "messages": [ ... ],
  "session_id": "sess_456"
}
```

---

#### DELETE `/api/v1/projects/{project_id}/sessions/{session_id}`

Delete a session and its messages.

**Response** `204 No Content`

---

### Widget API

Base path: `/api/v1`

#### GET `/api/v1/projects/{project_id}/widget/config`

Get widget configuration.

**Response** `200 OK`:
```json
{
  "enabled": true,
  "title": "AI Assistant",
  "welcome_message": "👋 Hello! How can I help you today?",
  "primary_color": "#6366f1",
  "position": "right"
}
```

---

#### GET `/api/v1/projects/{project_id}/widget/embed-code`

Get embed code for the chat widget.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_url` | string | - | Base URL for embed |

**Response** `200 OK`:
```json
{
  "iframe_url": "https://your-server.com/widget/{project_id}?tenant_id={tenant_id}",
  "iframe_html": "<iframe src=\"...\" style=\"position: fixed; bottom: 0; right: 0; width: 420px; height: 650px; border: none; z-index: 9999;\" allow=\"clipboard-write\" title=\"Chat Widget\"></iframe>",
  "script_html": "<script src=\".../static/widget/loader.js\" data-project-id=\"{project_id}\" data-tenant-id=\"{tenant_id}\"></script>"
}
```

---

#### GET `/widget/{project_id}`

Serve the chat widget HTML (for iframe embedding).

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | string | ✅ | Tenant identifier |

**Response**: HTML page

---

### Visual Grounding API

Visual grounding enables rendering PDF page images with highlighted source regions. This allows users to see exactly where in a document the retrieved content came from.

> **Note**: Visual grounding is only supported for PDF documents. Other document types (DOCX, Excel, Confluence) include `source_url` links instead.

Base path: `/api/v1/visual`

#### GET `/api/v1/visual/page-highlight/{binary_hash}`

Render a PDF page image with the source chunk region highlighted.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `binary_hash` | string | Document identifier (from chunk metadata) |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_no` | int | ✅ | Page number (0-indexed) |
| `bbox_l` | float | ✅ | Bounding box left (normalized 0-1) |
| `bbox_t` | float | ✅ | Bounding box top (normalized 0-1) |
| `bbox_r` | float | ✅ | Bounding box right (normalized 0-1) |
| `bbox_b` | float | ✅ | Bounding box bottom (normalized 0-1) |
| `highlight_color` | string | ❌ | Highlight color (default: `blue`) |
| `line_width` | int | ❌ | Highlight border width (default: 3, max: 10) |

**Response**: `image/png`

Returns a PNG image of the specified page with a bounding box drawn around the source region.

**Example Request**:
```bash
curl "http://localhost:8000/api/v1/visual/page-highlight/abc123def456?page_no=2&bbox_l=0.1&bbox_t=0.3&bbox_r=0.9&bbox_b=0.5" \
  -H "X-User-ID: tenant_123" \
  --output highlighted_page.png
```

**Error Responses**:

`404 Not Found`:
```json
{
  "detail": "Document not found: abc123def456"
}
```

`400 Bad Request`:
```json
{
  "detail": "Invalid page number: 10. Document has 5 pages."
}
```

---

#### GET `/api/v1/visual/page/{binary_hash}`

Get a PDF page image without highlighting (for thumbnails or previews).

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `binary_hash` | string | Document identifier |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page_no` | int | ✅ | Page number (0-indexed) |

**Response**: `image/png`

**Example**:
```bash
curl "http://localhost:8000/api/v1/visual/page/abc123def456?page_no=0" \
  -H "X-User-ID: tenant_123" \
  --output page_thumbnail.png
```

---

#### Using Visual Grounding with Chat

When you query the Chat API, PDF sources include `page_image_url` in the response:

```json
{
  "query": "What are the payment terms?",
  "answer": "According to the contract...",
  "sources": [
    {
      "document_name": "contract.pdf",
      "source_type": "pdf",
      "page_number": 3,
      "bounding_box": {
        "l": 0.1,
        "t": 0.25,
        "r": 0.9,
        "b": 0.45
      },
      "page_image_url": "/api/v1/visual/page-highlight/abc123?page_no=3&bbox_l=0.1&bbox_t=0.25&bbox_r=0.9&bbox_b=0.45",
      "excerpt": "Payment shall be made within 30 days...",
      "relevance_score": 0.92
    }
  ]
}
```

The frontend can use `page_image_url` to fetch and display the highlighted page image.

---

## Data Models

### Project Configuration

```typescript
interface ProjectConfig {
  // LLM Configuration
  llm_config: {
    config_name: string;      // Reference to AVAILABLE_LLMS
    temperature?: number;     // Override (0.0-2.0)
    max_tokens?: number;      // Override
  };
  
  // Retrieval Configuration
  retrieval_config: {
    retrieval_method: "semantic" | "hybrid" | "bm25";
    top_k: number;            // Default: 20
    similarity_threshold: number;  // Default: 0.5
    chunk_size: number;       // Default: 1024
    chunk_overlap: number;    // Default: 128
  };
  
  // Vector Database Configuration
  vector_db_config: {
    provider: "mongodb_atlas" | "weaviate" | "qdrant";
    embedding_model: string;
    embedding_dimension: number;
    index_name_pattern: string;
  };
  
  // Pipeline Configuration
  pipeline_config: {
    type: "simple_rag" | "agentic" | "routing" | "agent" | "custom";
    steps?: PipelineStep[];
    agent_config?: AgentConfig;  // For type: "agent"
  };
  
  // Widget Configuration
  widget_config: {
    enabled: boolean;
    title?: string;
    welcome_message: string;
    primary_color: string;
    position: "right" | "left";
  };
  
  // Prompt Templates
  system_prompt: string;
  user_prompt_template: string;
  max_context_tokens: number;
  temperature: number;
  stream_response: boolean;
}
```

### Pipeline Types

| Type | Description | Use Case |
|------|-------------|----------|
| `simple_rag` | Standard retrieve → generate | Basic Q&A |
| `routing` | Classify → route → retrieve → generate | Multi-domain support |
| `agentic` | Query rewrite → retrieve → generate | Complex queries |
| `agent` | LangGraph ReAct agent with tools | Multi-step reasoning |
| `custom` | User-defined steps | Advanced workflows |

### Processing Statuses

| Status | Description |
|--------|-------------|
| `pending` | Document uploaded, waiting to process |
| `processing` | Document is being processed |
| `completed` | Processing finished successfully |
| `failed` | Processing failed (check `processing_error`) |

### Source Reference

The `SourceReference` model in chat responses includes type-specific metadata for visual grounding and source linking.

```typescript
interface SourceReference {
  // Core fields
  document_id: string;
  document_name: string;
  chunk_id: string;
  excerpt: string;
  relevance_score: number;
  
  // Document type
  source_type: "pdf" | "docx" | "excel" | "confluence" | "text";
  
  // Common
  source_url?: string;        // Docupedia/Confluence link
  position?: string;          // Human-readable position
  
  // PDF-specific (visual grounding)
  page_number?: number;
  bounding_box?: {            // Normalized 0-1
    l: number;
    t: number;
    r: number;
    b: number;
  };
  page_image_url?: string;    // URL to visual grounding endpoint
  
  // DOCX-specific
  section?: string;
  paragraph_index?: number;
  
  // Excel-specific
  sheet_name?: string;
  cell_range?: string;        // e.g., "A1:D10"
  
  // Text position
  char_start?: number;
  char_end?: number;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message",
  "error_type": "ProjectNotFoundError"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful delete) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid auth) |
| `404` | Not Found (resource doesn't exist) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

### Error Types

| Error Type | Description |
|------------|-------------|
| `ProjectNotFoundError` | Project ID doesn't exist or wrong tenant |
| `DocumentNotFoundError` | Document ID doesn't exist |
| `SessionNotFoundError` | Session ID doesn't exist |
| `ConfigurationError` | Invalid YAML config |
| `RAGServiceException` | General service error |

---

## Quick Start Guide

### Step 1: Create a Project

```bash
# Create project
curl -X POST "http://localhost:8000/api/v1/projects" \
  -H "X-User-ID: my-tenant" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First RAG",
    "description": "Document Q&A system"
  }'

# Save the api_key from response!
```

### Step 2: Upload Documents

```bash
# Upload a PDF
curl -X POST "http://localhost:8000/api/v1/projects/{project_id}/documents/upload" \
  -H "X-User-ID: my-tenant" \
  -F "file=@document.pdf"

# Check status
curl "http://localhost:8000/api/v1/projects/{project_id}/documents/{document_id}/status" \
  -H "X-User-ID: my-tenant"
```

### Step 3: Activate Project

```bash
curl -X POST "http://localhost:8000/api/v1/projects/{project_id}/activate" \
  -H "X-User-ID: my-tenant"
```

### Step 4: Chat!

```bash
# Send a query
curl -X POST "http://localhost:8000/api/v1/projects/{project_id}/chat" \
  -H "X-User-ID: my-tenant" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is this document about?"
  }'
```

### Step 5: Embed Widget (Optional)

```bash
# Get embed code
curl "http://localhost:8000/api/v1/projects/{project_id}/widget/embed-code?base_url=https://your-server.com" \
  -H "X-User-ID: my-tenant"
```

Add the returned `iframe_html` or `script_html` to your website!

---

## Rate Limiting

Default rate limits (configurable via environment):

| Limit | Default |
|-------|---------|
| Requests per hour | 1000 |

When rate limited, you'll receive:
```json
{
  "detail": "Rate limit exceeded. Try again later."
}
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `AZURE_OPENAI_API_KEY` | ✅ | Azure OpenAI API key |
| `AZURE_OPENAI_ENDPOINT` | ✅ | Azure OpenAI endpoint |
| `AVAILABLE_LLMS` | ✅ | JSON array of LLM configs |
| `VECTOR_DB_PROVIDER` | ❌ | `mongodb_atlas`, `weaviate`, `qdrant` |
| `EMBEDDING_MODEL` | ❌ | Embedding model name |
| `RATE_LIMIT_REQUESTS_PER_HOUR` | ❌ | Rate limit (default: 1000) |

---

## Support

- **API Docs**: `/docs` (Swagger UI)
- **API Docs**: `/redoc` (ReDoc)
- **OpenAPI Spec**: `/api/v1/openapi.json`
