# SharePoint Integration — Frontend Developer Guide

**Date:** March 5, 2026  
**Version:** 1.0  
**Backend API Version:** v1

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Request Headers](#3-request-headers)
4. [Token Rotation](#4-token-rotation)
5. [API Endpoints](#5-api-endpoints)
   - [5.1 List Files](#51-list-files)
   - [5.2 Ingest Files](#52-ingest-files)
   - [5.3 Check File Status](#53-check-file-status)
   - [5.4 Monitor Ingestion Progress](#54-monitor-ingestion-progress)
6. [Error Handling](#6-error-handling)
7. [Complete Integration Example](#7-complete-integration-example)
8. [Environment Variables](#8-environment-variables)

---

## 1. Overview

The RAG-as-a-Service platform supports ingesting files directly from SharePoint document libraries. The integration uses Microsoft Graph API under the hood and requires the frontend to obtain a SharePoint OAuth 2.0 access token via the standard Microsoft login flow, then pass it in every request header.

### What the Frontend Does

1. Authenticates the user with Microsoft to get a **SharePoint access token**
2. Passes the token in every SharePoint API call
3. Persists and rotates tokens from API responses
4. Monitors ingestion progress via polling or SSE

### What the Backend Does

1. Validates the SharePoint token against the target site
2. Refreshes expired tokens server-side (if refresh token + client credentials are configured)
3. Lists files, downloads them, and feeds them into the RAG pipeline
4. Returns updated tokens in every response for the frontend to persist

---

## 2. Authentication Flow

The frontend must obtain a SharePoint OAuth 2.0 token from Microsoft. This is **separate** from any internal application JWT.

### Recommended: MSAL.js in the Browser

Use [@azure/msal-browser](https://www.npmjs.com/package/@azure/msal-browser) to authenticate:

```javascript
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "YOUR_AZURE_APP_CLIENT_ID",  // Same app registration as the backend
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// Scopes required for SharePoint file access via Graph API
const sharePointScopes = [
  "Sites.ReadWrite.All"
];

async function getSharePointToken() {
  try {
    // Try silent token acquisition first
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      const response = await msalInstance.acquireTokenSilent({
        scopes: sharePointScopes,
        account,
      });
      return response;
    }
    // Fall back to popup login
    return await msalInstance.acquireTokenPopup({ scopes: sharePointScopes });
  } catch (error) {
    // Interactive login required
    return await msalInstance.acquireTokenPopup({ scopes: sharePointScopes });
  }
}
```

### What You Get from MSAL

```javascript
const tokenResponse = await getSharePointToken();

// These are the two values you need:
const accessToken  = tokenResponse.accessToken;   // Short-lived (~1 hour)
// Note: MSAL.js manages refresh tokens internally for PublicClientApplication.
// For server-side refresh, the backend needs a refresh token. See Section 3.
```

> **Note:** `PublicClientApplication` (browser) doesn't expose refresh tokens directly. If you need server-side token refresh, use the **authorization code flow** where the frontend sends an auth code to the backend, and the backend exchanges it for tokens. Alternatively, the frontend can call `acquireTokenSilent()` before every request to ensure a fresh token.

---

## 3. Request Headers

Every SharePoint API call requires these custom headers:

| Header | Required | Description |
|---|---|---|
| `sharepointaccesstoken` | **Yes** | Microsoft Graph API access token (Bearer token value only — no "Bearer " prefix) |
| `sprefreshtoken` | No (recommended) | Microsoft refresh token for server-side token renewal. If not provided, the frontend must handle all token refresh. |
| `X-User-ID` | **Yes** | Standard ragaas tenant/user identification header |
| `Content-Type` | **Yes** | `application/json` for all SharePoint endpoints |

### Example Headers

```
POST /api/v1/projects/proj_123/sharepoint/list-files HTTP/1.1
Content-Type: application/json
X-User-ID: tenant_abc
sharepointaccesstoken: EwBgA8l6BAAU6k7...
sprefreshtoken: M.C3_BAY.-CfKs...
```

---

## 4. Token Rotation

**Critical:** Every SharePoint API response includes a `tokens` object with potentially-refreshed tokens. The frontend **must** persist these and use them for subsequent requests.

```json
{
  "tree": { ... },
  "tokens": {
    "access_token": "EwBgA8l6NEW...",
    "refresh_token": "M.C3_NEW..."
  }
}
```

### Frontend Token Management Pattern

```javascript
// Token store (use your state management: Redux, Zustand, Context, etc.)
let spTokens = {
  accessToken: null,
  refreshToken: null,
};

// Wrapper for all SharePoint API calls
async function callSharePointAPI(url, body) {
  // If no token stored, acquire one from MSAL
  if (!spTokens.accessToken) {
    const tokenResponse = await getSharePointToken();
    spTokens.accessToken = tokenResponse.accessToken;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": getCurrentTenantId(),
      "sharepointaccesstoken": spTokens.accessToken,
      "sprefreshtoken": spTokens.refreshToken || "",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    // Token expired and could not be refreshed server-side.
    // Re-authenticate with MSAL and retry.
    const tokenResponse = await getSharePointToken();
    spTokens.accessToken = tokenResponse.accessToken;
    return callSharePointAPI(url, body); // Retry once
  }

  const data = await response.json();

  // IMPORTANT: Persist rotated tokens from response
  if (data.tokens) {
    if (data.tokens.access_token)  spTokens.accessToken  = data.tokens.access_token;
    if (data.tokens.refresh_token) spTokens.refreshToken = data.tokens.refresh_token;
  }

  return data;
}
```

---

## 5. API Endpoints

All endpoints are scoped under `/api/v1/projects/{project_id}/sharepoint/`.

### 5.1 List Files

Browse the SharePoint document library tree.

**Endpoint:** `POST /api/v1/projects/{project_id}/sharepoint/list-files`

**Request Body:**

```json
{
  "sharepoint_url": "https://contoso.sharepoint.com/sites/MySite",
  "folder_path": "Documents/ProjectA",
  "deep_level": 2,
  "supported_extensions": [".pdf", ".docx", ".xlsx"]
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `sharepoint_url` | string | **Yes** | — | Full SharePoint site URL |
| `folder_path` | string | No | `null` (root) | Sub-folder path under Shared Documents |
| `deep_level` | integer | No | `2` | Folder recursion depth (0–10) |
| `supported_extensions` | string[] | No | `null` (all files) | File extension filter |

**Response (200):**

```json
{
  "tree": {
    "name": "Documents/ProjectA",
    "type": "folder",
    "children": [
      {
        "name": "requirements.pdf",
        "type": "file",
        "id": "01ABCDEF1234",
        "size": 1048576,
        "lastModified": "2026-03-01T10:30:00Z",
        "quickXorHash": "abc123def456==",
        "mimeType": "application/pdf"
      },
      {
        "name": "SubFolder",
        "type": "folder",
        "children": [
          {
            "name": "spec.docx",
            "type": "file",
            "id": "01ABCDEF5678",
            "size": 524288,
            "lastModified": "2026-03-02T14:00:00Z",
            "quickXorHash": "xyz789ghi012==",
            "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          }
        ]
      }
    ]
  },
  "tokens": {
    "access_token": "EwBgA8l6...",
    "refresh_token": "M.C3_BAY..."
  }
}
```

**Key fields in each file node:**

| Field | Description |
|---|---|
| `id` | SharePoint drive-item ID — pass this to the ingest endpoint |
| `quickXorHash` | Content hash — store this for change detection later |
| `size` | File size in bytes |
| `lastModified` | ISO 8601 timestamp |
| `mimeType` | MIME type of the file |

---

### 5.2 Ingest Files

Download selected files from SharePoint and process them through the RAG pipeline.

**Endpoint:** `POST /api/v1/projects/{project_id}/sharepoint/ingest`

**Response Code:** `202 Accepted` — processing happens in the background.

**Request Body:**

```json
{
  "sharepoint_url": "https://contoso.sharepoint.com/sites/MySite",
  "file_ids": ["01ABCDEF1234", "01ABCDEF5678"],
  "sharepoint_paths": null,
  "custom_metadata": {
    "department": "Engineering",
    "version": "2.1"
  },
  "processing_config": {
    "chunking_strategy": "docling",
    "image_handling": "llm_describe"
  }
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `sharepoint_url` | string | **Yes** | — | Full SharePoint site URL |
| `file_ids` | string[] | **Yes** | — | Drive-item IDs from the list-files response |
| `sharepoint_paths` | string[] | No | `null` | Optional file paths (parallel to `file_ids`). Path-based download is more reliable for some tenants. |
| `custom_metadata` | object | No | `{}` | Custom metadata to attach to every ingested document |
| `processing_config` | object | No | `null` | Override chunking/processing settings |

**Response (202):**

```json
{
  "task_id": "task_a1b2c3d4e5f6",
  "message": "SharePoint ingestion started for 2 file(s)",
  "status_url": "/api/v1/projects/proj_123/documents/tasks/task_a1b2c3d4e5f6",
  "total_files": 2,
  "tokens": {
    "access_token": "EwBgA8l6...",
    "refresh_token": "M.C3_BAY..."
  }
}
```

**Metadata stored with each document:**

Each ingested document automatically gets these `custom_metadata` fields:

```json
{
  "source_type": "sharepoint",
  "sharepoint_url": "https://contoso.sharepoint.com/sites/MySite",
  "sharepoint_file_id": "01ABCDEF1234",
  "sharepoint_path": "Documents/ProjectA/requirements.pdf",
  "quick_xor_hash": "abc123def456=="
}
```

Store `sharepoint_file_id` and `quick_xor_hash` on your side to use the check-status endpoint later.

---

### 5.3 Check File Status

Detect whether files have been modified on SharePoint since last ingestion — **without re-downloading them**.

**Endpoint:** `POST /api/v1/projects/{project_id}/sharepoint/check-status`

**Request Body:**

```json
{
  "sharepoint_url": "https://contoso.sharepoint.com/sites/MySite",
  "file_ids": ["01ABCDEF1234", "01ABCDEF5678", "01NOTFOUND00"],
  "stored_hashes": {
    "01ABCDEF1234": "abc123def456==",
    "01ABCDEF5678": "xyz789ghi012==",
    "01NOTFOUND00": "old_hash_value=="
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sharepoint_url` | string | **Yes** | Full SharePoint site URL |
| `file_ids` | string[] | **Yes** | Drive-item IDs to check |
| `stored_hashes` | object | **Yes** | Map of `file_id → quickXorHash` from last ingestion |

**Response (200):**

```json
{
  "files": [
    {
      "file_id": "01ABCDEF1234",
      "filename": "requirements.pdf",
      "current_hash": "abc123def456==",
      "stored_hash": "abc123def456==",
      "changed": false,
      "exists": true
    },
    {
      "file_id": "01ABCDEF5678",
      "filename": "spec.docx",
      "current_hash": "NEW_HASH_VALUE==",
      "stored_hash": "xyz789ghi012==",
      "changed": true,
      "exists": true
    },
    {
      "file_id": "01NOTFOUND00",
      "filename": null,
      "current_hash": null,
      "stored_hash": "old_hash_value==",
      "changed": true,
      "exists": false
    }
  ],
  "tokens": {
    "access_token": "EwBgA8l6...",
    "refresh_token": "M.C3_BAY..."
  }
}
```

**Recommended workflow:**

1. Call **check-status** with stored hashes
2. Filter files where `changed: true`
3. Call **ingest** with only the changed file IDs
4. Update stored hashes from the new ingestion metadata

---

### 5.4 Monitor Ingestion Progress

After calling the ingest endpoint, use the **existing** task monitoring endpoints:

#### Polling

```
GET /api/v1/projects/{project_id}/documents/tasks/{task_id}
```

**Response:**

```json
{
  "task_id": "task_a1b2c3d4e5f6",
  "status": "processing",
  "total_files": 2,
  "processed_files": 1,
  "results": [
    {
      "document_id": "doc_abc123",
      "status": "success",
      "chunks_created": 42,
      "vectors_stored": 42,
      "processing_time_ms": 3500,
      "errors": [],
      "warnings": []
    }
  ],
  "errors": [],
  "created_at": "2026-03-05T10:00:00Z",
  "completed_at": null
}
```

**Task status values:** `pending` → `processing` → `completed` | `completed_with_errors` | `failed`

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

  // Close when done
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

## 6. Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|---|---|---|
| `200` | Success | Process the response normally |
| `202` | Accepted (ingest) | Ingestion started — monitor via task ID |
| `400` | Bad request | Fix request body (invalid JSON, mismatched array lengths, etc.) |
| `401` | Unauthorized | SharePoint token expired and could not be refreshed. Re-authenticate with MSAL. |
| `404` | Not found | Project or task not found |
| `502` | Bad gateway | SharePoint/Graph API error (site unreachable, URL invalid, etc.) |

### Error Response Format

```json
{
  "detail": "SharePoint access token is invalid or expired and could not be refreshed. The frontend should re-initiate the OAuth flow."
}
```

### Handling 401 — Token Expired

```javascript
async function handleSharePointRequest(url, body) {
  const response = await callSharePointAPI(url, body);

  if (response.status === 401) {
    // Server-side refresh failed — need new tokens from MSAL
    console.log("SharePoint token expired, re-authenticating...");

    // Force interactive login (clear cached token)
    const tokenResponse = await msalInstance.acquireTokenPopup({
      scopes: sharePointScopes,
      prompt: "select_account",
    });

    spTokens.accessToken = tokenResponse.accessToken;
    spTokens.refreshToken = null; // MSAL.js manages this internally

    // Retry the original request
    return callSharePointAPI(url, body);
  }

  return response;
}
```

---

## 7. Complete Integration Example

### React Component — SharePoint File Browser + Ingest

```tsx
import React, { useState, useEffect } from "react";

const API_BASE = "/api/v1";

interface FileNode {
  name: string;
  type: "file" | "folder";
  id?: string;
  size?: number;
  lastModified?: string;
  quickXorHash?: string;
  mimeType?: string;
  children?: FileNode[];
}

export function SharePointBrowser({ projectId }: { projectId: string }) {
  const [tree, setTree] = useState<FileNode | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: Browse files ──────────────────────────────────
  async function browseFiles(sharePointUrl: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await callSharePointAPI(
        `${API_BASE}/projects/${projectId}/sharepoint/list-files`,
        {
          sharepoint_url: sharePointUrl,
          deep_level: 3,
          supported_extensions: [".pdf", ".docx", ".xlsx", ".pptx", ".txt"],
        }
      );
      setTree(data.tree);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Toggle file selection ─────────────────────────
  function toggleFile(fileId: string) {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }

  // ── Step 3: Ingest selected files ─────────────────────────
  async function ingestSelected(sharePointUrl: string) {
    if (selectedFiles.size === 0) return;
    setLoading(true);
    setError(null);

    try {
      const data = await callSharePointAPI(
        `${API_BASE}/projects/${projectId}/sharepoint/ingest`,
        {
          sharepoint_url: sharePointUrl,
          file_ids: Array.from(selectedFiles),
        }
      );
      setTaskId(data.task_id);
      monitorProgress(data.task_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 4: Monitor ingestion via SSE ─────────────────────
  function monitorProgress(taskId: string) {
    const es = new EventSource(
      `${API_BASE}/projects/${projectId}/documents/tasks/${taskId}/stream`
    );

    es.onmessage = (event) => {
      const status = JSON.parse(event.data);
      setProgress(status);

      if (["completed", "completed_with_errors", "failed"].includes(status.status)) {
        es.close();
      }
    };

    es.onerror = () => es.close();
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div>
      {/* URL input, file tree rendering, selection UI, ingest button, progress bar */}
      {error && <div className="error">{error}</div>}
      {progress && (
        <div>
          Status: {progress.status} — {progress.processed_files}/{progress.total_files}
        </div>
      )}
    </div>
  );
}
```

---

## 8. Environment Variables

The backend requires these environment variables for SharePoint integration:

| Variable | Required | Default | Description |
|---|---|---|---|
| `GRAPH_API_BASE_URL` | No | `https://graph.microsoft.com/v1.0` | Microsoft Graph API base URL |
| `SHAREPOINT_CLIENT_ID` | **Yes** (for server-side refresh) | — | Azure App Registration client ID |
| `SHAREPOINT_CLIENT_SECRET` | **Yes** (for server-side refresh) | — | Azure App Registration client secret |
| `SHAREPOINT_TENANT_ID` | **Yes** (for server-side refresh) | — | Azure AD tenant ID |
| `SHAREPOINT_SCOPE` | No | `https://graph.microsoft.com/.default` | OAuth2 scope |
| `SHAREPOINT_SUPPORTED_EXTENSIONS` | No | `null` (all files) | Comma-separated default file extension filter |

### Example `.env` Addition

```env
# SharePoint Integration
GRAPH_API_BASE_URL=https://graph.microsoft.com/v1.0
SHAREPOINT_CLIENT_ID=2e5aaba4-73f8-449c-b355-224f6f090551
SHAREPOINT_CLIENT_SECRET=your-client-secret-here
SHAREPOINT_TENANT_ID=0ae51e19-07c8-4e4b-bb6d-648ee58410f4
SHAREPOINT_SCOPE=https://graph.microsoft.com/.default
SHAREPOINT_SUPPORTED_EXTENSIONS=.pdf,.docx,.xlsx,.pptx,.txt,.md,.csv
```

> **Note:** If `SHAREPOINT_CLIENT_ID` and `SHAREPOINT_CLIENT_SECRET` are not set, server-side token refresh is disabled. The frontend must ensure tokens are always fresh before making requests.

---

## Appendix: API Quick Reference

| Method | Endpoint | Purpose | Auth Headers |
|---|---|---|---|
| `POST` | `/api/v1/projects/{id}/sharepoint/list-files` | Browse SharePoint folder tree | `sharepointaccesstoken`, `X-User-ID` |
| `POST` | `/api/v1/projects/{id}/sharepoint/ingest` | Ingest files (returns task ID) | `sharepointaccesstoken`, `X-User-ID` |
| `POST` | `/api/v1/projects/{id}/sharepoint/check-status` | Check file changes via hash | `sharepointaccesstoken`, `X-User-ID` |
| `GET` | `/api/v1/projects/{id}/documents/tasks/{taskId}` | Poll ingestion progress | `X-User-ID` |
| `GET` | `/api/v1/projects/{id}/documents/tasks/{taskId}/stream` | SSE ingestion progress | `X-User-ID` |
