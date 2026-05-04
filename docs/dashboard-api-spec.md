# Dashboard API Specification

This document specifies the backend endpoints required to power the **Dashboard** page (`/dashboard`) on the RAGaaS management frontend. It is the contract between the frontend (`src/pages/DashboardPage.tsx` and `src/services/api.ts`) and the backend.

The frontend currently renders a static shell with hard-coded `0` values for KPIs and no charts. This spec defines the data layer needed to make the dashboard fully live.

---

## 1. Overview

### 1.1 Goals

- Give every tenant a single landing page that summarizes their RAGaaS workspace at a glance.
- Surface KPIs, activity trends, top projects, recent sessions, and pipeline health.
- Keep the page snappy: target **p95 < 500ms** for the primary aggregate call.

### 1.2 Auth & tenant scoping

All endpoints below follow the existing conventions used throughout `src/services/api.ts`:

- **Header**: `X-User-ID: <tenant_id>` (required).
- **Optional**: `Authorization: Bearer <access_token>` when Azure AD is enabled (`VITE_USE_AZURE_AD=true`).
- **Tenant scoping**: every aggregation MUST be filtered server-side by the calling tenant. The frontend never passes a `tenant_id` in the body or query — the server reads it from the header.
- **Error model**: reuse the existing shape so the generic `request<T>()` helper in `src/services/api.ts` keeps working unchanged:

```json
{
  "detail": "Human-readable error message",
  "error_type": "optional_machine_readable_code"
}
```

### 1.3 Time ranges

Charts and deltas are driven by a `range` query parameter. Supported values:

| Value | Meaning |
|---|---|
| `7d`  | last 7 days |
| `30d` | last 30 days **(default)** |
| `90d` | last 90 days |

The server interprets ranges as rolling windows ending at "now" (UTC). For deltas, the **previous period** has the same length immediately preceding the current window (e.g. for `30d`, the delta compares days `-30..0` against `-60..-30`).

### 1.4 Caching

- `Cache-Control: private, max-age=60` recommended on all GET endpoints below.
- Server-side cache keyed by `(tenant_id, endpoint, range)` for ~60s is acceptable; freshness on the order of a minute is fine for a dashboard.
- Endpoints MUST be idempotent and side-effect-free (GET only).

---

## 2. Endpoints

### 2.1 `GET /api/v1/dashboard/overview` — primary aggregate

The single highest-priority endpoint. Powers the KPI strip, the recent-projects list, and the recent-sessions list in one round trip.

**Query params**

| Name | Type | Default | Notes |
|---|---|---|---|
| `range` | `7d \| 30d \| 90d` | `30d` | Drives `delta_*` fields and `sessions_in_range`. Counts of `total_*` are lifetime. |

**Response 200**

```ts
interface DashboardOverview {
  // Lifetime counts (not affected by range)
  total_projects: number;
  active_projects: number;
  total_documents: number;          // sum of documents across all tenant projects
  total_sessions_lifetime: number;

  // Range-scoped counts
  range: '7d' | '30d' | '90d';
  sessions_in_range: number;
  messages_in_range: number;
  tokens_in_range: number;          // total LLM tokens (prompt + completion)
  requests_in_range: number;        // count of query_logs entries in window

  // Period-over-period deltas (current range vs preceding range of same length)
  // Each delta is signed; negative means down. `_pct` is in [-1, +Infinity).
  delta_projects: number;
  delta_active_projects: number;
  delta_documents: number;
  delta_sessions: number;
  delta_sessions_pct: number;
  delta_tokens_pct: number;
  delta_requests_pct: number;

  // Inline lists (server caps both at 5 — frontend does not paginate here)
  recent_projects: RecentProjectSummary[];
  recent_sessions: RecentSessionSummary[];

  generated_at: string;             // ISO 8601, e.g. "2026-05-03T08:15:00Z"
}

interface RecentProjectSummary {
  project_id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  document_count: number;
  pipeline_type: string;            // e.g. "simple_rag", "agent"
  updated_at: string;               // ISO 8601
}

interface RecentSessionSummary {
  session_id: string;
  project_id: string;
  project_name: string;             // denormalized so the FE doesn't need a second call
  title: string | null;
  last_message_excerpt: string | null;  // ≤ 140 chars, plain text, server-truncated
  last_message_at: string;          // ISO 8601
  message_count: number;
}
```

**Example response**

```json
{
  "total_projects": 12,
  "active_projects": 9,
  "total_documents": 1843,
  "total_sessions_lifetime": 5421,
  "range": "30d",
  "sessions_in_range": 412,
  "messages_in_range": 3187,
  "tokens_in_range": 1284503,
  "requests_in_range": 3187,
  "delta_projects": 2,
  "delta_active_projects": 1,
  "delta_documents": 137,
  "delta_sessions": 64,
  "delta_sessions_pct": 0.184,
  "delta_tokens_pct": 0.092,
  "delta_requests_pct": 0.071,
  "recent_projects": [
    {
      "project_id": "proj_abc123",
      "name": "HR Knowledge Base",
      "status": "active",
      "document_count": 124,
      "pipeline_type": "simple_rag",
      "updated_at": "2026-05-02T14:33:11Z"
    }
  ],
  "recent_sessions": [
    {
      "session_id": "sess_xyz789",
      "project_id": "proj_abc123",
      "project_name": "HR Knowledge Base",
      "title": "Vacation policy lookup",
      "last_message_excerpt": "How many vacation days do I get in my first year?",
      "last_message_at": "2026-05-03T08:02:51Z",
      "message_count": 6
    }
  ],
  "generated_at": "2026-05-03T08:15:00Z"
}
```

**Errors**

- `400` — invalid `range` value.
- `401` — missing/invalid auth.
- `500` — `{ "detail": "Failed to aggregate dashboard overview", "error_type": "aggregation_error" }`

---

### 2.2 `GET /api/v1/dashboard/activity` — time series

Powers the activity-over-time chart (sessions, messages, tokens, cost as separate series).

**Query params**

| Name | Type | Default | Notes |
|---|---|---|---|
| `range` | `7d \| 30d \| 90d` | `30d` | |
| `granularity` | `day \| hour` | `day` for `30d`/`90d`, `hour` for `7d` | Server may override an unsupported combination and echo the actual granularity used. |

**Response 200**

```ts
interface DashboardActivityResponse {
  range: '7d' | '30d' | '90d';
  granularity: 'day' | 'hour';
  points: DashboardActivityPoint[];   // Ordered ascending by timestamp; gaps filled with zeros.
}

interface DashboardActivityPoint {
  timestamp: string;     // ISO 8601 — start of the bucket
  sessions: number;      // sessions created in this bucket
  messages: number;      // messages sent in this bucket
  tokens: number;        // total tokens in this bucket
  requests: number;      // query_logs entries in this bucket
}
```

**Example response (truncated)**

```json
{
  "range": "30d",
  "granularity": "day",
  "points": [
    { "timestamp": "2026-04-04T00:00:00Z", "sessions": 12, "messages": 87, "tokens": 41203, "requests": 87 },
    { "timestamp": "2026-04-05T00:00:00Z", "sessions": 18, "messages": 121, "tokens": 53884, "requests": 121 }
  ]
}
```

**Notes for the backend**

- Bucket boundaries should align to UTC day starts (or hour starts). The frontend will format to the user's local time.
- Always return a contiguous series — fill empty buckets with zeros so the chart line doesn't break.

---

### 2.3 `GET /api/v1/dashboard/top-projects` — ranked usage

Powers the "Top projects by usage" bar chart.

**Query params**

| Name | Type | Default | Notes |
|---|---|---|---|
| `range` | `7d \| 30d \| 90d` | `30d` | |
| `metric` | `sessions \| messages \| tokens \| requests` | `sessions` | Frontend toggle. |
| `limit` | integer, 1–10 | `5` | Server clamps to 10. |

**Response 200**

```ts
interface TopProjectsResponse {
  range: '7d' | '30d' | '90d';
  metric: 'sessions' | 'messages' | 'tokens' | 'requests';
  projects: TopProjectUsage[];        // Ordered descending by `value`.
}

interface TopProjectUsage {
  project_id: string;
  name: string;
  pipeline_type: string;
  value: number;                     // sessions / messages / tokens / requests, depending on `metric`
  share_of_total: number;            // 0..1 — value / sum(all tenant projects in range)
}
```

**Example response**

```json
{
  "range": "30d",
  "metric": "sessions",
  "projects": [
    { "project_id": "proj_abc123", "name": "HR Knowledge Base", "pipeline_type": "simple_rag", "value": 184, "share_of_total": 0.45 },
    { "project_id": "proj_def456", "name": "Engineering Docs",  "pipeline_type": "agent",       "value": 122, "share_of_total": 0.30 }
  ]
}
```

---

### 2.4 `GET /api/v1/dashboard/pipeline-health` — last 24h health

Powers the optional pipeline-health tile. Sourced from query/trace logs.

**Query params** — none for v1 (always last 24h). Future: add `range`.

**Response 200**

```ts
interface PipelineHealthResponse {
  window_hours: 24;                  // Hard-coded for v1
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  error_rate: number;                // failed / total, in [0, 1]; 0 when total = 0
  avg_latency_ms: number | null;     // null when total = 0
  p50_latency_ms: number | null;
  p95_latency_ms: number | null;
  generated_at: string;
}
```

**Example response**

```json
{
  "window_hours": 24,
  "total_queries": 1284,
  "successful_queries": 1271,
  "failed_queries": 13,
  "error_rate": 0.0101,
  "avg_latency_ms": 842,
  "p50_latency_ms": 612,
  "p95_latency_ms": 2103,
  "generated_at": "2026-05-03T08:15:00Z"
}
```

**Empty-state contract**

When the tenant has zero queries in the last 24h, return all counts as `0` and all latencies as `null` — the frontend will render a "No activity yet" placeholder. Do **not** return `404`.

---

## 3. Aggregation source-of-truth notes

These are guidance for the backend implementer; align with the actual data model.

| Frontend field | Source |
|---|---|
| `total_projects`, `active_projects`, `recent_projects` | `projects` collection, filtered by `tenant_id` and `members.user_id` (per `getUserRole` rules in `src/types/index.ts`). |
| `total_documents` | `documents` collection grouped by `project_id`, then summed for the tenant's project IDs. |
| `total_sessions_lifetime`, `sessions_in_range`, `recent_sessions` | `sessions` collection, filtered by `tenant_id`. `last_message_excerpt` comes from the most recent message in the session. |
| `messages_in_range` | Sum of message counts across all tenant sessions where `created_at` ∈ range. |
| `tokens_in_range`, `requests_in_range` | Aggregated from the `query_logs` collection (`total_tokens` sum and document count). |
| `pipeline-health` metrics | `query_logs` / `pipeline_traces` (whatever powers `PipelineTraceResponse` today). |

---

## 4. Pagination

Dashboard endpoints intentionally do **not** paginate:

- `recent_projects` and `recent_sessions` are server-capped at 5 each.
- `top-projects` is capped at 10.
- `activity.points` is bounded by `range` × `granularity` (max 90 daily points or 168 hourly points for `7d`).

For "see all" actions, the dashboard links to existing paginated endpoints — do not invent new list endpoints here:

- Projects → `GET /api/v1/projects` (already paginated).
- Sessions → `GET /api/v1/projects/{project_id}/sessions` (already paginated).

See `docs/api-pagination-audit.md` for the broader pagination conventions.

---

## 5. Performance budget

| Endpoint | Target p95 | Notes |
|---|---|---|
| `/dashboard/overview` | **< 500ms** | Blocks first paint of KPI strip + lists. Should be a single composed aggregation, not 5 sequential queries. |
| `/dashboard/activity` | < 800ms | Loaded in parallel with overview. |
| `/dashboard/top-projects` | < 600ms | Loaded in parallel with overview. |
| `/dashboard/pipeline-health` | < 600ms | Loaded last; non-blocking. |

If `/overview` cannot meet 500ms with live aggregation, prefer a 60s server-side cache over splitting into more endpoints — the FE expects a single overview call.

---

## 6. Phased rollout

The frontend will ship in matching phases so partial backend availability still yields a useful dashboard.

| Phase | Backend deliverable | Frontend unlock |
|---|---|---|
| **Phase 1** | `/dashboard/overview` | KPI strip with deltas, recent projects list, recent sessions list. (Replaces all four hard-coded `0` cards in `DashboardPage.tsx`.) |
| **Phase 2** | `/dashboard/activity` + `/dashboard/top-projects` | Activity line chart + top-projects bar chart, time-range selector becomes meaningful. |
| **Phase 3** | `/dashboard/pipeline-health` | Pipeline health tile (24h success/error/latency rollup). |

Each phase is independently shippable.

---

## 7. Frontend integration checklist

To keep the contract honest, the frontend will add the following to `src/services/api.ts` under a new `// ============ Dashboard ============` section. These signatures are the source of truth for naming alignment:

```ts
async getDashboardOverview(range: '7d' | '30d' | '90d' = '30d'): Promise<DashboardOverview>;

async getDashboardActivity(
  range: '7d' | '30d' | '90d' = '30d',
  granularity?: 'day' | 'hour'
): Promise<DashboardActivityResponse>;

async getTopProjects(
  range: '7d' | '30d' | '90d' = '30d',
  metric: 'sessions' | 'messages' | 'tokens' | 'requests' = 'sessions',
  limit: number = 5
): Promise<TopProjectsResponse>;

async getPipelineHealth(): Promise<PipelineHealthResponse>;
```

Corresponding TypeScript types will live in `src/types/dashboard.ts` and be re-exported from `src/types/index.ts`.

Charting will use **`chart.js`** + **`react-chartjs-2`** (new dependencies, to be added). Colors will come from FROK CSS variables (`var(--g-blue-50)`, `var(--g-green-50)`, etc.) per `CLAUDE.md`.

---

## 8. Open items for backend confirmation

1. Token aggregation source — `tokens_in_range` is summed from `query_logs.total_tokens`. Confirm coverage parity with assistant responses streamed through the agent path.
2. Hourly granularity for `7d` — confirm the backend can produce hourly buckets without a prohibitive query cost. If not, fall back to `day` for all ranges and the FE will handle it via the echoed `granularity` field.
3. `pipeline-health` source — is `query_logs` / `pipeline_traces` indexed on `(tenant_id, created_at)`? Required to hit the 600ms p95.
4. Authorization — any admin-vs-tenant distinction for the dashboard, or is it always the calling tenant's own data? (v1 assumes the latter.)

> **Note (v1 backend decision):** Cost reporting was deferred. All `cost_*` fields originally
> drafted in this spec have been replaced with `requests_*` (count of `query_logs` entries) until
> the chat service populates `total_cost` on `QueryLog`. Adding cost later will be an additive,
> non-breaking change.
