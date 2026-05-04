# API Pagination Audit

This document audits the frontend API usage for list-returning endpoints and identifies where backend pagination would improve page load speed, search responsiveness, and scalability.

The frontend source of truth for this audit is:

- `src/services/api.ts`
- `src/types/index.ts`
- Actual call sites in `src/pages`, `src/components`, and `src/widget`

## Executive Summary

Several core endpoints already support pagination, but the frontend does not always use it beyond the first page. Those are frontend follow-up items, not backend blockers.

The highest-priority backend gaps are:

- `GET /api/v1/projects/{project_id}/sessions/search`
- `GET /api/v1/projects/{project_id}/sessions/{session_id}/messages`
- `GET /api/v1/projects/summary`

These endpoints can return unbounded data, are used in common workflows, and currently force the frontend to either render all results or silently truncate history.

## Recommended Pagination Patterns

Use existing page-based pagination for table/grid data, matching the current frontend response types:

```ts
{
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
```

If the endpoint already has a domain-specific key, keep it for consistency with existing types:

```ts
{
  sessions: ChatSession[];
  total: number;
  page: number;
  page_size: number;
}
```

For chat messages, prefer cursor pagination because new messages are appended in real time and offset-based pagination can drift:

```ts
GET /api/v1/projects/{project_id}/sessions/{session_id}/messages?limit=50&before_message_id=...

{
  messages: ChatMessage[];
  has_more: boolean;
  next_cursor: string | null;
}
```

## Priority 1: Backend Work Needed

### Session Search

Endpoint:

```http
GET /api/v1/projects/{project_id}/sessions/search?q={query}
```

Frontend API method:

```ts
searchSessions(projectId: string, query: string): Promise<SessionListResponse>
```

Current frontend usage:

- `src/pages/ProjectDetailPage.tsx`
- `src/widget/WidgetChatContainer.tsx`
- Rendered by `src/components/chat/ChatSessionList.tsx`

Current behavior:

- The frontend calls this endpoint while the user types in the chat session search field.
- Results replace the current session list.
- The whole returned result set is rendered with normal array mapping, with no virtualization.
- There are no `page`, `page_size`, `limit`, `offset`, or cursor params in the client method.

Backend recommendation:

Add page-based pagination:

```http
GET /api/v1/projects/{project_id}/sessions/search?q={query}&page=1&page_size=20
```

Recommended response:

```ts
{
  sessions: ChatSession[];
  total: number;
  page: number;
  page_size: number;
}
```

Frontend follow-up:

- Use "load more" or infinite scroll for search results.
- Reset to page 1 when the search query changes.
- Append results when loading the next page.

### Session Messages

Endpoint:

```http
GET /api/v1/projects/{project_id}/sessions/{session_id}/messages?limit=50
```

Frontend API method:

```ts
getSessionMessages(
  projectId: string,
  sessionId: string,
  limit: number = 50
): Promise<{ messages: ChatMessage[]; session_id: string }>
```

Current frontend usage:

- `src/pages/ProjectDetailPage.tsx`
- `src/widget/WidgetChatContainer.tsx`
- Rendered by `src/components/chat/ChatInterface.tsx`

Current behavior:

- The frontend loads messages when a session is selected.
- Only `limit` is supported.
- Long conversations are effectively capped at the most recent 50 messages.
- There is no way for the frontend to request older history.

Backend recommendation:

Add cursor pagination based on message ordering:

```http
GET /api/v1/projects/{project_id}/sessions/{session_id}/messages?limit=50&before_message_id={message_id}
```

Recommended response:

```ts
{
  session_id: string;
  messages: ChatMessage[];
  has_more: boolean;
  next_cursor: string | null;
}
```

Notes:

- Return messages in chronological order for direct rendering.
- `before_message_id` should return messages older than the given message.
- If the first page returns the latest 50 messages, `next_cursor` can be the oldest returned message ID.

Frontend follow-up:

- Add a "Load older messages" action at the top of the chat transcript.
- Prepend older messages into the current list.
- Preserve scroll position after prepending.

### Project Summary Picker

Endpoint:

```http
GET /api/v1/projects/summary
```

Frontend API method:

```ts
getProjectsSummary(): Promise<ProjectSummary[]>
```

Current frontend usage:

- `src/components/pipeline/PipelinePropertyPanel.tsx`

Current behavior:

- Used by the pipeline builder for selecting another project in project-routing nodes.
- The endpoint returns all available project summaries.
- The frontend filters locally.
- This can become expensive for tenants with many projects.

Backend recommendation:

Prefer a typeahead endpoint:

```http
GET /api/v1/projects/summary?q={query}&limit=20
```

Recommended response:

```ts
{
  projects: ProjectSummary[];
  total?: number;
  limit: number;
}
```

Alternative page-based response:

```http
GET /api/v1/projects/summary?q={query}&page=1&page_size=20
```

```ts
{
  projects: ProjectSummary[];
  total: number;
  page: number;
  page_size: number;
}
```

Frontend follow-up:

- Replace local filtering with server-driven typeahead.
- Fetch only when the project picker is opened or the search term changes.

## Priority 2: Backend Pagination Useful At Scale

### Project Templates

Endpoint:

```http
GET /api/v1/projects/templates
```

Frontend API method:

```ts
listTemplates(category?: string): Promise<TemplateListResponse>
```

Current frontend usage:

- `src/components/projects/CreateProjectDialog.tsx`

Current behavior:

- Templates load when the create-project dialog opens in template mode.
- The catalog is filtered client-side by category.
- This is currently acceptable if the template catalog stays small.

Backend recommendation:

Add optional pagination and keep the existing category filter:

```http
GET /api/v1/projects/templates?category=rag&page=1&page_size=20
```

Recommended response:

```ts
{
  templates: TemplateInfo[];
  total: number;
  page: number;
  page_size: number;
}
```

### Project Members

Endpoint:

```http
GET /api/v1/projects/{project_id}/members
```

Frontend API method:

```ts
listMembers(projectId: string): Promise<ProjectMemberResponse[]>
```

Current frontend usage:

- `src/pages/ProjectDetailPage.tsx`

Current behavior:

- Loaded when the Members tab opens.
- Usually small, but unbounded for enterprise-scale projects.

Backend recommendation:

Add page-based pagination:

```http
GET /api/v1/projects/{project_id}/members?page=1&page_size=20
```

Recommended response:

```ts
{
  members: ProjectMemberResponse[];
  total: number;
  page: number;
  page_size: number;
}
```

### MCP Servers

Endpoint:

```http
GET /api/v1/projects/{project_id}/mcp-servers
```

Frontend API method:

```ts
listMcpServers(projectId: string): Promise<MCPServerConfig[]>
```

Current frontend usage:

- `src/components/mcp/McpServersPanel.tsx`

Current behavior:

- Loaded when the MCP Servers tab opens.
- Rendered in a table.
- Usually small, but unbounded in principle.

Backend recommendation:

Add page-based pagination:

```http
GET /api/v1/projects/{project_id}/mcp-servers?page=1&page_size=20
```

Recommended response:

```ts
{
  servers: MCPServerConfig[];
  total: number;
  page: number;
  page_size: number;
}
```

## Already Paginated Backend Endpoints

These endpoints already support pagination or equivalent limiting. Backend work is not required for pagination, though frontend work may still be needed.

### Projects

Endpoint:

```http
GET /api/v1/projects?page=1&page_size=20&status=active
```

Frontend API method:

```ts
listProjects(page = 1, pageSize = 20, status?: string): Promise<ProjectListResponse>
```

Frontend usage:

- `src/pages/ProjectsPage.tsx`

Current frontend issue:

- The page requests `page=1&page_size=50`.
- It does not fetch later pages.
- Search is client-side over only the loaded page.

Frontend follow-up:

- Add a pager or load-more control.
- Consider backend search/filter support if project counts grow.

### Documents

Endpoint:

```http
GET /api/v1/projects/{project_id}/documents?page=1&page_size=20&status=completed
```

Frontend API method:

```ts
listDocuments(
  projectId: string,
  page = 1,
  pageSize = 20,
  status?: string
): Promise<DocumentListResponse>
```

Frontend usage:

- `src/pages/ProjectDetailPage.tsx`

Current frontend issue:

- The frontend uses default pagination only, so it loads page 1 with 20 documents.
- There is no document pager in the UI.
- While any document is processing, the page polls `listDocuments` every 3 seconds.

Frontend follow-up:

- Add table pagination.
- Keep document status filters server-side.
- Avoid re-fetching the full document list during processing.

Backend improvement to consider:

Add a lightweight processing-status endpoint:

```http
GET /api/v1/projects/{project_id}/documents/processing-status
```

Potential response:

```ts
{
  documents: Array<{
    document_id: string;
    processing_status: ProcessingStatus;
    processing_error?: string;
    last_updated: string;
  }>;
}
```

This would let the frontend poll only changing status fields instead of the full document list.

### Sessions

Endpoint:

```http
GET /api/v1/projects/{project_id}/sessions?page=1&page_size=20&user_id={user_id}
```

Frontend API method:

```ts
getSessions(
  projectId: string,
  page = 1,
  pageSize = 20,
  userId?: string
): Promise<SessionListResponse>
```

Frontend usage:

- `src/pages/ProjectDetailPage.tsx`
- `src/widget/WidgetChatContainer.tsx`

Current frontend issue:

- The frontend loads the default first page only.
- There is no load-more behavior in `ChatSessionList`.

Frontend follow-up:

- Add load-more or infinite scroll.
- Preserve selected session while appending newer/older pages.

### Document Chunks

Endpoint:

```http
GET /api/v1/projects/{project_id}/documents/{document_id}/chunks?skip=0&limit=50
```

Frontend API method:

```ts
getDocumentChunks(
  projectId: string,
  documentId: string,
  skip = 0,
  limit = 50
): Promise<{ chunks: DocumentChunk[]; total: number }>
```

Frontend usage:

- Not currently used.

Backend status:

- Supports `skip` and `limit`.
- No backend work required unless a future chunks viewer needs cursor pagination.

### SQL Query Audit Log

Endpoint:

```http
GET /api/v1/projects/{project_id}/database-connection/audit-log?limit=10&offset=0
```

Frontend API method:

```ts
getQueryAuditLog(
  projectId: string,
  params?: { session_id?: string; limit?: number; offset?: number }
): Promise<AuditLogResponse>
```

Frontend usage:

- `src/components/database/DatabaseConnection.tsx`

Backend status:

- Already supports `limit` and `offset`.
- No backend work required.

### Admin Projects

Endpoint:

```http
GET /api/v1/admin/projects?page=1&page_size=20&status=active
```

Frontend API method:

```ts
adminListProjects(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}): Promise<AdminProjectListResponse>
```

Frontend usage:

- `src/pages/AdminPage.tsx`

Backend status:

- Already paginated.
- No backend work required.

### Admin Quota Requests

Endpoint:

```http
GET /api/v1/admin/quota-requests?page=1&page_size=10&status=pending
```

Frontend API method:

```ts
adminListQuotaRequests(params?: {
  page?: number;
  page_size?: number;
  status?: QuotaRequestStatus;
}): Promise<QuotaRequestListResponse>
```

Frontend usage:

- `src/pages/AdminPage.tsx`

Backend status:

- Already paginated.
- No backend work required.

## No Pagination Recommended

These endpoints are single-resource, fixed-shape, or bounded catalogs where pagination is not the right optimization.

| API method | Reason |
| --- | --- |
| `getProject` | Single project resource |
| `getDocument` | Single document resource |
| `getSession` | Single session resource |
| `getWidgetConfig` | Single config object |
| `getEmbedCode` | Single generated embed-code payload |
| `getDatabaseConnection` | Single database config |
| `getPdfBackend` | Small backend catalog |
| `getProjectLLMModels` | Bounded model catalog; cache if payload becomes large |
| `getPipelineMetadata` | Bounded metadata catalog; cache or split endpoint if measured large |
| `getUploadTaskStatus` | Single task status |
| `getPipelineTrace` | Single trace payload |
| `healthCheck` | Fixed health payload |
| `introspectSchema` | Expensive operation, but not naturally page-based in the current UI |

## Frontend UX Follow-up After Backend Changes

Use a mixed pagination strategy:

- Pager with page size for tables and grids: Projects, Documents, Members, MCP Servers, Templates, Admin tables, Audit Log.
- Load more or infinite scroll for chat-style lists: Sessions and Session Search.
- "Load older messages" at the top of the chat transcript for Session Messages.
- Server-driven typeahead for the Project Summary picker in the pipeline builder.

## Frontend Contract Changes Required

The selected backend implementation will use wrapped paginated response shapes for Priority 1 and Priority 2 endpoints. This is a breaking client contract change for endpoints that currently return bare arrays.

### Shared Type Updates

Add or update frontend response types in `src/types/index.ts`:

```ts
type PaginatedResponse<TItemsKey extends string, TItem> = {
  [K in TItemsKey]: TItem[];
} & {
  total: number;
  page: number;
  page_size: number;
};

type SessionMessagesResponse = {
  session_id: string;
  messages: ChatMessage[];
  has_more: boolean;
  next_cursor: string | null;
};

type ProjectSummaryListResponse = PaginatedResponse<"projects", ProjectSummary>;
type TemplateListResponse = PaginatedResponse<"templates", TemplateInfo>;
type ProjectMemberListResponse = PaginatedResponse<"members", ProjectMemberResponse>;
type MCPServerListResponse = PaginatedResponse<"servers", MCPServerConfig>;
```

If TypeScript mapped types are too noisy for the current code style, define these as explicit interfaces instead.

### API Service Updates

Update `src/services/api.ts` methods to send pagination params and consume wrapped responses:

```ts
searchSessions(
  projectId: string,
  query: string,
  page = 1,
  pageSize = 20
): Promise<SessionListResponse>

getSessionMessages(
  projectId: string,
  sessionId: string,
  limit = 50,
  beforeMessageId?: string
): Promise<SessionMessagesResponse>

getProjectsSummary(params?: {
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<ProjectSummaryListResponse>

listTemplates(params?: {
  category?: TemplateCategory;
  page?: number;
  page_size?: number;
}): Promise<TemplateListResponse>

listMembers(
  projectId: string,
  page = 1,
  pageSize = 20
): Promise<ProjectMemberListResponse>

listMcpServers(
  projectId: string,
  page = 1,
  pageSize = 20
): Promise<MCPServerListResponse>
```

### Component Updates

- `src/pages/ProjectDetailPage.tsx`: Track session search page state, reset to page 1 when the search query changes, append sessions when loading more, and use `has_more`/`next_cursor` to support older chat message loading.
- `src/widget/WidgetChatContainer.tsx`: Mirror the session search and older-message loading behavior used by the main project chat view.
- `src/components/chat/ChatSessionList.tsx`: Add a load-more affordance for normal session lists and search results. Use `total`, `page`, and `page_size` to decide whether more sessions are available.
- `src/components/chat/ChatInterface.tsx`: Add a "Load older messages" action above the transcript. Call `getSessionMessages(..., beforeMessageId)` with the current `next_cursor`, prepend returned messages, and preserve scroll position.
- `src/components/pipeline/PipelinePropertyPanel.tsx`: Replace local filtering of all project summaries with server-driven typeahead using `q`, `page`, and `page_size`. Read options from `response.projects`.
- `src/components/projects/CreateProjectDialog.tsx`: Read templates from `response.templates` and add paging only if the template catalog becomes large enough to need UI pagination.
- `src/pages/ProjectDetailPage.tsx` Members tab: Read members from `response.members` and add table pagination controls backed by `page` and `page_size`.
- `src/components/mcp/McpServersPanel.tsx`: Read MCP servers from `response.servers` and add table pagination controls backed by `page` and `page_size`.

### Migration Notes

- `GET /api/v1/projects/{project_id}/sessions/search` already uses the `SessionListResponse` shape in the backend, so the frontend primarily needs to start passing `page` and `page_size`.
- `GET /api/v1/projects/{project_id}/sessions/{session_id}/messages` will keep returning messages in chronological order. The first call loads the latest messages; follow-up calls use `before_message_id=next_cursor` to fetch older messages.
- `GET /api/v1/projects/summary` will change from `ProjectSummary[]` to `{ projects, total, page, page_size }`.
- `GET /api/v1/projects/templates` will keep the `templates` key but add `page` and `page_size`.
- `GET /api/v1/projects/{project_id}/members` will change from `ProjectMemberResponse[]` to `{ members, total, page, page_size }`.
- `GET /api/v1/projects/{project_id}/mcp-servers` will change from `MCPServerConfig[]` to `{ servers, total, page, page_size }`.

## Backend Implementation Checklist

- Verify `sessions/search` pagination and update the frontend to pass `page` and `page_size`.
- Add cursor pagination to session messages.
- Add search or pagination to `projects/summary`.
- Consider pagination for templates, members, and MCP servers.
- Keep response shapes consistent with existing paginated endpoints.
- Return `total` for page-based endpoints where the UI needs a pager.
- Return `has_more` and `next_cursor` for cursor-based chat messages.
- Keep backward compatibility where practical by defaulting `page=1`, `page_size=20`, or `limit=50`.

