# Confluence/Docupedia Integration — Frontend Developer Guide

**Date:** March 7, 2026  
**Version:** 1.0  
**Backend API Version:** v1

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [API Endpoints](#3-api-endpoints)
   - [3.1 Ingest Pages](#31-ingest-pages)
   - [3.2 Monitor Ingestion Progress](#32-monitor-ingestion-progress)
4. [Error Handling](#4-error-handling)
5. [Complete Integration Example](#5-complete-integration-example)

---

## 1. Overview

The RAG-as-a-Service platform supports ingesting pages directly from Confluence/Docupedia wikis. Pages are fetched by URL, converted to Markdown (with optional LLM-based image descriptions), and processed through the standard RAG pipeline.

### What the Frontend Does

1. Collects a Confluence/Docupedia **personal access token** from the user
2. Collects the **page URL** (and optional settings)
3. Calls the ingest endpoint — receives a `task_id` immediately
4. Monitors ingestion progress via polling or SSE

### What the Backend Does

1. Fetches the page(s) from the Confluence REST API
2. Optionally analyzes embedded images via LLM vision
3. Converts HTML content to Markdown
4. Hands pages to the **IngestionTaskManager** for background processing (chunking → embedding → vector storage) with RAM-managed concurrency
5. Reports progress via the standard task status/SSE endpoints

---

## 2. Authentication

Confluence/Docupedia uses a **personal access token (PAT)**.

### How to Obtain a Token

1. User goes to **Docupedia** → Profile → Personal Access Tokens
2. Creates a new token with **Read** permission on the target space(s)
3. Copies the token string

> **Note:** The token is sent **inside the request body** (not as a header), so no special header management is needed — unlike SharePoint.

### Required Headers

| Header | Required | Description |
|---|---|---|
| `X-User-ID` | **Yes** | Standard RAGAAS tenant/user identification header |
| `Content-Type` | **Yes** | `application/json` |

---

## 3. API Endpoints

### 3.1 Ingest Pages

Fetch and ingest one or more Confluence/Docupedia pages through the RAG pipeline.

**Endpoint:** `POST /api/v1/projects/{project_id}/documents/confluence`

**Response Code:** `202 Accepted` — processing happens in the background.

**Request Body:**

```json
{
  "url": "https://inside-docupedia.bosch.com/confluence/pages/viewpage.action?pageId=123456",
  "token": "your-confluence-personal-access-token",
  "include_children": false,
  "max_depth": 3,
  "image_handling": "llm_describe",
  "image_prompt": null
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `url` | string | **Yes** | — | Full Confluence/Docupedia page URL |
| `token` | string | **Yes** | — | Personal access token for the Confluence instance |
| `include_children` | boolean | No | `false` | Recursively include child pages |
| `max_depth` | integer | No | `3` | Maximum depth when `include_children` is true (1–10) |
| `image_handling` | string | No | `"llm_describe"` | `"skip"` \| `"llm_describe"` \| `"embed_base64"` |
| `image_prompt` | string | No | `null` | Custom prompt for LLM image analysis |

**Response (202):**

```json
{
  "task_id": "task_a1b2c3d4e5f6",
  "message": "Confluence/Docupedia ingestion started for 3 page(s)",
  "status_url": "/api/v1/projects/proj_123/documents/tasks/task_a1b2c3d4e5f6",
  "total_pages": 3
}
```

| Field | Type | Description |
|---|---|---|
| `task_id` | string | Unique task identifier for progress tracking |
| `message` | string | Human-readable status message |
| `status_url` | string | Convenience URL for polling task status |
| `total_pages` | integer | Number of pages queued for processing |

**Metadata stored with each document:**

Each ingested page automatically gets these `custom_metadata` fields:

```json
{
  "source_type": "confluence",
  "source_url": "https://inside-docupedia.bosch.com/confluence/pages/viewpage.action?pageId=123456",
  "confluence_page_id": "123456"
}
```

**Supported URL Formats:**

| Format | Example |
|---|---|
| Page ID (viewpage) | `https://inside-docupedia.bosch.com/confluence/pages/viewpage.action?pageId=123456` |
| Spaces path | `https://inside-docupedia.bosch.com/confluence/spaces/MYSPACE/pages/123456/Page+Title` |
| Display path | `https://inside-docupedia.bosch.com/confluence/display/MYSPACE/Page+Title` |
| Confluence 2 | `https://inside-docupedia.bosch.com/confluence2/pages/viewpage.action?pageId=789` |

---

### 3.2 Monitor Ingestion Progress

After calling the ingest endpoint, use the **same** task monitoring endpoints used by file upload and SharePoint ingestion.

#### Polling

```
GET /api/v1/projects/{project_id}/documents/tasks/{task_id}
```

**Response:**

```json
{
  "task_id": "task_a1b2c3d4e5f6",
  "status": "processing",
  "total_files": 3,
  "processed_files": 1,
  "results": [
    {
      "document_id": "doc_abc123",
      "status": "success",
      "chunks_created": 12,
      "vectors_stored": 12,
      "processing_time_ms": 1500,
      "errors": [],
      "warnings": []
    }
  ],
  "errors": [],
  "created_at": "2026-03-07T10:00:00Z",
  "completed_at": null
}
```

**Task status values:** `pending` → `processing` → `completed` | `completed_with_errors` | `failed`

> **Note:** Even though these are wiki pages (not files), the task API uses `total_files` and `processed_files` fields. Each page counts as one "file" in the task progress.

#### Server-Sent Events (SSE) — Real-time Updates

```
GET /api/v1/projects/{project_id}/documents/tasks/{task_id}/stream
```

```javascript
const eventSource = new EventSource(
  `/api/v1/projects/${projectId}/documents/tasks/${taskId}/stream`
);

eventSource.onmessage = (event) => {
  const status = JSON.parse(event.data);
  console.log(`Progress: ${status.processed_files}/${status.total_files}`);

  if (["completed", "completed_with_errors", "failed"].includes(status.status)) {
    eventSource.close();
    onIngestionComplete(status);
  }
};

eventSource.onerror = () => {
  eventSource.close();
};
```

---

## 4. Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|---|---|---|
| `202` | Accepted | Ingestion started — monitor via task ID |
| `400` | Bad request | Confluence page could not be fetched (invalid URL, auth failure, network error) |
| `403` | Forbidden | User does not have editor access to the project |
| `404` | Not found | Project not found, or no pages found at the specified URL |

### Error Response Format

```json
{
  "detail": "Failed to fetch Confluence page: 401 Unauthorized"
}
```

### Common Error Scenarios

| Scenario | HTTP Code | `detail` Message |
|---|---|---|
| Invalid/expired token | `400` | `"Failed to fetch Confluence page: 401 Client Error"` |
| Page does not exist | `404` | `"No pages found at the specified URL"` |
| URL cannot be parsed | `400` | `"Failed to fetch Confluence page: Could not parse..."` |
| User lacks project access | `403` | `"User does not have editor role..."` |

---

## 5. Complete Integration Example

### React/TypeScript — Docupedia Ingestion Component

```tsx
import React, { useState } from "react";

const API_BASE = "/api/v1";

interface TaskProgress {
  task_id: string;
  status: string;
  total_files: number;
  processed_files: number;
  results: Array<{
    document_id: string;
    status: string;
    chunks_created: number;
    errors: string[];
  }>;
  errors: string[];
}

export function DocupediaIngest({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [includeChildren, setIncludeChildren] = useState(false);
  const [imageHandling, setImageHandling] = useState("llm_describe");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: Start ingestion ──────────────────────────────
  async function startIngestion() {
    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/documents/confluence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": getCurrentUserId(),
          },
          body: JSON.stringify({
            url,
            token,
            include_children: includeChildren,
            image_handling: imageHandling,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setTaskId(data.task_id);

      // Start monitoring via SSE
      monitorProgress(data.task_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Monitor progress via SSE ─────────────────────
  function monitorProgress(taskId: string) {
    const es = new EventSource(
      `${API_BASE}/projects/${projectId}/documents/tasks/${taskId}/stream`
    );

    es.onmessage = (event) => {
      const status: TaskProgress = JSON.parse(event.data);
      setProgress(status);

      if (["completed", "completed_with_errors", "failed"].includes(status.status)) {
        es.close();
      }
    };

    es.onerror = () => {
      es.close();
      // Fall back to polling
      pollProgress(taskId);
    };
  }

  // ── Fallback: Poll progress ──────────────────────────────
  async function pollProgress(taskId: string) {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE}/projects/${projectId}/documents/tasks/${taskId}`,
          {
            headers: { "X-User-ID": getCurrentUserId() },
          }
        );
        const status: TaskProgress = await response.json();
        setProgress(status);

        if (["completed", "completed_with_errors", "failed"].includes(status.status)) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  }

  // ── Render ───────────────────────────────────────────────
  const isComplete = progress?.status === "completed";
  const isFailed = progress?.status === "failed";
  const isProcessing = progress?.status === "processing";

  return (
    <div>
      <h3>Ingest from Docupedia</h3>

      {/* Input form */}
      <input
        placeholder="Docupedia page URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <input
        type="password"
        placeholder="Personal Access Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={includeChildren}
          onChange={(e) => setIncludeChildren(e.target.checked)}
        />
        Include child pages
      </label>
      <select
        value={imageHandling}
        onChange={(e) => setImageHandling(e.target.value)}
      >
        <option value="llm_describe">Describe images with AI</option>
        <option value="skip">Skip images</option>
      </select>

      <button onClick={startIngestion} disabled={loading || !url || !token}>
        {loading ? "Starting..." : "Start Ingestion"}
      </button>

      {/* Error display */}
      {error && <div className="error">{error}</div>}

      {/* Progress display */}
      {progress && (
        <div>
          <p>
            Status: <strong>{progress.status}</strong> —{" "}
            {progress.processed_files}/{progress.total_files} pages
          </p>
          {progress.results.map((r) => (
            <div key={r.document_id}>
              {r.status === "success" ? "✅" : "❌"} {r.document_id} —{" "}
              {r.chunks_created} chunks
            </div>
          ))}
          {progress.errors.length > 0 && (
            <div className="error">
              Errors: {progress.errors.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getCurrentUserId(): string {
  // Return from your auth/state management
  return "your-user-id";
}
```

---

## Appendix: API Quick Reference

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/v1/projects/{id}/documents/confluence` | Ingest Docupedia pages (returns task ID) | `X-User-ID` + token in body |
| `GET` | `/api/v1/projects/{id}/documents/tasks/{taskId}` | Poll ingestion progress | `X-User-ID` |
| `GET` | `/api/v1/projects/{id}/documents/tasks/{taskId}/stream` | SSE ingestion progress | `X-User-ID` |
